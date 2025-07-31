// backend/controllers/resourceController.js
const ResourceCRA = require('../models/ResourceCRA');
const ResourceInstance = require('../models/ResourceInstance');
const mongoose = require('mongoose');

// --- FUNCIÓN CORREGIDA ---
exports.createResource = async (req, res) => {
    // Leemos el objeto anidado 'resourceData' y 'cantidadInstancias'
    const { resourceData, cantidadInstancias } = req.body;

    try {
        // Pasamos el objeto 'resourceData' completo al modelo
        const newResource = new ResourceCRA(resourceData);
        const savedResource = await newResource.save();

        if (cantidadInstancias > 0) {
            const instances = [];
            for (let i = 1; i <= cantidadInstancias; i++) {
                // Usamos el codigoInterno del recurso guardado para generar los de las instancias
                const codigoInternoInstancia = `${savedResource.codigoInterno}-${i}`;
                instances.push({
                    resourceId: savedResource._id,
                    codigoInterno: codigoInternoInstancia,
                    estado: 'disponible'
                });
            }
            await ResourceInstance.insertMany(instances);
        }
        res.status(201).json({ msg: 'Recurso e instancias creados.', resource: savedResource });
    } catch (err) {
        console.error(err.message);
        // Devuelve un error más específico si la clave está duplicada
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'El Código Interno ya existe. Por favor, elige otro.' });
        }
        res.status(500).send('Error del servidor');
    }
};

exports.getResources = async (req, res) => {
    try {
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
                    totalInstances: { $size: '$instancesInfo' },
                    availableInstances: {
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
            { $project: { instancesInfo: 0 } }
        ]);
        res.json(resources);
    } catch (err) {
        console.error("Error en getResources:", err.message);
        res.status(500).send('Error del servidor al obtener recursos');
    }
};

exports.updateResource = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'ID de recurso no válido.' });
    }
    try {
        const resource = await ResourceCRA.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!resource) return res.status(404).json({ msg: 'Recurso no encontrado.' });
        res.json({ msg: 'Recurso actualizado.', resource });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.deleteResource = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'ID de recurso no válido.' });
    }
    try {
        const resource = await ResourceCRA.findById(req.params.id);
        if (!resource) return res.status(404).json({ msg: 'Recurso no encontrado.' });
        await ResourceInstance.deleteMany({ resourceId: req.params.id });
        await ResourceCRA.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Recurso y todas sus instancias han sido eliminados.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.addInstances = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'ID de recurso no válido.' });
    }
    const { quantity, codigoInternoBase } = req.body;
    try {
        const instanceCount = await ResourceInstance.countDocuments({ resourceId: req.params.id });
        
        const newInstances = [];
        for (let i = 0; i < quantity; i++) {
            const codigoInterno = `${codigoInternoBase}-${instanceCount + i + 1}`;
            newInstances.push({
                resourceId: req.params.id,
                codigoInterno: codigoInterno,
                estado: 'disponible'
            });
        }
        await ResourceInstance.insertMany(newInstances);
        res.status(201).json({ msg: `${quantity} nuevas instancias añadidas.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.getInstancesForResource = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ msg: 'ID de recurso no válido.' });
    }
    try {
        const instances = await ResourceInstance.find({ resourceId: req.params.id }).sort({ codigoInterno: 'asc' });
        res.json(instances);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.updateInstanceStatus = async (req, res) => {
    const { estado } = req.body;
    const { instanceId } = req.params;

    const allowedStatus = ['disponible', 'prestado', 'mantenimiento', 'reservado'];
    if (!estado || !allowedStatus.includes(estado)) {
        return res.status(400).json({ msg: 'Estado no válido.' });
    }
    if (!mongoose.Types.ObjectId.isValid(instanceId)) {
        return res.status(400).json({ msg: 'ID de instancia no válido.' });
    }

    try {
        const instance = await ResourceInstance.findByIdAndUpdate(
            instanceId,
            { $set: { estado } },
            { new: true }
        );
        if (!instance) return res.status(404).json({ msg: 'Instancia no encontrada.' });
        res.json(instance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};