/*
 * ----------------------------------------------------------------
 * Endpoints para la API de Usuarios.
 * ----------------------------------------------------------------
 */
const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Todas las rutas de usuarios requieren rol de administrador
router.post('/', [authMiddleware, checkRole(['admin'])], createUser);
router.get('/', [authMiddleware, checkRole(['admin'])], getUsers);
router.put('/:id', [authMiddleware, checkRole(['admin'])], updateUser);
router.delete('/:id', [authMiddleware, checkRole(['admin'])], deleteUser);

module.exports = router;