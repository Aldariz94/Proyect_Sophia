import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import UserDetails from '../components/UserDetails';
import ImportComponent from '../components/ImportComponent';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            setError('No se pudo cargar la lista de usuarios.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return users.filter(user =>
            Object.values(user).some(val =>
                String(val).toLowerCase().includes(lowerCaseSearch)
            )
        );
    }, [users, searchTerm]);

    const handleOpenCreateModal = () => {
        setEditingUser(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setIsFormModalOpen(true);
    };
    
    const handleOpenViewModal = (user) => {
        setViewingUser(user);
        setIsViewModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsViewModalOpen(false);
        setEditingUser(null);
        setViewingUser(null);
    };

    const handleSubmit = async (userData) => {
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser._id}`, userData);
            } else {
                await api.post('/users', userData);
            }
            handleCloseModals();
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error al guardar el usuario.');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await api.delete(`/users/${userId}`);
                fetchUsers();
            } catch (err) {
                alert(err.response?.data?.msg || 'Error al eliminar el usuario.');
            }
        }
    };

    if (loading) return <div className="text-gray-800 dark:text-gray-200">Cargando usuarios...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Usuarios</h1>
                <div className="flex items-center gap-4">
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    {/* 3. Añade el botón de Importar */}
                    <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 whitespace-nowrap">
                        Importar
                    </button>
                    <button onClick={handleOpenCreateModal} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 whitespace-nowrap">
                        Crear Usuario
                    </button>
                </div>
            </div>

            <Modal isOpen={isFormModalOpen} onClose={handleCloseModals} title={editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}>
                <UserForm onSubmit={handleSubmit} onCancel={handleCloseModals} initialData={editingUser} />
            </Modal>
            
            <Modal isOpen={isViewModalOpen} onClose={handleCloseModals} title="Detalles del Usuario">
                <UserDetails user={viewingUser} />
            </Modal>

            {/* 4. Añade el nuevo modal de importación */}
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Usuarios desde Excel">
                <ImportComponent importType="users" onImportSuccess={() => {
                    setIsImportModalOpen(false);
                    fetchUsers();
                }} />
            </Modal>

            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">RUT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Correo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Curso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map(user => (
                            <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{user.primerNombre} {user.primerApellido}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{user.rut}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{user.correo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{user.rol}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-300">{user.rol === 'alumno' ? user.curso : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                    <button onClick={() => handleOpenViewModal(user)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Ver</button>
                                    <button onClick={() => handleOpenEditModal(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementPage;