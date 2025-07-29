const express = require('express');
const router = express.Router();
const { createReservation } = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Cualquier usuario logueado puede crear una reserva
router.post('/', authMiddleware, createReservation);

module.exports = router;

