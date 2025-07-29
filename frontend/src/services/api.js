/*
 * ----------------------------------------------------------------
 * Configuración central de Axios para las llamadas a la API.
 * ----------------------------------------------------------------
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // URL base de backend
});

// Interceptor para añadir el token a todas las peticiones protegidas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

