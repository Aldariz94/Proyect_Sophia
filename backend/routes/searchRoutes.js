const express = require('express');
const router = express.Router();
const { searchUsers, searchAvailableItems } = require('../controllers/searchController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Proteger rutas para que solo usuarios con rol de admin puedan buscar para crear préstamos
router.get('/users', [authMiddleware, checkRole(['admin'])], searchUsers);
router.get('/items', [authMiddleware, checkRole(['admin'])], searchAvailableItems);

module.exports = router;