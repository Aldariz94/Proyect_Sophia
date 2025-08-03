const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const User = require('../models/User');
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');
const Reservation = require('../models/Reservation');
const { addBusinessDays } = require('../utils/dateUtils');

exports.createLoan = async (req, res) => {
    const { usuarioId, itemId, itemModel } = req.body;
    if (!mongoose.Types.ObjectId.isValid(usuarioId) || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ msg: 'ID de usuario o de ítem no válido.' });
    }
    try {
        const user = await User.findById(usuarioId);
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });
        if (user.sancionHasta && new Date(user.sancionHasta) > new Date()) {
            return res.status(403).json({ msg: `Usuario sancionado hasta ${user.sancionHasta.toLocaleDateString()}`});
        }
        if (user.rol !== 'profesor') {
            const activeLoansCount = await Loan.countDocuments({ usuarioId, estado: 'enCurso' });
            const activeReservationsCount = await Reservation.countDocuments({ usuarioId, estado: 'pendiente' });
            if ((activeLoansCount + activeReservationsCount) >= 1) {
                return res.status(403).json({ msg: 'El usuario ya ha alcanzado el límite de 1 ítem (entre préstamos y reservas activas).' });
            }
        }
        const ItemModel = itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
        const item = await ItemModel.findById(itemId);
        if (!item || item.estado !== 'disponible') {
            return res.status(400).json({ msg: 'El ítem no está disponible para préstamo.' });
        }
        let fechaVencimiento;
        if (itemModel === 'Exemplar') {
            fechaVencimiento = addBusinessDays(new Date(), 10);
        } else {
            const ahora = new Date();
            const deadlineHoy = new Date();
            deadlineHoy.setHours(17, 0, 0, 0);
            if (ahora > deadlineHoy) {
                fechaVencimiento = addBusinessDays(new Date(), 1);
                fechaVencimiento.setHours(17, 0, 0, 0);
            } else {
                fechaVencimiento = deadlineHoy;
            }
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

exports.returnLoan = async (req, res) => {
    const { loanId } = req.params;
    const { newStatus = 'disponible', observaciones = '' } = req.body;

    const allowedStatus = ['disponible', 'deteriorado', 'extraviado'];
    if (!allowedStatus.includes(newStatus)) {
        return res.status(400).json({ msg: 'Estado no válido.' });
    }
    if (!mongoose.Types.ObjectId.isValid(loanId)) {
        return res.status(400).json({ msg: 'ID de préstamo no válido.' });
    }

    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ msg: 'Préstamo no encontrado.' });

        const fechaDevolucion = new Date();
        loan.fechaDevolucion = fechaDevolucion;

        // Se comprueba si hubo atraso para aplicar la sanción
        if (fechaDevolucion > new Date(loan.fechaVencimiento)) {
            const user = await User.findById(loan.usuarioId);
            if (user) {
                const diasAtraso = Math.ceil((fechaDevolucion - new Date(loan.fechaVencimiento)) / (1000 * 60 * 60 * 24));
                const sancionHasta = new Date();
                sancionHasta.setDate(sancionHasta.getDate() + diasAtraso);
                user.sancionHasta = sancionHasta;
                await user.save();
            }
        }

        // --- INICIO DE LA CORRECCIÓN ---
        // Independientemente de si hubo atraso o no, el estado final del préstamo ahora es 'devuelto'.
        loan.estado = 'devuelto';
        // --- FIN DE LA CORRECCIÓN ---

        await loan.save();
        
        const ItemModel = loan.itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
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

// --- INICIO DE LA MODIFICACIÓN ---
exports.getAllLoans = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalLoans = await Loan.countDocuments();
        const totalPages = Math.ceil(totalLoans / limit);

        const loans = await Loan.find()
            .populate('usuarioId', 'primerNombre primerApellido')
            .sort({ fechaInicio: -1 })
            .skip(skip)
            .limit(limit)
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

        const statusOrder = { 'atrasado': 1, 'enCurso': 2, 'devuelto': 3 };
        formattedLoans.sort((a, b) => {
            if (statusOrder[a.estado] !== statusOrder[b.estado]) {
                return statusOrder[a.estado] - statusOrder[b.estado];
            }
            return new Date(b.fechaInicio) - new Date(a.fechaInicio);
        });

        res.json({
            docs: formattedLoans,
            totalDocs: totalLoans,
            totalPages,
            page
        });
    } catch (err) {
        console.error("Error en getAllLoans:", err.message);
        res.status(500).send('Error del servidor');
    }
};
// --- FIN DE LA MODIFICACIÓN ---

exports.getLoansByUser = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return res.status(400).json({ msg: 'ID de usuario no válido.' });
    }
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

exports.renewLoan = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'ID de préstamo no válido.' });
    }

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

exports.getMyLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ 
            usuarioId: req.user.id
        })
        .sort({ fechaInicio: -1 })
        .lean();

        const populatedLoans = await Promise.all(loans.map(async (loan) => {
            let itemDetails = { name: 'Ítem no disponible' };
            if (loan.itemModel === 'Exemplar') {
                const exemplar = await Exemplar.findById(loan.item).populate({ path: 'libroId', select: 'titulo' });
                if (exemplar && exemplar.libroId) itemDetails.name = exemplar.libroId.titulo;
            } else if (loan.itemModel === 'ResourceInstance') {
                const instance = await ResourceInstance.findById(loan.item).populate({ path: 'resourceId', select: 'nombre' });
                if (instance && instance.resourceId) itemDetails.name = instance.resourceId.nombre;
            }
            return { ...loan, itemDetails };
        }));

        res.json(populatedLoans);
    } catch (err) {
        console.error("Error en getMyLoans:", err.message);
        res.status(500).send('Error del servidor');
    }
};