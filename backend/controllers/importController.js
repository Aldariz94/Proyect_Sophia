// backend/controllers/importController.js
const xlsx = require('xlsx');
const User = require('../models/User');
const Book = require('../models/Book');
const Exemplar = require('../models/Exemplar');
const ResourceCRA = require('../models/ResourceCRA');
const ResourceInstance = require('../models/ResourceInstance');

// --- IMPORTAR USUARIOS (VERSIÓN FINAL Y CORREGIDA) ---
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
            return res.status(400).json({ msg: 'El archivo de Excel está vacío o tiene un formato incorrecto.' });
        }

        let successCount = 0;
        const errors = [];

        // Usamos un bucle for...of para procesar cada usuario individualmente
        // Esto asegura que los hooks del modelo (como el de encriptar contraseña) se ejecuten
        for (const [index, row] of data.entries()) {
            try {
                // Validar que los campos obligatorios existan
                if (!row.primerNombre || !row.primerApellido || !row.rut || !row.correo || !row.rol) {
                    throw new Error("Faltan campos obligatorios.");
                }

                const password = row.password ? String(row.password) : String(row.rut);

                const newUser = new User({
                    primerNombre: row.primerNombre,
                    primerApellido: row.primerApellido,
                    rut: String(row.rut),
                    correo: row.correo,
                    password: password, // Pasamos la contraseña en texto plano
                    rol: row.rol,
                    curso: row.rol === 'alumno' ? row.curso : undefined
                });
                
                // El método .save() activará el pre-save hook para encriptar la contraseña
                await newUser.save();
                successCount++;

            } catch (error) {
                const errorMessage = error.code === 11000 
                    ? 'El RUT o correo ya existe.' 
                    : error.message;
                errors.push(`Fila ${index + 2}: ${errorMessage}`);
            }
        }

        res.status(207).json({
            msg: `Proceso completado. Se crearon ${successCount} de ${data.length} usuarios.`,
            successCount,
            totalCount: data.length,
            errors: errors.length > 0 ? `Errores encontrados:\n${errors.join('\n')}` : undefined
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor al procesar el archivo.', details: error.message });
    }
};

// --- IMPORTAR LIBROS ---
exports.importBooks = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No se ha subido ningún archivo.' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ msg: 'El archivo de Excel está vacío o tiene un formato incorrecto.' });
        }

        let createdCount = 0;
        const errors = [];

        for (const [index, row] of data.entries()) {
            try {
                const bookData = {
                    titulo: row.titulo,
                    autor: row.autor,
                    editorial: row.editorial,
                    sede: row.sede,
                    lugarPublicacion: row.lugarPublicacion,
                    añoPublicacion: row.añoPublicacion,
                    tipoDocumento: row.tipoDocumento || 'Libro'
                };

                if (row.isbn) bookData.isbn = row.isbn;
                if (row.pais) bookData.pais = row.pais;
                if (row.numeroPaginas) bookData.numeroPaginas = row.numeroPaginas;
                if (row.descriptores) bookData.descriptores = String(row.descriptores).split(',').map(d => d.trim());
                if (row.idioma) bookData.idioma = row.idioma;
                if (row.cdd) bookData.cdd = row.cdd;
                if (row.edicion) bookData.edicion = row.edicion;
                if (row.ubicacionEstanteria) bookData.ubicacionEstanteria = row.ubicacionEstanteria;

                const newBook = new Book(bookData);
                const savedBook = await newBook.save();
                createdCount++;

                const cantidadEjemplares = parseInt(row.cantidadEjemplares) || 1;
                if (cantidadEjemplares > 0) {
                    const exemplars = [];
                    for (let i = 1; i <= cantidadEjemplares; i++) {
                        exemplars.push({
                            libroId: savedBook._id,
                            numeroCopia: i,
                            estado: 'disponible'
                        });
                    }
                    await Exemplar.insertMany(exemplars);
                }
            } catch (error) {
                errors.push(`Fila ${index + 2}: ${error.message}`);
            }
        }

        res.status(207).json({
            msg: `Proceso completado. Se crearon ${createdCount} de ${data.length} libros.`,
            successCount: createdCount,
            totalCount: data.length,
            errors: errors.length > 0 ? `Errores encontrados:\n${errors.join('\n')}` : undefined
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor al procesar el archivo.' });
    }
};

// --- IMPORTAR RECURSOS ---
exports.importResources = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No se ha subido ningún archivo.' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ msg: 'El archivo de Excel está vacío o tiene un formato incorrecto.' });
        }

        let createdCount = 0;
        const errors = [];

        for (const [index, row] of data.entries()) {
            try {
                const resourceData = {
                    nombre: row.nombre,
                    categoria: row.categoria,
                    sede: row.sede,
                    descripcion: row.descripcion,
                    ubicacion: row.ubicacion
                };

                const newResource = new ResourceCRA(resourceData);
                const savedResource = await newResource.save();
                createdCount++;

                const cantidadInstancias = parseInt(row.cantidadInstancias) || 1;
                if (cantidadInstancias > 0) {
                    const instances = [];
                    for (let i = 1; i <= cantidadInstancias; i++) {
                        const codigoInterno = `${row.codigoInternoBase}-${i}`;
                        instances.push({
                            resourceId: savedResource._id,
                            codigoInterno: codigoInterno,
                            estado: 'disponible'
                        });
                    }
                    await ResourceInstance.insertMany(instances);
                }
            } catch (error) {
                errors.push(`Fila ${index + 2}: ${error.message}`);
            }
        }

        res.status(207).json({
            msg: `Proceso completado. Se crearon ${createdCount} de ${data.length} recursos.`,
            successCount: createdCount,
            totalCount: data.length,
            errors: errors.length > 0 ? `Errores encontrados:\n${errors.join('\n')}` : undefined
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor al procesar el archivo.' });
    }
};