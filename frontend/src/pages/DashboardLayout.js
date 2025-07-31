import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import UserManagementPage from './UserManagementPage';
import BookManagementPage from './BookManagementPage';
import ResourceManagementPage from './ResourceManagementPage';
import LoanManagementPage from './LoanManagementPage';
import SanctionsPage from './SanctionsPage';
import ReservationsPage from './ReservationsPage';
import ReportsPage from './ReportsPage'; 
import DashboardPage from './DashboardPage';
import InventoryManagementPage from './InventoryManagementPage';
import Footer from '../components/Footer'; 

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
            case 'reservas':
                return <ReservationsPage />;
            case 'sanciones':
                return <SanctionsPage />;
            case 'inventario': 
                return <InventoryManagementPage />;
            case 'reportes': 
                return <ReportsPage />;
            case 'dashboard':
            default:
                return <DashboardPage />
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
            {/* Este div debe ser una columna flex para que el footer se alinee abajo */}
            <div className="flex flex-col flex-1">
                {/* El main crece para empujar el footer */}
                <main className="flex-1 p-10">
                    {renderPage()}
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default DashboardLayout;