const Loan = require('../models/Loan');
const User = require('../models/User');
const Book = require('../models/Book');
const mongoose = require('mongoose');

exports.generateLoanReport = async (req, res) => {
    const { startDate, endDate, status, userId, course, role, bookId } = req.query;

    try {
        let query = {};
        let userQuery = {};

        if (bookId) {
            const exemplars = await mongoose.model('Exemplar').find({ libroId: bookId }).select('_id');
            const exemplarIds = exemplars.map(ex => ex._id);
            if (exemplarIds.length === 0) return res.json([]);
            
            query.item = { $in: exemplarIds };
            query.itemModel = 'Exemplar';
        }

        // LÓGICA DE FECHAS CORREGIDA
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999); // Asegura que se incluya todo el día final

            query.fechaInicio = { $gte: start, $lte: end };
        }
        
        if (status) {
            query.estado = status;
        }
        if (role) {
            userQuery.rol = role;
        }
        if (course) {
            userQuery.curso = course;
            userQuery.rol = 'alumno';
        }
        if (userId) {
            userQuery._id = userId;
        }

        if (Object.keys(userQuery).length > 0) {
            const users = await User.find(userQuery).select('_id');
            const userIds = users.map(user => user._id);
            if (userIds.length === 0) return res.json([]);
            query.usuarioId = { $in: userIds };
        }

        const loans = await Loan.find(query)
            .populate('usuarioId', 'primerNombre primerApellido rut curso rol')
            .lean();

        const formattedLoans = await Promise.all(loans.map(async (loan) => {
            let itemDetails = null;
            if (loan.itemModel === 'Exemplar') {
                const exemplar = await mongoose.model('Exemplar').findById(loan.item).populate('libroId', 'titulo');
                if (exemplar && exemplar.libroId) {
                    itemDetails = { name: `${exemplar.libroId.titulo} (Copia #${exemplar.numeroCopia})` };
                }
            } else if (loan.itemModel === 'ResourceInstance') {
                const instance = await mongoose.model('ResourceInstance').findById(loan.item).populate('resourceId', 'nombre');
                if (instance && instance.resourceId) {
                    itemDetails = { name: `${instance.resourceId.nombre} (${instance.codigoInterno})` };
                }
            }
            return { ...loan, itemDetails };
        }));

        res.json(formattedLoans);

    } catch (err) {
        console.error("Error al generar el reporte:", err.message);
        res.status(500).send('Error del servidor');
    }
};