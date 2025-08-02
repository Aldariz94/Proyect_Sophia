import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../services/api';
import { Modal, CreateLoanForm, Notification } from '../components';
import { useNotification } from '../hooks';
import { PlusIcon } from '@heroicons/react/24/outline';


const ReservationsPage = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { notification, showNotification } = useNotification();

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // <-- 2. Estado re-añadido

    const fetchReservations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/reservations');
            setReservations(response.data);
        } catch (err) {
            showNotification('No se pudo cargar la lista de reservas.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const filteredReservations = useMemo(() => {
        if (!searchTerm) return reservations;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return reservations.filter(res => {
            const userName = `${res.usuarioId?.primerNombre} ${res.usuarioId?.primerApellido}`.toLowerCase();
            const itemName = (res.itemDetails?.name || '').toLowerCase();
            return userName.includes(lowerCaseSearch) || itemName.includes(lowerCaseSearch);
        });
    }, [reservations, searchTerm]);

    // <-- 3. Función para crear la reserva, re-añadida
    const handleCreateReservation = async (reservationData) => {
        try {
            // Nota: El backend debe estar preparado para recibir 'itemModel' y 'itemId'
            await api.post('/reservations', reservationData);
            showNotification('Reserva manual creada exitosamente.');
            fetchReservations();
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al crear la reserva.', 'error');
        } finally {
            setIsCreateModalOpen(false);
        }
    };

    const handleOpenConfirmModal = (reservation) => {
        setSelectedReservation(reservation);
        setIsConfirmModalOpen(true);
    };

    const handleOpenCancelModal = (reservation) => {
        setSelectedReservation(reservation);
        setIsCancelModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsConfirmModalOpen(false);
        setIsCancelModalOpen(false);
        setIsCreateModalOpen(false); // <-- Se asegura de cerrar el modal de creación
        setSelectedReservation(null);
    };

    const executeConfirm = async () => {
        if (!selectedReservation) return;
        try {
            await api.post(`/reservations/${selectedReservation._id}/confirm`);
            showNotification('Reserva confirmada y préstamo creado.');
            fetchReservations();
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al confirmar la reserva.', 'error');
        } finally {
            handleCloseModals();
        }
    };

    const executeCancel = async () => {
        if (!selectedReservation) return;
        try {
            await api.post(`/reservations/${selectedReservation._id}/cancel`);
            showNotification('Reserva cancelada.');
            fetchReservations();
        } catch (err) {
            showNotification(err.response?.data?.msg || 'Error al cancelar la reserva.', 'error');
        } finally {
            handleCloseModals();
        }
    };

    if (loading) return <div className="text-gray-800 dark:text-gray-200">Cargando reservas...</div>;

    return (
        <div>
            <Notification {...notification} />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Reservas</h1>
                <div className="flex items-center gap-4">
                    <input type="text" placeholder="Buscar por usuario o ítem..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Crear Reserva
                    </button>
                </div>
            </div>
            
            
            <Modal isOpen={isCreateModalOpen} onClose={handleCloseModals} title="Crear Nueva Reserva Manual">
                <CreateLoanForm onSubmit={handleCreateReservation} onCancel={handleCloseModals} />
            </Modal>
            
            <Modal isOpen={isConfirmModalOpen} onClose={handleCloseModals} title="Confirmar Retiro">
                <div className="space-y-4">
                    <p className="dark:text-gray-300">
                        ¿Estás seguro de que deseas confirmar el retiro del ítem <strong className="dark:text-white">{selectedReservation?.itemDetails?.name}</strong> para el usuario <strong className="dark:text-white">{selectedReservation?.usuarioId?.primerNombre} {selectedReservation?.usuarioId?.primerApellido}</strong>?
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Esta acción creará un nuevo préstamo y no se puede deshacer.</p>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                            No, volver
                        </button>
                        <button type="button" onClick={executeConfirm} className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                            Sí, confirmar retiro
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isCancelModalOpen} onClose={handleCloseModals} title="Cancelar Reserva">
                <div className="space-y-4">
                    <p className="dark:text-gray-300">
                        ¿Estás seguro de que deseas cancelar esta reserva? El ítem volverá a estar disponible para otros usuarios.
                    </p>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={handleCloseModals} className="px-4 py-2 font-medium text-gray-600 bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                            No, volver
                        </button>
                        <button type="button" onClick={executeCancel} className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                            Sí, cancelar reserva
                        </button>
                    </div>
                </div>
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
                                        <button onClick={() => handleOpenConfirmModal(res)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Confirmar Retiro</button>
                                        <button onClick={() => handleOpenCancelModal(res)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Cancelar Reserva</button>
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