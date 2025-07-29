/*
 * ----------------------------------------------------------------
 * Contexto para gestionar la autenticación en toda la app.
 * ----------------------------------------------------------------
 */
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Necesitarás instalar jwt-decode: yarn add jwt-decode

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Comprobar si hay un token al cargar la app
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // Opcional: verificar si el token ha expirado
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser({ rol: decodedUser.user.rol, id: decodedUser.user.id });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Error decodificando el token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (correo, password) => {
    try {
      const response = await api.post('/auth/login', { correo, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const decodedUser = jwtDecode(token);
      setUser({ rol: decodedUser.user.rol, id: decodedUser.user.id });
      return true;
    } catch (error) {
      console.error('Error en el inicio de sesión:', error.response?.data?.msg || 'Error de red');
      throw new Error(error.response?.data?.msg || 'Error al iniciar sesión');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Cargando...</div>; // O un spinner de carga
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

