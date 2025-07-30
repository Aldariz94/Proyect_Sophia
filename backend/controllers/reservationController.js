const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');
const Loan = require('../models/Loan');

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

// Crear una nueva reserva
exports.createReservation = async (req, res) => {
    const { usuarioId, itemId, itemModel } = req.body;
    try {
        const user = await User.findById(usuarioId);
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });
        if (user.sancionHasta && new Date(user.sancionHasta) > new Date()) {
            return res.status(403).json({ msg: `Usuario sancionado hasta ${user.sancionHasta.toLocaleDateString()}`});
        }
        const ItemModel = itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
        const item = await ItemModel.findById(itemId);
        if (!item || item.estado !== 'disponible') {
            return res.status(400).json({ msg: 'Este ítem no está disponible para reservar.' });
        }
        const expiraEn = addBusinessDays(new Date(), 2);
        const newReservation = new Reservation({
            usuarioId,
            item: itemId,
            itemModel,
            expiraEn
        });
        item.estado = 'reservado';
        await item.save();
        await newReservation.save();
        res.status(201).json({ msg: 'Reserva creada exitosamente.', reservation: newReservation });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener todas las reservas activas (CORREGIDO)
exports.getActiveReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ estado: 'pendiente' })
            .populate('usuarioId', 'primerNombre primerApellido')
            .lean();

        const formattedReservations = await Promise.all(reservations.map(async (res) => {
            let itemDetails = null;
            if (res.itemModel === 'Exemplar') {
                const exemplar = await Exemplar.findById(res.item).populate('libroId', 'titulo');
                if (exemplar && exemplar.libroId) {
                    itemDetails = { name: `${exemplar.libroId.titulo} (Copia #${exemplar.numeroCopia})` };
                }
            } else if (res.itemModel === 'ResourceInstance') {
                const instance = await ResourceInstance.findById(res.item).populate('resourceId', 'nombre');
                if (instance && instance.resourceId) {
                    itemDetails = { name: `${instance.resourceId.nombre} (${instance.codigoInterno})` };
                }
            }
            return { ...res, itemDetails };
        }));

        res.json(formattedReservations);
    } catch (err) {
        console.error("Error en getActiveReservations:", err.message);
        res.status(500).send('Error del servidor');
    }
};

// Confirmar el retiro de una reserva
exports.confirmReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation || reservation.estado !== 'pendiente') {
            return res.status(404).json({ msg: 'Reserva no encontrada o ya no está pendiente.' });
        }
        let fechaVencimiento;
        if (reservation.itemModel === 'Exemplar') {
            fechaVencimiento = addBusinessDays(new Date(), 10);
        } else {
            fechaVencimiento = new Date();
            fechaVencimiento.setHours(18, 0, 0, 0);
        }
        const newLoan = new Loan({
            usuarioId: reservation.usuarioId,
            item: reservation.item,
            itemModel: reservation.itemModel,
            fechaVencimiento: fechaVencimiento,
        });
        await newLoan.save();
        const ItemModel = reservation.itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
        await ItemModel.findByIdAndUpdate(reservation.item, { estado: 'prestado' });
        reservation.estado = 'completada';
        await reservation.save();
        res.json({ msg: 'Reserva confirmada y préstamo creado exitosamente.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Cancelar una reserva pendiente
exports.cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation || reservation.estado !== 'pendiente') {
            return res.status(404).json({ msg: 'Reserva no encontrada o ya no está pendiente.' });
        }
        const ItemModel = reservation.itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
        await ItemModel.findByIdAndUpdate(reservation.item, { estado: 'disponible' });
        reservation.estado = 'cancelada';
        await reservation.save();
        res.json({ msg: 'Reserva cancelada exitosamente.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};