const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    usuarioId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, required: true },
    itemModel: { type: String, required: true, enum: ['Exemplar', 'ResourceCRA'] },
    fechaReserva: { type: Date, default: Date.now },
    expiraEn: { type: Date, required: true }, // 2 días hábiles desde la reserva
    estado: { 
        type: String, 
        required: true, 
        enum: ['pendiente', 'expirada', 'completada'],
        default: 'pendiente'
    }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);