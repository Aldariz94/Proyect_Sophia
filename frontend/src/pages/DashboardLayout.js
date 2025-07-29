import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import UserManagementPage from './UserManagementPage';
import BookManagementPage from './BookManagementPage';
import ResourceManagementPage from './ResourceManagementPage';
import LoanManagementPage from './LoanManagementPage';
import SanctionsPage from './SanctionsPage'; // NUEVA IMPORTACIÓN

const DashboardLayout = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');

    const renderPage = () => {
        switch (currentPage) {
            case 'usuarios':
                return <UserManagementPage />;
            case 'libros':
                return <BookManagementPage />;
            case 'recursos':
                return <ResourceManagementPage />;
            case 'prestamos':
                return <LoanManagementPage />;
            case 'sanciones': // NUEVO CASO
                return <SanctionsPage />;
            case 'dashboard':
            default:
                return (
                    <div className="text-gray-800 dark:text-gray-200">
                        <h2 className="text-3xl font-bold">Bienvenido al Sistema de Biblioteca</h2>
                        <p className="mt-2 text-lg">Selecciona una opción del menú para comenzar.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex bg-gray-100 dark:bg-gray-900">
            <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
            <main className="flex-1 p-10">
                {renderPage()}
            </main>
        </div>
    );
};

export default DashboardLayout;