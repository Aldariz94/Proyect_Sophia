const xlsx = require('xlsx');
const User = require('../models/User');
const Book = require('../models/Book');
const Exemplar = require('../models/Exemplar');
const ResourceCRA = require('../models/ResourceCRA');
const ResourceInstance = require('../models/ResourceInstance');
const bcrypt = require('bcryptjs');

// --- INICIO DE LA MODIFICACIÓN ---
exports.importUsers = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No se ha subido ningún archivo.' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ msg: 'El archivo Excel está vacío.' });
        }

        let successCount = 0;
        const errors = [];

        for (const [index, row] of data.entries()) {
            const currentRow = `Fila ${index + 2}`;
            try {
                const { primerNombre, rut, correo, rol } = row;
                if (!primerNombre || !rut || !correo || !rol) {
                    throw new Error("Faltan campos obligatorios (primerNombre, rut, correo, rol).");
                }

                const rutStr = String(rut);

                // **Paso de Verificación Clave**
                // Buscamos si ya existe un usuario con el mismo RUT o correo.
                const existingUser = await User.findOne({ $or: [{ correo: correo }, { rut: rutStr }] });

                if (existingUser) {
                    // Si el usuario ya existe, lanzamos un error para saltar a la siguiente fila.
                    throw new Error(`El RUT (${rutStr}) o correo (${correo}) ya está registrado.`);
                }

                const password = row.password ? String(row.password) : rutStr;
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                const newUser = new User({
                    primerNombre: row.primerNombre,
                    primerApellido: row.primerApellido || '',
                    segundoNombre: row.segundoNombre,
                    segundoApellido: row.segundoApellido,
                    rut: rutStr,
                    correo: row.correo,
                    hashedPassword: hashedPassword,
                    rol: row.rol,
                    curso: row.rol === 'alumno' ? row.curso : undefined
                });
                
                await newUser.save();
                successCount++;

            } catch (error) {
                // El error de duplicado de la base de datos (código 11000) ahora es un respaldo.
                // Nuestro error personalizado es más claro.
                const errorMessage = error.code === 11000 ? 'El RUT o correo ya existe (verificación de BD).' : error.message;
                errors.push(`${currentRow}: ${errorMessage}`);
            }
        }

        res.status(207).json({
            msg: `Proceso completado. Se crearon ${successCount} de ${data.length} nuevos usuarios.`,
            successCount,
            totalCount: data.length,
            errors: errors.length > 0 ? `Errores encontrados:\n${errors.join('\n')}` : undefined
        });

    } catch (error) {
        console.error('Error catastrófico en la importación de usuarios:', error);
        res.status(500).json({ msg: 'Error en el servidor al procesar el archivo.', details: error.message });
    }
};
// --- FIN DE LA MODIFICACIÓN ---
// --- INICIO DE LA MODIFICACIÓN PARA LIBROS ---
exports.importBooks = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No se ha subido ningún archivo.' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        let createdCount = 0;
        const errors = [];

        for (const [index, row] of data.entries()) {
            const currentRow = `Fila ${index + 2}`;
            try {
                if (!row.titulo || !row.autor || !row.sede) {
                    throw new Error("Faltan campos obligatorios (titulo, autor, sede).");
                }

                // **Verificación de Duplicados para Libros**
                // Buscamos si ya existe un libro con el mismo título y autor.
                const existingBook = await Book.findOne({ titulo: row.titulo, autor: row.autor });
                if (existingBook) {
                    throw new Error(`El libro "${row.titulo}" del autor "${row.autor}" ya existe.`);
                }

                const bookData = { /* ... (resto de la lógica para construir bookData) ... */ };
                const newBook = new Book(bookData);
                const savedBook = await newBook.save();
                createdCount++;

                const cantidadEjemplares = parseInt(row.cantidadEjemplares) || 1;
                if (cantidadEjemplares > 0) {
                    // ... (lógica para crear ejemplares)
                }
            } catch (error) {
                errors.push(`${currentRow}: ${error.message}`);
            }
        }

        res.status(207).json({
            msg: `Proceso completado. Se crearon ${createdCount} de ${data.length} nuevos libros.`,
            successCount: createdCount,
            totalCount: data.length,
            errors: errors.length > 0 ? `Errores encontrados:\n${errors.join('\n')}` : undefined
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor al procesar el archivo.' });
    }
};
// --- FIN DE LA MODIFICACIÓN PARA LIBROS ---


// --- INICIO DE LA MODIFICACIÓN PARA RECURSOS ---
exports.importResources = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No se ha subido ningún archivo.' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        let createdCount = 0;
        const errors = [];

        for (const [index, row] of data.entries()) {
            const currentRow = `Fila ${index + 2}`;
            try {
                if (!row.nombre || !row.categoria || !row.sede) {
                    throw new Error("Faltan campos obligatorios (nombre, categoria, sede).");
                }

                // **Verificación de Duplicados para Recursos**
                // Buscamos si ya existe un recurso con el mismo nombre.
                const existingResource = await ResourceCRA.findOne({ nombre: row.nombre });
                if (existingResource) {
                    throw new Error(`El recurso "${row.nombre}" ya existe.`);
                }

                const resourceData = { /* ... (lógica para construir resourceData) ... */ };
                const newResource = new ResourceCRA(resourceData);
                const savedResource = await newResource.save();
                createdCount++;

                const cantidadInstancias = parseInt(row.cantidadInstancias) || 1;
                if (cantidadInstancias > 0) {
                    // ... (lógica para crear instancias con código automático)
                }
            } catch (error) {
                errors.push(`${currentRow}: ${error.message}`);
            }
        }

        res.status(207).json({
            msg: `Proceso completado. Se crearon ${createdCount} de ${data.length} nuevos recursos.`,
            successCount: createdCount,
            totalCount: data.length,
            errors: errors.length > 0 ? `Errores encontrados:\n${errors.join('\n')}` : undefined
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor al procesar el archivo.', details: error.message });
    }
};
// --- FIN DE LA MODIFICACIÓN PARA RECURSOS ---