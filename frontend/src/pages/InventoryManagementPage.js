import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useNotification } from '../hooks';
import { Notification } from '../components';

const InventoryManagementPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { notification, showNotification } = useNotification();

    // Estados para la paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchItems = useCallback(async (page) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/inventory/attention?page=${page}&limit=10`);
            setItems(data.docs);
            setTotalPages(data.totalPages);
            setCurrentPage(data.page);
        } catch (err) {
            showNotification('No se pudieron cargar los ítems.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchItems(currentPage);
    }, [currentPage, fetchItems]);

    const handleStatusChange = async (item, newStatus) => {
        const endpoint = item.itemType === 'Libro' 
            ? `/books/exemplars/${item._id}` 
            : `/resources/instances/${item._id}`;
        
        if (window.confirm(`¿Estás seguro de que quieres cambiar el estado de este ítem a "${newStatus}"?`)) {
            try {
                await api.put(endpoint, { estado: newStatus });
                showNotification('Estado actualizado correctamente.');
                fetchItems(currentPage); // Recargar la página actual
            } catch (err) {
                showNotification(err.response?.data?.msg || 'Error al actualizar el estado.', 'error');
            }
        }
    };
    
    const handleDeleteItem = async (item) => {
        if (window.confirm(`ADVERTENCIA: Estás a punto de eliminar permanentemente el registro de esta copia. ¿Deseas continuar?`)) {
            try {
                await api.delete(`/inventory/item/${item.itemType}/${item._id}`);
                showNotification('Ítem dado de baja exitosamente.');
                fetchItems(currentPage); // Recargar la página actual
            } catch (err) {
                showNotification(err.response?.data?.msg || 'Error al dar de baja el ítem.', 'error');
            }
        }
    };

    return (
        <div>
            <Notification {...notification} />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mantenimiento de Inventario</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Ítems que están marcados como deteriorados, extraviados o en mantenimiento.
            </p>

            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                {loading ? (
                    <div className="p-6 text-center dark:text-gray-300">Cargando inventario...</div>
                ) : (
                    <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Título</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Tipo</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Identificador</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Estado Actual</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase dark:text-gray-300">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {items.length > 0 ? (
                                items.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 text-gray-900 dark:text-white">{item.libroId?.titulo || item.resourceId?.nombre || 'N/A'}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-300">{item.itemType}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-300">{item.numeroCopia ? `Copia N° ${item.numeroCopia}` : item.codigoInterno}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize dark:bg-yellow-900 dark:text-yellow-300">
                                                {item.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium space-x-4">
                                            {item.estado === 'deteriorado' && (
                                                <button onClick={() => handleStatusChange(item, 'disponible')} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                                    Marcar Reparado
                                                </button>
                                            )}
                                            {item.estado === 'extraviado' && (
                                                <button onClick={() => handleStatusChange(item, 'disponible')} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                    Encontrado/Repuesto
                                                </button>
                                            )}
                                            {(item.estado === 'deteriorado' || item.estado === 'extraviado') && (
                                                <button onClick={() => handleDeleteItem(item)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                    Dar de Baja
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No hay ítems que requieran atención en este momento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Controles de Paginación */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-end mt-4 text-sm">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 mr-2 text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    <span className="text-gray-700 dark:text-gray-300">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 ml-2 text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default InventoryManagementPage;