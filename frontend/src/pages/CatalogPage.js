import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useAuth, useNotification } from '../hooks';
import { Notification } from '../components';

const CatalogPage = ({ isUserView = false }) => {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { notification, showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchCatalog = useCallback(async (page, search = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (search) {
                params.append('search', search);
            }

            const endpoint = isUserView ? '/public/user-catalog' : '/public/catalog';
            const response = await api.get(`${endpoint}?${params.toString()}`);
            
            setCatalog(response.data.docs);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.page);
        } catch (err) {
            showNotification('No se pudo cargar el catálogo.', 'error');
        } finally {
            setLoading(false);
        }
    }, [isUserView, showNotification]);

    // --- LÓGICA DE BÚSQUEDA Y PAGINACIÓN CORREGIDA ---
    useEffect(() => {
        const timer = setTimeout(() => {
            // Si la página actual no es 1, la reseteamos. Esto disparará el otro useEffect.
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                // Si ya estamos en la página 1, ejecutamos la búsqueda directamente.
                fetchCatalog(1, searchTerm);
            }
        }, 500); // Aumentamos el tiempo de espera a 500ms

        return () => clearTimeout(timer);
    }, [searchTerm]); // Este efecto solo se dispara cuando el usuario escribe

    useEffect(() => {
        // Este efecto solo se dispara para los clics en los botones de paginación
        // Evitamos que se dispare en la carga inicial si la búsqueda está vacía
        if (searchTerm === '') {
            fetchCatalog(currentPage, searchTerm);
        }
    }, [currentPage]); // Este efecto solo se dispara cuando se cambia de página

    // La función handleReserve no cambia
    const handleReserve = async (item) => {
        // ... (código sin cambios)
    };

    return (
        <div>
            <Notification {...notification} />
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="Buscar por título o autor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>

            {loading ? (
                // --- SKELETON LOADER PARA UNA MEJOR EXPERIENCIA VISUAL ---
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {catalog.length > 0 ? (
                            catalog.map(item => (
                                <div key={item._id} className="flex flex-col p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
                                    <div className="flex-grow">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.itemType === 'Libro' ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}`}>
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
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
                                No se encontraron ítems que coincidan con la búsqueda.
                            </div>
                        )}
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-center mt-8 text-sm">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 mx-1 font-medium text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span className="text-gray-700 dark:text-gray-300 mx-4">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 mx-1 font-medium text-gray-700 bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CatalogPage;