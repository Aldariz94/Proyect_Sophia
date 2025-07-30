import React from 'react'; // CORREGIDO: Se elimina useState
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import CatalogPage from './pages/CatalogPage';
import UserLayout from './layouts/UserLayout';
import { useAuth } from './hooks/useAuth';

const AppContent = () => {
    const { user, showLogin, setShowLogin } = useAuth();

    if (user) {
        if (user.rol === 'admin') {
            return <DashboardLayout />;
        }
        return <UserLayout />;
    }

    if (showLogin) {
        return <LoginPage />;
    }

    return (
        <PublicLayout onLoginClick={() => setShowLogin(true)}>
            <CatalogPage />
        </PublicLayout>
    );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;