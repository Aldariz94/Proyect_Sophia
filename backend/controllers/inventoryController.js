// backend/controllers/inventoryController.js
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');

exports.getItemsForAttention = async (req, res) => {
    try {
        const problemStatus = ['deteriorado', 'extraviado', 'mantenimiento'];

        const exemplars = await Exemplar.find({ estado: { $in: problemStatus } })
            .populate('libroId', 'titulo')
            .lean();

        const resourceInstances = await ResourceInstance.find({ estado: { $in: problemStatus } })
            .populate('resourceId', 'nombre')
            .lean();

        // Añadir tipo para diferenciarlos en el frontend
        const formattedExemplars = exemplars.map(e => ({ ...e, itemType: 'Libro' }));
        const formattedInstances = resourceInstances.map(i => ({ ...i, itemType: 'Recurso' }));

        const items = [...formattedExemplars, ...formattedInstances];

        res.json(items);
    } catch (err) {
        console.error("Error al obtener ítems para atención:", err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.deleteItemInstance = async (req, res) => {
    try {
        const { itemModel, itemId } = req.params;

        const Model = itemModel === 'Libro' ? Exemplar : ResourceInstance;
        
        const deletedItem = await Model.findByIdAndDelete(itemId);

        if (!deletedItem) {
            return res.status(404).json({ msg: 'Instancia o ejemplar no encontrado.' });
        }

        res.json({ msg: 'Ítem dado de baja exitosamente.' });
    } catch (err) {
        console.error("Error al dar de baja el ítem:", err.message);
        res.status(500).send('Error del servidor');
    }
};