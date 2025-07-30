// backend/controllers/dashboardController.js
const Loan = require('../models/Loan');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Exemplar = require('../models/Exemplar');

exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const [
            loansToday,
            reservationsToday,
            overdueLoans,
            sanctionedUsers,
            itemsForAttention
        ] = await Promise.all([
            Loan.countDocuments({ fechaInicio: { $gte: startOfDay, $lte: endOfDay } }),
            Reservation.countDocuments({ fechaReserva: { $gte: startOfDay, $lte: endOfDay } }),
            Loan.countDocuments({ estado: 'atrasado' }),
            User.countDocuments({ sancionHasta: { $gt: new Date() } }),
            Exemplar.countDocuments({ estado: { $in: ['deteriorado', 'extraviado'] } })
        ]);

        res.json({
            loansToday,
            reservationsToday,
            overdueLoans,
            sanctionedUsers,
            itemsForAttention
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};