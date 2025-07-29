import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DetailRow = ({ label, value }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{value || 'No especificado'}</dd>
    </div>
);

const ResourceDetails = ({ resource }) => {
    const [instances, setInstances] = useState([]);

    useEffect(() => {
        if (resource) {
            api.get(`/resources/${resource._id}/instances`).then(res => setInstances(res.data));
        }
    }, [resource]);

    const handleStatusChange = (instanceId, newStatus) => {
        api.put(`/resources/instances/${instanceId}`, { estado: newStatus }).then(res => {
            setInstances(prev => prev.map(inst => inst._id === instanceId ? res.data : inst));
        });
    };

    if (!resource) return null;

    return (
        <div>
            <dl>
                <DetailRow label="Nombre" value={resource.nombre} />
                <DetailRow label="Sede" value={resource.sede} />
                <DetailRow label="Categoría" value={resource.categoria} />
                <DetailRow label="Ubicación" value={resource.ubicacion} />
                <DetailRow label="Descripción" value={resource.descripcion} />
            </dl>
            <h4 className="mt-6 mb-2 font-bold dark:text-white">Unidades</h4>
            <div className="max-h-48 overflow-y-auto">
                {instances.map(inst => (
                    <div key={inst._id} className="flex items-center justify-between py-2 border-b dark:border-gray-700">
                        <span className="dark:text-gray-300">{inst.codigoInterno}</span>
                        <select value={inst.estado} onChange={(e) => handleStatusChange(inst._id, e.target.value)} className="px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <option value="disponible">Disponible</option>
                            <option value="prestado">Prestado</option>
                            <option value="mantenimiento">Mantenimiento</option>
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResourceDetails;