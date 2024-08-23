const Redis = require('ioredis');
const logger = require('../utils/logger');

/**
 * Middleware de caché
 *
 * @param {Object} options - Opciones de configuración del middleware
 * @param {string} [options.prefix='cache:'] - Prefijo para las claves de caché
 * @param {number} [options.ttl=60] - Tiempo de vida de la caché en segundos
 * @param {Function} [options.keyGenerator] - Función opcional para generar claves de caché personalizadas
 * @param {Object} [options.redisOptions] - Opciones de configuración para la conexión Redis
 * @returns {Function} Middleware de Express
 */
const cacheMiddleware = (options = {}) => {
  const {
    prefix = 'cache:',
    ttl = 60,
    keyGenerator,
    redisOptions = {}
  } = options;

  const cache = new Redis(redisOptions);

  cache.on('error', (error) => {
    logger.error(`Redis connection error: ${error.message}`);
  });

  return async (req, res, next) => {
    try {
      const key = keyGenerator ? keyGenerator(req) : `${prefix}${req.originalUrl}`;

      // Verificar si la respuesta ya está en la caché
      const cachedResponse = await cache.get(key);
      if (cachedResponse) {
        logger.info(`Cache hit for ${key}`);
        return res.json(JSON.parse(cachedResponse));
      }

      // Sobrescribir res.json para almacenar la respuesta en caché
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        const stringBody = JSON.stringify(body);
        cache.set(key, stringBody, 'EX', ttl)
          .then(() => logger.info(`Cache set for ${key} with TTL ${ttl}`))
          .catch(err => logger.error(`Error setting cache for ${key}: ${err.message}`));
        originalJson(body);
      };

      next();
    } catch (error) {
      logger.error(`Error in cache middleware: ${error.message}`);
      next(error);
    }
  };
};

module.exports = cacheMiddleware;