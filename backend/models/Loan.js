const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loanSchema = new Schema({
    usuarioId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, required: true },
    itemModel: { type: String, required: true, enum: ['Exemplar', 'ResourceCRA'] },
    fechaInicio: { type: Date, default: Date.now, required: true },
    fechaVencimiento: { type: Date, required: true },
    fechaDevolucion: { type: Date },
    estado: { 
        type: String, 
        required: true, 
        enum: ['enCurso', 'devuelto', 'atrasado'],
        default: 'enCurso'
    }
}, { timestamps: true });

loanSchema.virtual('itemDetails', {
    ref: doc => doc.itemModel,
    localField: 'item',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Loan', loanSchema);