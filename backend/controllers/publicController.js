const Book = require('../models/Book');
const ResourceCRA = require('../models/ResourceCRA');
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');

const buildCatalogPipeline = (page, limit, search = '') => {
    const skip = (page - 1) * limit;
    const searchMatch = search ? {
        $match: {
            $or: [
                { titulo: { $regex: search, $options: 'i' } },
                { autor: { $regex: search, $options: 'i' } }
            ]
        }
    } : { $match: {} }; // Etapa de match vacía si no hay búsqueda

    return [
        searchMatch,
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: { titulo: 1 } },
                    { $skip: skip },
                    { $limit: limit },
                    { $lookup: { from: Exemplar.collection.name, localField: '_id', foreignField: 'libroId', as: 'exemplarsInfo' } },
                    { $addFields: { itemType: 'Libro', totalStock: { $size: '$exemplarsInfo' }, availableStock: { $size: { $filter: { input: '$exemplarsInfo', as: 'e', cond: { $eq: ['$$e.estado', 'disponible'] } } } } } },
                    { $project: { exemplarsInfo: 0 } }
                ]
            }
        }
    ];
};

exports.getPublicCatalog = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';

        const pipeline = buildCatalogPipeline(page, limit, search);
        const results = await Book.aggregate(pipeline);

        const docs = results[0].data;
        const totalDocs = results[0].metadata[0] ? results[0].metadata[0].total : 0;
        const totalPages = Math.ceil(totalDocs / limit);

        res.json({ docs, totalDocs, totalPages, page });
    } catch (err) {
        console.error("Error al obtener el catálogo público:", err.message);
        res.status(500).send('Error del servidor');
    }
};

// Se actualiza también getUserCatalog para que la búsqueda funcione al estar logueado
exports.getUserCatalog = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';

        const bookPipeline = buildCatalogPipeline(page, limit, search);
        const bookResults = await Book.aggregate(bookPipeline);
        
        const books = bookResults[0].data;
        const totalBooks = bookResults[0].metadata[0] ? bookResults[0].metadata[0].total : 0;

        // Si el usuario NO es un alumno, también obtenemos los recursos
        if (req.user.rol !== 'alumno') {
            // Lógica similar para recursos (por ahora la búsqueda solo aplica a libros)
            const resources = []; // Implementar búsqueda de recursos si se desea en el futuro
            const totalResources = 0;
            
            const combinedDocs = [...books, ...resources].slice(0, limit);
            const totalDocs = totalBooks + totalResources;
            const totalPages = Math.ceil(totalDocs / limit);

            return res.json({ docs: combinedDocs, totalDocs, totalPages, page });
        }

        const totalPages = Math.ceil(totalBooks / limit);
        res.json({ docs: books, totalDocs: totalBooks, totalPages, page });

    } catch (err) {
        console.error("Error al obtener el catálogo de usuario:", err.message);
        res.status(500).send('Error del servidor');
    }
};