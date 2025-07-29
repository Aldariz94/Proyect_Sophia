/*
 * ----------------------------------------------------------------
 * controllers/reservationController.js (CORREGIDO)
 * Se añade la importación de ResourceCRA.
 * ----------------------------------------------------------------
 */
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Exemplar = require('../models/Exemplar');
const ResourceCRA = require('../models/ResourceCRA'); // <- LÍNEA AÑADIDA
const { addBusinessDays } = require('../utils/dateUtils');

exports.createReservation = async (req, res) => {
    const { itemId, itemModel } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });
        if (user.sancionHasta && new Date(user.sancionHasta) > new Date()) {
            return res.status(403).json({ msg: `Usuario sancionado hasta ${user.sancionHasta.toLocaleDateString()}`});
        }

        const ItemModel = itemModel === 'Exemplar' ? Exemplar : ResourceCRA;
        const item = await ItemModel.findById(itemId);

        if (!item || item.estado !== 'disponible') {
            return res.status(400).json({ msg: 'Este ítem no está disponible para reservar en este momento.' });
        }
        
        const expiraEn = addBusinessDays(new Date(), 2);

        const newReservation = new Reservation({
            usuarioId: userId,
            item: itemId,
            itemModel,
            expiraEn
        });

        item.estado = 'reservado';
        await item.save();
        
        await newReservation.save();

        res.status(201).json({ msg: 'Reserva creada exitosamente. Tienes 2 días hábiles para retirar el ítem.', reservation: newReservation });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};