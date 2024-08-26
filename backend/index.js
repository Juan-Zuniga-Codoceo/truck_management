require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const { expressjwt: jwt } = require('express-jwt');
const { body, validationResult } = require('express-validator');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const driverRoutes = require('./routes/driverRoutes');
const routeRoutes = require('./routes/routeRoutes');
const { createCorsMiddleware, handleCorsErrors } = require('./middlewares/corsMiddleware');
const errorHandlerMiddleware = require('./middlewares/errorHandlerMiddleware');
const logger = require('./utils/logger');
const cacheMiddleware = require('./middlewares/cacheMiddleware');
const inputSanitizationMiddleware = require('./middlewares/inputSanitizationMiddleware');

const app = express();

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

// Compresión Gzip
app.use(compression());

// Parseo de JSON con límite de tamaño
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Limitador de tasa
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.RATE_LIMIT || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
});
app.use(limiter);

// CORS
app.use(createCorsMiddleware());
app.use(handleCorsErrors);


// JWT Authentication
app.use(jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
}).unless({ path: ['/health', '/api-docs', '/login'] }));

// Documentación API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    memoryUsage: process.memoryUsage()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la API de gestión de camiones');
});

// Ejemplo de sanitización y validación de inputs en login
app.post('/login', 
  inputSanitizationMiddleware({
    fields: {
      username: ['trim', 'escape'],
      password: ['trim']
    }
  }), 
  [
    body('username').isEmail().withMessage('Debe ser un email válido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
      .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  ], 
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Lógica de login aquí
  }
);

// Rutas
app.use('/api/drivers', cacheMiddleware({ ttl: 300 }), driverRoutes);
app.use('/api/routes', cacheMiddleware({ ttl: 300 }), routeRoutes);

// Manejador de 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de manejo de errores global
app.use(errorHandlerMiddleware);

// Manejo de promesas no capturadas
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app; // Para pruebas
