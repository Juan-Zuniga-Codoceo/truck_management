const cors = require('cors');
const logger = require('../utils/logger');

// Middleware de CORS
const createCorsMiddleware = (options = {}) => {
    const {
        whitelist = process.env.CORS_WHITELIST ? process.env.CORS_WHITELIST.split(',') : ['http://localhost:3000', 'https://mi-dominio.com'],
        methods = process.env.CORS_METHODS ? process.env.CORS_METHODS.split(',') : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders = process.env.CORS_HEADERS ? process.env.CORS_HEADERS.split(',') : ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials = process.env.CORS_CREDENTIALS !== 'false', // Convertir a booleano
        optionsSuccessStatus = parseInt(process.env.CORS_SUCCESS_STATUS, 10) || 204,
        maxAge = parseInt(process.env.CORS_MAX_AGE, 10) || 86400,
    } = options;

    const corsOptions = {
        origin: (origin, callback) => {
            if (!origin || whitelist.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('No permitido por CORS'));
            }
        },
        methods: methods.join(','),
        allowedHeaders: allowedHeaders.join(','),
        credentials: credentials,
        optionsSuccessStatus: optionsSuccessStatus,
        maxAge: maxAge,
    };

    return cors(corsOptions);
};

// Middleware para manejar errores de CORS
const handleCorsErrors = (err, req, res, next) => {
    if (err instanceof Error && err.message === 'No permitido por CORS') {
        logger.warn(`Intento de acceso CORS bloqueado desde origen: ${req.headers.origin}`);
        res.status(403).json({
            error: 'Acceso no permitido por política CORS',
            message: 'El origen de esta solicitud no está en la lista blanca de dominios permitidos.'
        });
    } else {
        next(err);
    }
};

module.exports = {
    createCorsMiddleware,
    handleCorsErrors
};