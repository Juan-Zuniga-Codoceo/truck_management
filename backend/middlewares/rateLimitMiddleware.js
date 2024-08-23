const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Middleware de limitación de tasa
 *
 * @param {Object} options - Opciones de configuración del middleware
 * @param {number} [options.windowMs=15 * 60 * 1000] - Ventana de tiempo en milisegundos (15 minutos por defecto)
 * @param {number} [options.max=100] - Máximo número de solicitudes permitidas por ventana
 * @param {string} [options.message='Too many requests, please try again later.'] - Mensaje devuelto al exceder el límite
 * @param {boolean} [options.standardHeaders=true] - Incluir el límite en los encabezados de respuesta estándar
 * @param {boolean} [options.legacyHeaders=false] - Desactivar encabezados heredados `X-RateLimit-*`
 * @returns {Function} Middleware de Express
 */
const rateLimitMiddleware = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos por defecto
    max = 100, // Límite de 100 solicitudes por ventana
    message = 'Too many requests, please try again later.',
    standardHeaders = true,
    legacyHeaders = false,
  } = options;

  const limiter = rateLimit({
    windowMs,
    max,
    standardHeaders,
    legacyHeaders,
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(options.statusCode).json({ error: message });
    },
    onLimitReached: (req, res, options) => {
      logger.warn(`Rate limit reached for IP: ${req.ip}`);
    },
  });

  return limiter;
};

module.exports = rateLimitMiddleware;