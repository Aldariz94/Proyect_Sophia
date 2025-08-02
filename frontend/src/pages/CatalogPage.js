import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useAuth, useNotification } from '../hooks';
import { Notification } from '../components';

const CatalogPage = ({ isUserView = false }) => {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { notification, showNotification } = useNotification();

    const fetchCatalog = useCallback(async () => {
        try {
            setLoading(true);
            const endpoint = isUserView ? '/public/user-catalog' : '/public/catalog';
            const response = await api.get(endpoint);
            setCatalog(response.data);
        } catch (err) {
            showNotification('No se pudo cargar el catálogo.', 'error');
        } finally {
            setLoading(false);
        }
    }, [isUserView, showNotification]);

    useEffect(() => {
        fetchCatalog();
    }, [fetchCatalog]);

    const [searchTerm, setSearchTerm] = useState('');
    const filteredCatalog = useMemo(() => {
        if (!searchTerm) return catalog;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return catalog.filter(item =>
            item.titulo.toLowerCase().includes(lowerCaseSearch) ||
            (item.autor && item.autor.toLowerCase().includes(lowerCaseSearch)) ||
            item.sede.toLowerCase().includes(lowerCaseSearch)
        );
    }, [catalog, searchTerm]);

    const handleReserve = async (item) => {
        if (!user) {
            showNotification("Debes iniciar sesión para poder reservar.", "error");
            return;
        }

        if (!window.confirm(`¿Deseas reservar "${item.titulo}"? Tienes 2 días hábiles para retirarlo.`)) {
            return;
        }

        const itemTypeForAPI = item.itemType === 'Libro' ? 'Book' : 'Resource';
        const itemModelForDB = item.itemType === 'Libro' ? 'Exemplar' : 'ResourceInstance';

        try {
            const res = await api.get(`/search/find-available-copy/${itemTypeForAPI}/${item._id}`);
            const { copyId } = res.data;

            if (!copyId) {
                showNotification("Lo sentimos, no hay copias disponibles en este momento.", "error");
                return;
            }

            await api.post('/reservations', {
                itemId: copyId,
                itemModel: itemModelForDB
            });

            showNotification(`¡Has reservado "${item.titulo}" exitosamente!`);
            fetchCatalog();

        } catch (err) {
            showNotification(err.response?.data?.msg || "No se pudo completar la reserva.", "error");
        }
    };

    if (loading) return <div className="text-center text-gray-800 dark:text-gray-200">Cargando catálogo...</div>;
    return (
        <div>
            <Notification {...notification} />
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Buscar por título, autor o sede..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCatalog.map(item => (
                    <div key={item._id} className="flex flex-col p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
                        <div className="flex-grow">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.itemType === 'Libro' ? 'bg-blue-200 text-blue-800' : 'bg-purple-200 text-purple-800'}`}>
                                {item.itemType}
                            </span>
                            <h3 className="mt-2 text-xl font-bold text-gray-800 dark:text-white">{item.titulo}</h3>
                            {item.autor && <p className="text-sm text-gray-600 dark:text-gray-400">{item.autor}</p>}
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                                <span>Sede: <strong>{item.sede}</strong></span>
                                <span>Disponibles: <strong>{item.availableStock}</strong></span>
                            </div>
                            {isUserView && (
                                <button
                                    onClick={() => handleReserve(item)}
                                    disabled={item.availableStock === 0}
                                    className="w-full mt-4 px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                >
                                    {item.availableStock > 0 ? 'Reservar' : 'No disponible'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CatalogPage;