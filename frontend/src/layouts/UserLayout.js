import React, { useState } from 'react';
import UserSidebar from '../components/UserSidebar';
import CatalogPage from '../pages/CatalogPage';
import MyLoansPage from '../pages/MyLoansPage';
import MyReservationsPage from '../pages/MyReservationsPage';
import Footer from '../components/Footer'; 

const UserLayout = () => {
    const [currentPage, setCurrentPage] = useState('catalog');

    const renderPage = () => {
        switch (currentPage) {
            case 'my-loans':
                return <MyLoansPage />;
            case 'my-reservations': // <-- CASO NUEVO
                return <MyReservationsPage />;
            case 'catalog':
            default:
                return <CatalogPage isUserView={true} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <UserSidebar onNavigate={setCurrentPage} currentPage={currentPage} />
            {/* Misma lógica que en el DashboardLayout */}
            <div className="flex flex-col flex-1">
                <main className="flex-1 p-10">
                    {renderPage()}
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default UserLayout;