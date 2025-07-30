import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import CreateLoanForm from '../components/CreateLoanForm'; 

const ReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reservations');
            setReservations(response.data);
        } catch (err) {
            setError('No se pudo cargar la lista de reservas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const filteredReservations = useMemo(() => {
        if (!searchTerm) return reservations;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return reservations.filter(res => {
            const userName = `${res.usuarioId?.primerNombre} ${res.usuarioId?.primerApellido}`.toLowerCase();
            const itemName = (res.itemDetails?.name || '').toLowerCase();
            return userName.includes(lowerCaseSearch) || itemName.includes(lowerCaseSearch);
        });
    }, [reservations, searchTerm]);

    const handleCreateReservation = async (reservationData) => {
        try {
            await api.post('/reservations', reservationData);
            setIsModalOpen(false);
            fetchReservations();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error al crear la reserva.');
        }
    };
    
    // --- NUEVAS FUNCIONES ---
    const handleConfirm = async (reservationId) => {
        if (window.confirm('¿Confirmas que el usuario ha retirado el ítem? Esto creará un nuevo préstamo.')) {
            try {
                await api.post(`/reservations/${reservationId}/confirm`);
                fetchReservations();
            } catch (err) {
                alert(err.response?.data?.msg || 'Error al confirmar la reserva.');
            }
        }
    };

    const handleCancel = async (reservationId) => {
        if (window.confirm('¿Estás seguro de que deseas cancelar esta reserva? El ítem volverá a estar disponible.')) {
            try {
                await api.post(`/reservations/${reservationId}/cancel`);
                fetchReservations();
            } catch (err) {
                alert(err.response?.data?.msg || 'Error al cancelar la reserva.');
            }
        }
    };

    if (loading) return <div className="text-gray-800 dark:text-gray-200">Cargando reservas...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Reservas</h1>
                <div className="flex items-center gap-4">
                    <input type="text" placeholder="Buscar por usuario o ítem..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
                        Crear Reserva
                    </button>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nueva Reserva">
                <CreateLoanForm onSubmit={handleCreateReservation} onCancel={() => setIsModalOpen(false)} />
            </Modal>

            <h2 className="mt-10 text-2xl font-bold text-gray-800 dark:text-white">Reservas Activas</h2>
            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ítem Reservado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Fecha de Expiración</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredReservations.length > 0 ? (
                            filteredReservations.map(res => (
                                <tr key={res._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{res.usuarioId?.primerNombre || 'N/A'} {res.usuarioId?.primerApellido || ''}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{res.itemDetails?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(res.expiraEn).toLocaleDateString('es-CL')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleConfirm(res._id)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Confirmar Retiro</button>
                                        <button onClick={() => handleCancel(res._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Cancelar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No hay reservas activas en este momento.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReservationsPage;