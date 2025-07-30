import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext'; // <-- Se importa el nuevo hook

const UserSidebar = ({ onNavigate, currentPage }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { key: 'catalog', label: 'Catálogo' },
        { key: 'my-loans', label: 'Mis Préstamos' },
        { key: 'my-reservations', label: 'Mis Reservas' },
    ];

    const getInitials = (name, lastName) => {
        if (!name || !lastName) return '..';
        return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="flex flex-col w-64 h-screen px-4 py-8 bg-white border-r dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white">Proyect Sophia</h2>
            <div className="flex flex-col items-center mt-6 -mx-2">
                <div className="w-24 h-24 mx-2 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                        {getInitials(user?.primerNombre, user?.primerApellido)}
                    </span>
                </div>
                <h4 className="mx-2 mt-2 font-medium text-gray-800 dark:text-gray-200 capitalize">{user ? `${user.primerNombre} ${user.primerApellido}` : 'Cargando...'}</h4>
                <p className="mx-2 mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">{user ? user.correo : ''}</p>
            </div>
            <nav className="flex-grow mt-6">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`flex items-center w-full px-4 py-2 mt-2 text-gray-600 transition-colors duration-300 transform rounded-md dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-200 hover:text-gray-700 ${
                            currentPage === item.key ? 'bg-gray-200 dark:bg-gray-700' : ''
                        }`}
                        onClick={() => onNavigate(item.key)}
                    >
                        <span className="mx-4 font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="mt-auto">
                <button onClick={toggleTheme} className="w-full px-4 py-2 mb-2 text-sm font-medium text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300">
                    Modo {theme === 'light' ? 'Oscuro' : 'Claro'}
                </button>
                <button onClick={logout} className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-300">
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default UserSidebar;
