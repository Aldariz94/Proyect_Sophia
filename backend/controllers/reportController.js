const Loan = require('../models/Loan');
const User = require('../models/User');

// @route   GET api/reports/loans
// @desc    Generar reporte de préstamos
// @access  Private (Admin, Profesor)
exports.generateLoanReport = async (req, res) => {
    const { fechaInicio, fechaFin, curso, usuarioId, estado } = req.query;
    const requestingUserRole = req.user.rol;
    const requestingUserId = req.user.id;
    
    try {
        let query = {};

        // Construcción de la consulta a la base de datos
        if (fechaInicio && fechaFin) {
            query.fechaInicio = { $gte: new Date(fechaInicio), $lte: new Date(fechaFin) };
        }
        if (estado) {
            query.estado = estado;
        }
        if (usuarioId) {
            query.usuarioId = usuarioId;
        }

        // Lógica de permisos para profesores
        if (requestingUserRole === 'profesor') {
            // Un profesor solo puede ver los préstamos de alumnos de su curso.
            // Esta lógica es compleja y requeriría saber el curso del profesor.
            // Por simplicidad, un profesor puede buscar por un curso específico.
            if (!curso) {
                return res.status(400).json({ msg: 'Debe especificar un curso para generar el reporte.' });
            }
            const studentIds = await User.find({ curso: curso, rol: 'alumno' }).select('_id');
            query.usuarioId = { ...query.usuarioId, $in: studentIds.map(s => s._id) };
        } else if (curso) { // Si es admin y especifica curso
            const studentIds = await User.find({ curso: curso, rol: 'alumno' }).select('_id');
            query.usuarioId = { $in: studentIds.map(s => s._id) };
        }

        const loans = await Loan.find(query)
            .populate('usuarioId', 'primerNombre primerApellido correo rol curso')
            .populate({
                path: 'itemDetails',
                populate: {
                    path: 'libroId',
                    model: 'Book',
                    select: 'titulo'
                }
            });

        // Para el frontend, se enviaría el JSON. La exportación a PDF/Excel
        // es una tarea del lado del cliente o un microservicio aparte.
        res.json(loans);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};