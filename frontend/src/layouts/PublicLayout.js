// frontend/src/layouts/PublicLayout.js
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PublicLayout = ({ children, onLoginClick }) => {
    return (
        // Contenedor principal: ocupa al menos el 100% de la altura y es una columna flex
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
            <Header onLoginClick={onLoginClick} />
            {/* El contenido principal crece para ocupar el espacio disponible */}
            <main className="container mx-auto px-6 py-8 flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;