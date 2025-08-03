const xlsx = require('xlsx');
const User = require('../models/User');
const Book = require('../models/Book');
const Exemplar = require('../models/Exemplar');
const ResourceCRA = require('../models/ResourceCRA');
const ResourceInstance = require('../models/ResourceInstance');
const bcrypt = require('bcryptjs');

// --- IMPORTAR USUARIOS (CON DEBUGGING) ---
exports.importUsers = async (req, res) => {
    console.log('\n--- [DEBUG] INICIANDO IMPORTACIÓN DE USUARIOS ---');
    if (!req.file) {
        console.log('[DEBUG] Error: No se subió archivo.');
        return res.status(400).json({ msg: 'No se ha subido ningún archivo.' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        console.log(`[DEBUG] Archivo leído. Se encontraron ${data.length} filas.`);

        if (data.length === 0) {
            return res.status(400).json({ msg: 'El archivo Excel está vacío.' });
        }

        let successCount = 0;
        const errors = [];

        for (const [index, row] of data.entries()) {
            const currentRow = `Fila ${index + 2}`;
            try {
                console.log(`\n[DEBUG] Procesando ${currentRow}:`, row);
                
                if (!row.primerNombre || !row.rut || !row.correo || !row.rol) {
                    throw new Error("Faltan campos obligatorios (primerNombre, rut, correo, rol).");
                }

                const password = row.password ? String(row.password) : String(row.rut);
                console.log(`[DEBUG] ${currentRow}: Contraseña en texto plano: ${password}`);

                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                console.log(`[DEBUG] ${currentRow}: Contraseña encriptada exitosamente.`);
                
                const newUser = new User({
                    primerNombre: row.primerNombre,
                    primerApellido: row.primerApellido || '',
                    segundoNombre: row.segundoNombre,
                    segundoApellido: row.segundoApellido,
                    rut: String(row.rut),
                    correo: row.correo,
                    hashedPassword: hashedPassword,
                    rol: row.rol,
                    curso: row.rol === 'alumno' ? row.curso : undefined
                });
                
                await newUser.save();
                console.log(`[DEBUG] ${currentRow}: Usuario guardado en la BD.`);
                successCount++;

            } catch (error) {
                console.error(`--- [DEBUG] ERROR en ${currentRow}: ---`, error);
                const errorMessage = error.code === 11000 ? 'El RUT o correo ya existe.' : error.message;
                errors.push(`${currentRow}: ${errorMessage}`);
            }
        }

        console.log('--- [DEBUG] Finalizando importación de usuarios. Enviando respuesta... ---');
        res.status(207).json({
            msg: `Proceso completado. Se crearon ${successCount} de ${data.length} usuarios.`,
            successCount,
            totalCount: data.length,
            errors: errors.length > 0 ? `Errores encontrados:\n${errors.join('\n')}` : undefined
        });

    } catch (error) {
        console.error('--- [DEBUG] ERROR CATASTRÓFICO (Usuarios): ---', error);
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

// --- INICIO DE LA MODIFICACIÓN ---
// Se refactoriza la importación de recursos para que sea automática
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
                // Ya no requerimos 'codigoInternoBase'
                if (!row.nombre || !row.categoria || !row.sede) {
                    throw new Error("Faltan campos obligatorios (nombre, categoria, sede).");
                }

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
                    // Misma lógica de generación de código que en createResource
                    const sedePrefix = savedResource.sede === 'Basica' ? 'RBB' : 'RBM';
                    const lastInstanceCount = await ResourceInstance.countDocuments({
                        codigoInterno: { $regex: `^${sedePrefix}` }
                    });
                    
                    const instances = [];
                    for (let i = 1; i <= cantidadInstancias; i++) {
                        const sequentialNumber = (lastInstanceCount + i).toString().padStart(3, '0');
                        const codigoInterno = `${sedePrefix}-${sequentialNumber}`;
                        instances.push({
                            resourceId: savedResource._id,
                            codigoInterno: codigoInterno,
                            estado: 'disponible'
                        });
                    }
                    await ResourceInstance.insertMany(instances);
                }
            } catch (error) {
                const errorMessage = error.code === 11000 
                    ? 'Error de duplicado al generar código interno.' 
                    : error.message;
                errors.push(`Fila ${index + 2}: ${errorMessage}`);
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
        res.status(500).json({ msg: 'Error en el servidor al procesar el archivo.', details: error.message });
    }
};
// --- FIN DE LA MODIFICACIÓN ---