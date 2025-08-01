// backend/server.js
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

// 1️⃣ Confía en el proxy de Railway para leer X-Forwarded-For
app.set('trust proxy', 1);

// 2️⃣ Configuración de CORS
const allowedOrigins = [
  'https://frontend-production-f4b0.up.railway.app', // Tu front en Railway
  'https://proyect-sophia-fe.onrender.com',          // Otro front en producción
  'http://localhost:3000'                            // Desarrollo local
];

const corsOptions = {
  origin(origin, callback) {
    console.log('🛡️ CORS origin recibido:', origin);
    // Permite sin origin (Postman, apps móviles) o si está en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Bloquea otros origins
    return callback(null, false);
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 200
};

// Aplica CORS a todas las rutas
app.use(cors(corsOptions));
// Maneja preflight (OPTIONS) explícitamente
app.options('*', cors(corsOptions));

// 3️⃣ Parseo de JSON
app.use(express.json());

// 4️⃣ Rate Limiting (limita a 100 peticiones por IP cada 15 min)
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 100;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas peticiones desde esta IP, inténtalo de nuevo en 15 min.'
});
app.use('/api', limiter);

// 5️⃣ Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado exitosamente.'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// 6️⃣ Rutas de la API
app.get('/', (req, res) => {
  res.send('API del Sistema de Biblioteca CRA está funcionando!');
});

app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/users',        require('./routes/userRoutes'));
app.use('/api/books',        require('./routes/bookRoutes'));
app.use('/api/resources',    require('./routes/resourceRoutes'));
app.use('/api/loans',        require('./routes/loanRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/search',       require('./routes/searchRoutes'));
app.use('/api/public',       require('./routes/publicRoutes'));
app.use('/api/dashboard',    require('./routes/dashboardRoutes'));
app.use('/api/inventory',    require('./routes/inventoryRoutes'));
app.use('/api/import',       require('./routes/importRoutes'));

// 7️⃣ Arranque del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
