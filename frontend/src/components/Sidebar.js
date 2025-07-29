import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ onNavigate, currentPage }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'usuarios', label: 'Gestión de Usuarios' },
    { key: 'libros', label: 'Gestión de Libros' },
    { key: 'recursos', label: 'Gestión de Recursos' },
    { key: 'prestamos', label: 'Préstamos' },
    { key: 'sanciones', label: 'Sanciones' }, // NUEVO ENLACE
  ];

  return (
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-white border-r dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white">Sophia</h2>
      <nav className="flex-grow mt-6">
        {navItems.map((item) => (
          <a
            key={item.key}
            className={`flex items-center px-4 py-2 mt-5 text-gray-600 transition-colors duration-300 transform rounded-md dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-200 hover:text-gray-700 ${
              currentPage === item.key ? 'bg-gray-200 dark:bg-gray-700' : ''
            }`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.key);
            }}>
            <span className="mx-4 font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="mt-auto">
        <button onClick={toggleTheme} className="w-full px-4 py-2 mb-4 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600">
          Modo {theme === 'light' ? 'Oscuro' : 'Claro'}
        </button>
        <button onClick={logout} className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;