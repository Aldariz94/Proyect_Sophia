// server.js
// Punto de entrada principal de la aplicación del servidor.

const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const cors = require('cors');
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 100;
require('dotenv').config();

// --- Inicialización de la App ---
const app = express();
const PORT = process.env.PORT || 5001;

// --- Middlewares ---
// Habilita CORS para permitir peticiones desde el frontend
app.use(cors());
// Permite al servidor entender JSON en el cuerpo de las peticiones
app.use(express.json());

// --- APLICAR RATE LIMITING ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: maxRequests, // Limita cada IP a x peticiones segun el archivo .env cada 15 minutos
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.'
});

// Aplicar el middleware a todas las rutas que empiezan con /api
app.use('/api', limiter); // <-- 2. Usar el middleware

app.use('/api/reservations', require('./routes/reservationRoutes'));
// --- Conexión a la Base de Datos (MongoDB) ---
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB conectado exitosamente."))
.catch(err => console.error("Error al conectar a MongoDB:", err));

// --- Rutas de la API ---
// Se definen las rutas principales de la aplicación.
// Cada ruta agrupa un conjunto de endpoints relacionados a una entidad.
app.get('/', (req, res) => {
    res.send('API del Sistema de Biblioteca CRA está funcionando!');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));


// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});