const Book = require('../models/Book');
const ResourceCRA = require('../models/ResourceCRA');

// getPublicCatalog solo devuelve libros (para visitantes no logueados)
exports.getPublicCatalog = async (req, res) => {
    try {
        const books = await Book.aggregate([
            {
                $lookup: {
                    from: 'exemplars',
                    localField: '_id',
                    foreignField: 'libroId',
                    as: 'exemplarsInfo'
                }
            },
            {
                $addFields: {
                    itemType: 'Libro',
                    totalStock: { $size: '$exemplarsInfo' },
                    availableStock: {
                        $size: {
                            $filter: {
                                input: '$exemplarsInfo',
                                as: 'exemplar',
                                cond: { $eq: ['$$exemplar.estado', 'disponible'] }
                            }
                        }
                    }
                }
            },
            { $project: { exemplarsInfo: 0, __v: 0, createdAt: 0, updatedAt: 0 } }
        ]);
        res.json(books);
    } catch (err) {
        console.error("Error al obtener el catálogo público:", err.message);
        res.status(500).send('Error del servidor');
    }
};

// getUserCatalog devuelve un catálogo diferente según el rol del usuario
exports.getUserCatalog = async (req, res) => {
    try {
        // Obtener libros (común para todos los usuarios logueados)
        const books = await Book.aggregate([
            {
                $lookup: {
                    from: 'exemplars',
                    localField: '_id',
                    foreignField: 'libroId',
                    as: 'exemplarsInfo'
                }
            },
            {
                $addFields: {
                    itemType: 'Libro',
                    totalStock: { $size: '$exemplarsInfo' },
                    availableStock: {
                        $size: {
                            $filter: {
                                input: '$exemplarsInfo',
                                as: 'exemplar',
                                cond: { $eq: ['$$exemplar.estado', 'disponible'] }
                            }
                        }
                    }
                }
            },
            { $project: { exemplarsInfo: 0, __v: 0, createdAt: 0, updatedAt: 0 } }
        ]);

        // Si el usuario es un profesor, también obtenemos los recursos
        if (req.user.rol === 'profesor') {
            const resources = await ResourceCRA.aggregate([
                {
                    $lookup: {
                        from: 'resourceinstances',
                        localField: '_id',
                        foreignField: 'resourceId',
                        as: 'instancesInfo'
                    }
                },
                {
                    $addFields: {
                        itemType: 'Recurso',
                        titulo: '$nombre', // Renombrar para consistencia
                        totalStock: { $size: '$instancesInfo' },
                        availableStock: {
                            $size: {
                                $filter: {
                                    input: '$instancesInfo',
                                    as: 'instance',
                                    cond: { $eq: ['$$instance.estado', 'disponible'] }
                                }
                            }
                        }
                    }
                },
                { $project: { instancesInfo: 0, __v: 0, createdAt: 0, updatedAt: 0, nombre: 0 } }
            ]);
            
            // Combinar y enviar
            const catalog = [...books, ...resources];
            return res.json(catalog);
        }

        // Para cualquier otro rol (ej: alumno), solo enviamos los libros
        res.json(books);

    } catch (err) {
        console.error("Error al obtener el catálogo de usuario:", err.message);
        res.status(500).send('Error del servidor');
    }
};