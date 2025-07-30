// backend/controllers/loanController.js
const Loan = require('../models/Loan');
const User = require('../models/User');
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');

// Función para calcular días hábiles
function addBusinessDays(startDate, days) {
    let currentDate = new Date(startDate);
    let addedDays = 0;
    while (addedDays < days) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Domingo, 6 = Sábado
            addedDays++;
        }
    }
    return currentDate;
}

// Crear un nuevo préstamo
exports.createLoan = async (req, res) => {
    const { usuarioId, itemId, itemModel } = req.body;
    try {
        const user = await User.findById(usuarioId);
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });
        if (user.sancionHasta && new Date(user.sancionHasta) > new Date()) {
            return res.status(403).json({ msg: `Usuario sancionado hasta ${user.sancionHasta.toLocaleDateString()}`});
        }
        const overdueLoans = await Loan.findOne({ usuarioId, estado: 'atrasado' });
        if (overdueLoans) {
            return res.status(403).json({ msg: 'El usuario tiene préstamos atrasados.' });
        }
        const activeLoans = await Loan.find({ usuarioId, estado: 'enCurso' }).countDocuments();
        if (user.rol !== 'profesor' && activeLoans >= 1) {
            return res.status(403).json({ msg: 'El usuario ya tiene un préstamo activo. Límite es 1.' });
        }
        
        const ItemModel = itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
        const item = await ItemModel.findById(itemId);
        if (!item || item.estado !== 'disponible') {
            return res.status(400).json({ msg: 'El ítem no está disponible para préstamo.' });
        }

        let fechaVencimiento;
        if (itemModel === 'Exemplar') {
            fechaVencimiento = addBusinessDays(new Date(), 10);
        } else { // ResourceInstance
            fechaVencimiento = new Date();
            fechaVencimiento.setHours(18, 0, 0, 0);
        }

        const newLoan = new Loan({ usuarioId, item: itemId, itemModel, fechaVencimiento });
        await newLoan.save();
        item.estado = 'prestado';
        await item.save();
        res.status(201).json(newLoan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Devolver un préstamo (VERSIÓN MODIFICADA)
exports.returnLoan = async (req, res) => {
    const { loanId } = req.params;
    const { newStatus = 'disponible', observaciones = '' } = req.body; // <-- Lee el nuevo campo

    // ==================================================
    // =====> AÑADE ESTA VALIDACIÓN AQUÍ <=====
    // ==================================================
    const allowedStatus = ['disponible', 'deteriorado', 'extraviado'];
    if (!allowedStatus.includes(newStatus)) {
        return res.status(400).json({ msg: 'Estado no válido.' });
    }
    // ==================================================


    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ msg: 'Préstamo no encontrado.' });

        // ... (lógica de devolución y sanción sin cambios)
        const fechaDevolucion = new Date();
        loan.fechaDevolucion = fechaDevolucion;

        if (fechaDevolucion > new Date(loan.fechaVencimiento)) {
            loan.estado = 'atrasado';
            const user = await User.findById(loan.usuarioId);
            const diasAtraso = Math.ceil((fechaDevolucion - new Date(loan.fechaVencimiento)) / (1000 * 60 * 60 * 24));
            const sancionHasta = new Date();
            sancionHasta.setDate(sancionHasta.getDate() + diasAtraso);
            user.sancionHasta = sancionHasta;
            await user.save();
        } else {
            loan.estado = 'devuelto';
        }
        await loan.save();
        
        const ItemModel = loan.itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
        
        // Actualiza tanto el estado como las observaciones del ítem
        await ItemModel.findByIdAndUpdate(loan.item, { 
            estado: newStatus,
            observaciones: observaciones
        });

        res.json({ msg: 'Préstamo devuelto exitosamente.', loan });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener todos los préstamos
exports.getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.find()
            .populate('usuarioId', 'primerNombre primerApellido')
            .lean(); 

        const formattedLoans = await Promise.all(loans.map(async (loan) => {
            let itemDetails = null;
            if (loan.itemModel === 'Exemplar') {
                const exemplar = await Exemplar.findById(loan.item).populate('libroId', 'titulo');
                if (exemplar && exemplar.libroId) {
                    itemDetails = { titulo: exemplar.libroId.titulo };
                }
            } else if (loan.itemModel === 'ResourceInstance') {
                const instance = await ResourceInstance.findById(loan.item).populate('resourceId', 'nombre');
                if (instance && instance.resourceId) {
                    itemDetails = { nombre: instance.resourceId.nombre };
                }
            }
            return { ...loan, itemDetails };
        }));

        res.json(formattedLoans);
    } catch (err) {
        console.error("Error en getAllLoans:", err.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener los préstamos de un usuario específico
exports.getLoansByUser = async (req, res) => {
    try {
        if (req.user.rol !== 'admin' && req.user.id !== req.params.userId) {
            return res.status(403).json({ msg: 'Acceso no autorizado.' });
        }
        const loans = await Loan.find({ usuarioId: req.params.userId }); 
        res.json(loans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Renovar un préstamo
exports.renewLoan = async (req, res) => {
    const { days } = req.body;
    if (!days || isNaN(parseInt(days)) || parseInt(days) <= 0) {
        return res.status(400).json({ msg: 'Por favor, proporciona un número válido de días para la renovación.' });
    }
    try {
        let loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ msg: 'Préstamo no encontrado.' });
        }
        if (loan.estado !== 'enCurso') {
            return res.status(400).json({ msg: 'Solo se pueden renovar préstamos "en curso".' });
        }
        const newDueDate = addBusinessDays(loan.fechaVencimiento, parseInt(days));
        loan = await Loan.findByIdAndUpdate(
            req.params.id,
            { $set: { fechaVencimiento: newDueDate } },
            { new: true }
        );
        res.json({ msg: `Préstamo renovado por ${days} días hábiles.`, loan });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener los préstamos del usuario autenticado
exports.getMyLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ 
            usuarioId: req.user.id, 
            estado: { $in: ['enCurso', 'atrasado'] } 
        }).lean();

        const populatedLoans = await Promise.all(loans.map(async (loan) => {
            let itemDetails = { name: 'Ítem no disponible', type: loan.itemModel };
            
            if (loan.itemModel === 'Exemplar') {
                const exemplar = await Exemplar.findById(loan.item).populate({
                    path: 'libroId',
                    select: 'titulo'
                });
                if (exemplar && exemplar.libroId) {
                    itemDetails.name = exemplar.libroId.titulo;
                }
            } else if (loan.itemModel === 'ResourceInstance') {
                const instance = await ResourceInstance.findById(loan.item).populate({
                    path: 'resourceId',
                    select: 'nombre'
                });
                if (instance && instance.resourceId) {
                    itemDetails.name = instance.resourceId.nombre;
                }
            }
            
            return {
                ...loan,
                itemDetails,
            };
        }));

        res.json(populatedLoans);
    } catch (err) {
        console.error("Error en getMyLoans:", err.message);
        res.status(500).send('Error del servidor');
    }
};