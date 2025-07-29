
/*
 * ----------------------------------------------------------------
 * Se envuelve la app en el ThemeProvider.
 * ----------------------------------------------------------------
 */
import React from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // Importar ThemeProvider
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';

const AppContent = () => {
  const { user } = React.useContext(AuthContext);
  return user ? <DashboardLayout /> : <LoginPage />;
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