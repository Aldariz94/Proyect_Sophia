const Book = require('../models/Book');
const Exemplar = require('../models/Exemplar');
const mongoose = require('mongoose');

// Crear un nuevo libro y sus ejemplares
exports.createBook = async (req, res) => {
    const { libroData, cantidadEjemplares } = req.body;
    try {
        const newBook = new Book(libroData);
        const savedBook = await newBook.save();

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
        res.status(201).json({ msg: 'Libro y ejemplares creados.', book: savedBook });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener catálogo de libros con conteo de ejemplares
exports.getBooks = async (req, res) => {
    try {
        const books = await Book.aggregate([
            {
                $lookup: {
                    // PUNTO CRÍTICO: El nombre de la colección debe ser 'exemplars' (plural, minúscula)
                    from: 'exemplars',
                    localField: '_id',
                    foreignField: 'libroId',
                    as: 'exemplarsInfo'
                }
            },
            {
                $addFields: {
                    totalExemplars: { $size: '$exemplarsInfo' },
                    availableExemplars: {
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
            { $project: { exemplarsInfo: 0 } }
        ]);
        res.json(books);
    } catch (err) {
        console.error("Error en getBooks:", err.message);
        res.status(500).send('Error del servidor al obtener libros');
    }
};

// Obtener detalles de un libro
exports.getBookDetails = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ msg: 'Libro no encontrado.' });
        }
        const exemplars = await Exemplar.find({ libroId: req.params.id });
        res.json({ book, exemplars });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Actualizar un libro
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!book) return res.status(404).json({ msg: 'Libro no encontrado.' });
        res.json({ msg: 'Libro actualizado exitosamente.', book });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Eliminar un libro
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ msg: 'Libro no encontrado.' });
        await Exemplar.deleteMany({ libroId: req.params.id });
        await Book.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Libro y todos sus ejemplares han sido eliminados.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Añadir nuevos ejemplares a un libro existente
exports.addExemplars = async (req, res) => {
    const { quantity } = req.body;
    try {
        const lastExemplar = await Exemplar.findOne({ libroId: req.params.id }).sort({ numeroCopia: -1 });
        const startCopyNumber = lastExemplar ? lastExemplar.numeroCopia + 1 : 1;

        const newExemplars = [];
        for (let i = 0; i < quantity; i++) {
            newExemplars.push({
                libroId: req.params.id,
                numeroCopia: startCopyNumber + i,
                estado: 'disponible'
            });
        }
        await Exemplar.insertMany(newExemplars);
        res.status(201).json({ msg: `${quantity} nuevos ejemplares añadidos.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Obtener todos los ejemplares de un libro
exports.getExemplarsForBook = async (req, res) => {
    try {
        const exemplars = await Exemplar.find({ libroId: req.params.id }).sort({ numeroCopia: 'asc' });
        res.json(exemplars);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Actualizar el estado de un ejemplar específico
// --- FUNCIÓN MODIFICADA ---
exports.updateExemplarStatus = async (req, res) => {
    const { estado } = req.body;
    const { exemplarId } = req.params;

    // --- VALIDACIÓN ---
    const allowedStatus = ['disponible', 'prestado', 'reservado', 'deteriorado', 'extraviado'];
    if (!estado || !allowedStatus.includes(estado)) {
        return res.status(400).json({ msg: 'Estado no válido.' });
    }
    if (!mongoose.Types.ObjectId.isValid(exemplarId)) {
        return res.status(400).json({ msg: 'ID de ejemplar no válido.' });
    }

    try {
        const exemplar = await Exemplar.findByIdAndUpdate(
            exemplarId,
            { $set: { estado } },
            { new: true }
        );
        if (!exemplar) return res.status(404).json({ msg: 'Ejemplar no encontrado.' });
        res.json(exemplar);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};