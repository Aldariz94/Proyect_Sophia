import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ResourceForm from '../components/ResourceForm';
import ResourceDetails from '../components/ResourceDetails';
import ImportComponent from '../components/ImportComponent';

const ResourceManagementPage = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [viewingResource, setViewingResource] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const fetchResources = async () => {
        try {
            const response = await api.get('/resources');
            setResources(response.data);
        } catch (err) {
            setError('No se pudo cargar la lista de recursos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);
    
    const filteredResources = useMemo(() => {
        if (!searchTerm) return resources;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return resources.filter(res =>
            Object.values(res).some(val =>
                String(val).toLowerCase().includes(lowerCaseSearch)
            )
        );
    }, [resources, searchTerm]);

    const handleOpenCreateModal = () => {
        setEditingResource(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (resource) => {
        setEditingResource(resource);
        setIsFormModalOpen(true);
    };

    const handleOpenViewModal = (resource) => {
        setViewingResource(resource);
        setIsViewModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsViewModalOpen(false);
        setEditingResource(null);
        setViewingResource(null);
    };

    const handleSubmit = async (payload) => {
        try {
            if (editingResource) {
                await api.put(`/resources/${editingResource._id}`, payload.resourceData);
                if (payload.additionalInstances > 0) {
                    await api.post(`/resources/${editingResource._id}/instances`, { 
                        quantity: payload.additionalInstances,
                        codigoInternoBase: editingResource.codigoInterno
                    });
                }
            } else {
                await api.post('/resources', payload);
            }
            handleCloseModals();
            fetchResources();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error al guardar el recurso.');
        }
    };

    const handleDelete = async (resourceId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este recurso y todas sus instancias?')) {
            try {
                await api.delete(`/resources/${resourceId}`);
                fetchResources();
            } catch (err) {
                alert(err.response?.data?.msg || 'Error al eliminar el recurso.');
            }
        }
    };

    if (loading) return <div className="text-gray-800 dark:text-gray-200">Cargando recursos...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Recursos CRA</h1>
                <div className="flex items-center gap-4">
                     <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 whitespace-nowrap">
                        Importar
                    </button>
                    <button onClick={handleOpenCreateModal} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
                        Crear Recurso
                    </button>
                </div>
            </div>

            <Modal isOpen={isFormModalOpen} onClose={handleCloseModals} title={editingResource ? "Editar Recurso" : "Crear Nuevo Recurso"}>
                <ResourceForm onSubmit={handleSubmit} onCancel={handleCloseModals} initialData={editingResource} />
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={handleCloseModals} title="Detalles del Recurso">
                <ResourceDetails resource={viewingResource} />
            </Modal>

           <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Recursos desde Excel">
                <ImportComponent importType="resources" onImportSuccess={() => {
                    setIsImportModalOpen(false);
                    fetchResources();
                }} />
            </Modal>

            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Sede</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Categoría</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Cantidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredResources.map(resource => (
                            <tr key={resource._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{resource.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{resource.sede}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{resource.categoria}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{`${resource.availableInstances} / ${resource.totalInstances}`}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                    <button onClick={() => handleOpenViewModal(resource)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Ver</button>
                                    <button onClick={() => handleOpenEditModal(resource)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                    <button onClick={() => handleDelete(resource._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResourceManagementPage;