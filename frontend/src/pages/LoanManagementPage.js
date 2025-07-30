// frontend/src/pages/LoanManagementPage.js
import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import CreateLoanForm from '../components/CreateLoanForm';
import RenewLoanForm from '../components/RenewLoanForm';
import ReturnLoanForm from '../components/ReturnLoanForm'; // <-- Importación nueva

const LoanManagementPage = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [renewingLoanId, setRenewingLoanId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Nuevos estados para el modal de devolución
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returningLoan, setReturningLoan] = useState(null);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const response = await api.get('/loans');
            setLoans(response.data);
        } catch (err) {
            setError('No se pudo cargar el historial de préstamos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const filteredLoans = useMemo(() => {
        if (!searchTerm) return loans;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return loans.filter(loan => {
            const userName = `${loan.usuarioId?.primerNombre} ${loan.usuarioId?.primerApellido}`.toLowerCase();
            const itemName = (loan.itemDetails?.titulo || loan.itemDetails?.nombre || '').toLowerCase();
            return userName.includes(lowerCaseSearch) || itemName.includes(lowerCaseSearch) || loan.estado.includes(lowerCaseSearch);
        });
    }, [loans, searchTerm]);

    const handleCreateLoan = async (loanData) => {
        try {
            await api.post('/loans', loanData);
            setIsCreateModalOpen(false);
            fetchLoans();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error al crear el préstamo.');
        }
    };

    const handleOpenRenewModal = (loanId) => {
        setRenewingLoanId(loanId);
        setIsRenewModalOpen(true);
    };

    const handleRenewLoan = async (days) => {
        try {
            await api.put(`/loans/${renewingLoanId}/renew`, { days });
            setIsRenewModalOpen(false);
            setRenewingLoanId(null);
            fetchLoans();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error al renovar el préstamo.');
        }
    };

    // Abre el modal de devolución
    const handleOpenReturnModal = (loan) => {
        setReturningLoan(loan);
        setIsReturnModalOpen(true);
    };

    // Envía la devolución con el nuevo estado del ítem
    const handleReturnLoan = async ({ newStatus }) => {
        if (!returningLoan) return;
        try {
            await api.post(`/loans/return/${returningLoan._id}`, { newStatus });
            setIsReturnModalOpen(false);
            setReturningLoan(null);
            fetchLoans();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error al procesar la devolución.');
        }
    };

    if (loading) return <div className="text-gray-800 dark:text-gray-200">Cargando préstamos...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Préstamos</h1>
                <div className="flex items-center gap-4">
                    <input type="text" placeholder="Buscar por usuario, ítem, estado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
                        Crear Préstamo
                    </button>
                </div>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Crear Nuevo Préstamo">
                <CreateLoanForm onSubmit={handleCreateLoan} onCancel={() => setIsCreateModalOpen(false)} />
            </Modal>

            <Modal isOpen={isRenewModalOpen} onClose={() => setIsRenewModalOpen(false)} title="Renovar Préstamo">
                <RenewLoanForm onSubmit={handleRenewLoan} onCancel={() => setIsRenewModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} title="Procesar Devolución">
                <ReturnLoanForm onSubmit={handleReturnLoan} onCancel={() => setIsReturnModalOpen(false)} />
            </Modal>

            <h2 className="mt-10 text-2xl font-bold text-gray-800 dark:text-white">Historial de Préstamos</h2>
            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Ítem Prestado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Vencimiento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredLoans.map(loan => (
                            <tr key={loan._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{loan.usuarioId?.primerNombre || 'N/A'} {loan.usuarioId?.primerApellido || ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{loan.itemDetails?.titulo || loan.itemDetails?.nombre || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{new Date(loan.fechaVencimiento).toLocaleDateString('es-CL')}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        loan.estado === 'atrasado' ? 'bg-red-100 text-red-800' : 
                                        loan.estado === 'devuelto' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {loan.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                    {(loan.estado === 'enCurso' || loan.estado === 'atrasado') && (
                                        <button onClick={() => handleOpenReturnModal(loan)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Devolver</button>
                                    )}
                                    {loan.estado === 'enCurso' && (
                                        <button onClick={() => handleOpenRenewModal(loan._id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Renovar</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoanManagementPage;