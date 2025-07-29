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

// Devolver un préstamo
exports.returnLoan = async (req, res) => {
    const { loanId } = req.params;
    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ msg: 'Préstamo no encontrado.' });

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
        await ItemModel.findByIdAndUpdate(loan.item, { estado: 'disponible' });
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
            .populate('usuarioId', 'primerNombre primerApellido correo')
            .populate('itemDetails');
        res.json(loans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener los préstamos de un usuario específico
exports.getLoansByUser = async (req, res) => {
    try {
        if (req.user.rol !== 'admin' && req.user.id !== req.params.userId) {
            return res.status(403).json({ msg: 'Acceso no autorizado.' });
        }
        const loans = await Loan.find({ usuarioId: req.params.userId }).populate('itemDetails');
        res.json(loans);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};