import React, { useEffect, useState } from 'react';
import api from '../services/api';

const SanctionsPage = () => {
    const [sanctionedUsers, setSanctionedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSanctionedUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/sanctioned');
            setSanctionedUsers(response.data);
        } catch (err) {
            setError('No se pudo cargar la lista de usuarios sancionados.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSanctionedUsers();
    }, []);

    const handleRemoveSanction = async (userId) => {
        if (window.confirm('¿Estás seguro de que deseas perdonar la sanción de este usuario?')) {
            try {
                await api.put(`/users/${userId}/remove-sanction`);
                fetchSanctionedUsers(); // Recargar la lista para que el usuario desaparezca
            } catch (err) {
                alert(err.response?.data?.msg || 'Error al eliminar la sanción.');
            }
        }
    };

    if (loading) return <div className="text-gray-800 dark:text-gray-200">Cargando usuarios con atrasos...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Atrasos y Sanciones</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Esta lista muestra únicamente a los usuarios que actualmente tienen una sanción activa.
            </p>

            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">RUT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Sancionado Hasta</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sanctionedUsers.length > 0 ? (
                            sanctionedUsers.map(user => (
                                <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{`${user.primerNombre} ${user.primerApellido}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{user.rut}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(user.sancionHasta).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleRemoveSanction(user._id)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                            Perdonar Sanción
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No hay usuarios con sanciones activas en este momento.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SanctionsPage;
