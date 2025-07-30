const express = require('express');
const router = express.Router();
const { createReservation, getActiveReservations, confirmReservation, cancelReservation } = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Rutas existentes
router.post('/', [authMiddleware, checkRole(['admin'])], createReservation);
router.get('/', [authMiddleware, checkRole(['admin'])], getActiveReservations);

// --- NUEVAS RUTAS ---
router.post('/:id/confirm', [authMiddleware, checkRole(['admin'])], confirmReservation);
router.post('/:id/cancel', [authMiddleware, checkRole(['admin'])], cancelReservation);

module.exports = router;