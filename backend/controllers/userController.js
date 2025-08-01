const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Crear un nuevo usuario (ya implementado)
exports.createUser = async (req, res) => {
    const { primerNombre, primerApellido, rut, correo, password, rol, curso } = req.body;
    try {
        let user = await User.findOne({ $or: [{ correo }, { rut }] });
        if (user) {
            return res.status(400).json({ msg: 'El correo o RUT ya está registrado.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({
            primerNombre,
            primerApellido,
            rut,
            correo,
            hashedPassword,
            rol,
            curso: rol === 'alumno' ? curso : undefined
        });
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.hashedPassword;
        res.status(201).json({ msg: 'Usuario creado exitosamente.', user: userResponse });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener todos los usuarios (ya implementado)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-hashedPassword');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   PUT api/users/:id
// @desc    Actualizar un usuario (NUEVA IMPLEMENTACIÓN)
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    const { primerNombre, primerApellido, rut, correo, password, rol, curso } = req.body;
    
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        // Construir objeto con los campos a actualizar
        const userFields = { primerNombre, primerApellido, rut, correo, rol, curso };

        // Si se proporciona una nueva contraseña, hashearla
        if (password) {
            const salt = await bcrypt.genSalt(10);
            userFields.hashedPassword = await bcrypt.hash(password, salt);
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: userFields },
            { new: true } // Devuelve el documento modificado
        ).select('-hashedPassword');

        res.json({ msg: 'Usuario actualizado exitosamente.', user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   DELETE api/users/:id
// @desc    Eliminar un usuario (NUEVA IMPLEMENTACIÓN)
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        // Aquí se podría añadir lógica para verificar si el usuario tiene préstamos activos antes de eliminar
        
        await User.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Usuario eliminado exitosamente.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};


// --- NUEVAS FUNCIONES ---

// @route   GET api/users/sanctioned
// @desc    Obtener todos los usuarios con sanciones activas
// @access  Private (Admin)
exports.getSanctionedUsers = async (req, res) => {
    try {
        const sanctionedUsers = await User.find({
            sancionHasta: { $gt: new Date() } // Busca usuarios cuya fecha de sanción es mayor que la fecha actual
        }).select('-hashedPassword');
        res.json(sanctionedUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   PUT api/users/:id/remove-sanction
// @desc    Perdonar/eliminar la sanción de un usuario
// @access  Private (Admin)
exports.removeSanction = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { sancionHasta: null } }, // Establece la fecha de sanción a null
            { new: true }
        ).select('-hashedPassword');

        res.json({ msg: 'Sanción eliminada exitosamente.', user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};



// @route   GET api/users/me
// @desc    Obtener los datos del usuario con la sesión activa
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user.id es añadido por el middleware de autenticación
        const user = await User.findById(req.user.id).select('-hashedPassword');
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};