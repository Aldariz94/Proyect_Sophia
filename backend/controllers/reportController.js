const Loan = require('../models/Loan');
const User = require('../models/User');
const Book = require('../models/Book');
const mongoose = require('mongoose');
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');

exports.generateLoanReport = async (req, res) => {
    try {
        const { startDate, endDate, status, userId, course, role, bookId } = req.query;
        // Se añaden los parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15; // Aumentamos el límite para reportes
        const skip = (page - 1) * limit;

        // --- Toda tu lógica de filtros se mantiene intacta ---
        let query = {};
        let userQuery = {};

        if (bookId && mongoose.Types.ObjectId.isValid(bookId)) {
            const exemplars = await Exemplar.find({ libroId: bookId }).select('_id');
            const exemplarIds = exemplars.map(ex => ex._id);
            if (exemplarIds.length > 0) {
                query.item = { $in: exemplarIds };
                query.itemModel = 'Exemplar';
            } else {
                return res.json({ docs: [], totalPages: 0, page: 1 }); // Devuelve vacío si no se encuentran ejemplares
            }
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            query.fechaInicio = { $gte: start, $lte: end };
        }
        
        if (status) query.estado = status;
        if (role) userQuery.rol = role;
        if (course) {
            userQuery.curso = course;
            userQuery.rol = 'alumno';
        }
        if (userId) userQuery._id = userId;

        if (Object.keys(userQuery).length > 0) {
            const users = await User.find(userQuery).select('_id');
            const userIds = users.map(user => user._id);
            if (userIds.length === 0) return res.json({ docs: [], totalPages: 0, page: 1 }); // Devuelve vacío si no se encuentran usuarios
            query.usuarioId = { $in: userIds };
        }
        // --- Fin de la lógica de filtros ---

        // 1. Contamos el total de documentos que coinciden con los filtros
        const totalDocs = await Loan.countDocuments(query);
        const totalPages = Math.ceil(totalDocs / limit);

        // 2. Obtenemos solo la porción de datos para la página actual
        const loans = await Loan.find(query)
            .populate('usuarioId', 'primerNombre primerApellido rut curso rol')
            .sort({ fechaInicio: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const formattedLoans = await Promise.all(loans.map(async (loan) => {
            let itemDetails = null;
            if (loan.itemModel === 'Exemplar') {
                const exemplar = await Exemplar.findById(loan.item).populate('libroId', 'titulo');
                if (exemplar && exemplar.libroId) {
                    itemDetails = { name: `${exemplar.libroId.titulo} (Copia #${exemplar.numeroCopia})` };
                }
            } else if (loan.itemModel === 'ResourceInstance') {
                const instance = await ResourceInstance.findById(loan.item).populate('resourceId', 'nombre');
                if (instance && instance.resourceId) {
                    itemDetails = { name: `${instance.resourceId.nombre} (${instance.codigoInterno})` };
                }
            }
            return { ...loan, itemDetails };
        }));

        // 3. Devolvemos el objeto de paginación
        res.json({
            docs: formattedLoans,
            totalDocs,
            totalPages,
            page
        });

    } catch (err) {
        console.error("Error al generar el reporte:", err.message);
        res.status(500).send('Error del servidor');
    }
};