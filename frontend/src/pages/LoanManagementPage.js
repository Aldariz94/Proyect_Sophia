
import React, { useEffect, useState } from 'react';
import api from '../services/api';

const LoanManagementPage = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await api.get('/loans');
                setLoans(response.data);
            } catch (err) {
                setError('No se pudo cargar el historial de préstamos.');
            } finally {
                setLoading(false);
            }
        };
        fetchLoans();
    }, []);

    if (loading) return <div className="text-gray-800 dark:text-gray-200">Cargando préstamos...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Historial de Préstamos</h1>
            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ítem Prestado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Fecha de Préstamo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Fecha de Vencimiento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loans.map(loan => (
                            <tr key={loan._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{loan.usuarioId?.primerNombre || 'N/A'} {loan.usuarioId?.primerApellido || ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{loan.itemDetails?.titulo || loan.itemDetails?.nombre || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(loan.fechaInicio).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(loan.fechaVencimiento).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{loan.estado}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoanManagementPage;
