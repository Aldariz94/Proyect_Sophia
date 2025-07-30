import React from 'react';
import Header from '../components/Header';

const PublicLayout = ({ children, onLoginClick }) => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header onLoginClick={onLoginClick} />
            <main className="container mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
};

export default PublicLayout;