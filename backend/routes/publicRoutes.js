const express = require('express');
const router = express.Router();
const { getPublicCatalog, getUserCatalog } = require('../controllers/publicController');
const authMiddleware = require('../middleware/authMiddleware'); // <-- LÍNEA AÑADIDA

// Ruta pública existente
router.get('/catalog', getPublicCatalog);

// --- NUEVA RUTA ---
// Esta ruta requiere estar logueado, pero no un rol específico
router.get('/user-catalog', authMiddleware, getUserCatalog);

module.exports = router;