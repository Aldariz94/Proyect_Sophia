// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Configuración de CORS Universal (para Desarrollo y Producción) ---
const allowedOrigins = [
    'https://proyect-sophia-fe.onrender.com', // Frontend en Producción
    'http://localhost:3000'                   // Frontend en Desarrollo Local
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite peticiones sin origen (como las de Postman o apps móviles)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política de CORS para este sitio no permite el acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

app.use(cors(corsOptions)); // <-- Usa la nueva configuración de CORS

app.use(express.json());

// --- Rate Limiting ---
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 100;
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: `Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.`
});
app.use('/api', limiter);

// --- Conexión a la Base de Datos ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado exitosamente.'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

// --- Rutas de la API ---
app.get('/', (req, res) => {
    res.send('API del Sistema de Biblioteca CRA está funcionando!');
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/import', require('./routes/importRoutes'));

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));