const Loan = require('../models/Loan');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.generateLoanReport = async (req, res) => {
    const { startDate, endDate, status, userId, course, role } = req.query; // Se añade 'role'

    try {
        let query = {};
        let userQuery = {};

        // Filtrar por rango de fechas
        if (startDate && endDate) {
            query.fechaInicio = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Filtrar por estado del préstamo
        if (status) {
            query.estado = status;
        }

        // LÓGICA DE FILTRADO DE USUARIO MEJORADA
        if (role) {
            userQuery.rol = role;
        }
        if (course) {
            userQuery.curso = course;
            // Si se especifica un curso, se asume que el rol es 'alumno'
            userQuery.rol = 'alumno';
        }
        if (userId) {
            userQuery._id = userId;
        }

        if (Object.keys(userQuery).length > 0) {
            const users = await User.find(userQuery).select('_id');
            const userIds = users.map(user => user._id);

            // Si se aplicaron filtros de usuario pero no se encontró ninguno, no hay préstamos que mostrar
            if (userIds.length === 0) {
                return res.json([]);
            }
            query.usuarioId = { $in: userIds };
        }

        const loans = await Loan.find(query)
            .populate('usuarioId', 'primerNombre primerApellido rut curso rol') // Se añade 'rol'
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