import React from 'react';
import { useTheme } from '../context';

const Header = ({ onLoginClick }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-white shadow-md dark:bg-gray-800">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Proyect Sophia - Catálogo
                </h1>
                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600">
                        Modo {theme === 'light' ? 'Oscuro' : 'Claro'}
                    </button>
                    <button onClick={onLoginClick} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;