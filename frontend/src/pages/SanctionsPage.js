import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useNotification } from '../hooks';

const SanctionsPage = () => {
  const [sanctionedUsers, setSanctionedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { showNotification } = useNotification();

  const fetchSanctionedUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/users/sanctioned?page=${page}&limit=10`);
      setSanctionedUsers(data.docs);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err) {
      const msg = err.response?.data?.msg || 'No se pudo cargar la lista de usuarios sancionados.';
      setError(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchSanctionedUsers(currentPage);
  }, [currentPage, fetchSanctionedUsers]);

  const handleRemoveSanction = async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas perdonar la sanción de este usuario?')) return;

    try {
      await api.put(`/users/${userId}/remove-sanction`);
      fetchSanctionedUsers(currentPage);
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al eliminar la sanción.';
      alert(msg);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-800 dark:text-gray-200">
        Cargando usuarios con atrasos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Atrasos y Sanciones
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Esta lista muestra únicamente a los usuarios que actualmente tienen una sanción activa.
      </p>

      <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase dark:text-gray-300">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase dark:text-gray-300">
                RUT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase dark:text-gray-300">
                Sancionado Hasta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase dark:text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sanctionedUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center dark:text-gray-400">
                  No hay usuarios con sanciones activas en este momento.
                </td>
              </tr>
            ) : (
              sanctionedUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                    {user.primerNombre} {user.primerApellido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                    {user.rut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                    {new Date(user.sancionHasta).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleRemoveSanction(user._id)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    >
                      Perdonar Sanción
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4 text-sm">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 mr-2 rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="self-center">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 ml-2 rounded-md disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
);

};  // <-- Asegúrate de que esta llave y punto y coma cierren sólo el componente

export default SanctionsPage;
