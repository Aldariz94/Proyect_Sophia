/*
 * ----------------------------------------------------------------
 * Endpoints para la API de Préstamos.
 * ----------------------------------------------------------------
 */
const express = require('express');
const router = express.Router();
const { createLoan, returnLoan, getAllLoans, getLoansByUser } = require('../controllers/loanController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Solo el admin puede crear y devolver préstamos directamente
router.post('/', [authMiddleware, checkRole(['admin'])], createLoan);
router.post('/return/:loanId', [authMiddleware, checkRole(['admin'])], returnLoan);

// Solo el admin puede ver todos los préstamos
router.get('/', [authMiddleware, checkRole(['admin'])], getAllLoans);

// Un usuario puede ver sus préstamos, y un admin puede ver los de cualquiera
router.get('/user/:userId', authMiddleware, getLoansByUser);

module.exports = router;