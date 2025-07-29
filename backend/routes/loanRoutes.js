const express = require('express');
const router = express.Router();
const { createLoan, returnLoan, getAllLoans, getLoansByUser, renewLoan } = require('../controllers/loanController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Rutas existentes
router.post('/', [authMiddleware, checkRole(['admin'])], createLoan);
router.post('/return/:loanId', [authMiddleware, checkRole(['admin'])], returnLoan);
router.get('/', [authMiddleware, checkRole(['admin'])], getAllLoans);
router.get('/user/:userId', [authMiddleware, checkRole(['admin'])], getLoansByUser);

// Ruta de renovación (sin cambios en la definición de la ruta)
router.put('/:id/renew', [authMiddleware, checkRole(['admin'])], renewLoan);

module.exports = router;