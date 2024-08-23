const compression = require('compression');
const mime = require('mime-types');
const logger = require('../utils/logger');

/**
 * Middleware de compresión
 *
 * @param {Object} options - Opciones de configuración del middleware
 * @param {number} [options.level=6] - Nivel de compresión (0-9)
 * @param {number} [options.threshold=1024] - Tamaño mínimo en bytes para comprimir
 * @param {Array<string>} [options.excludeMimeTypes=[]] - Lista de MIME types a excluir de la compresión
 * @param {boolean} [options.enableBrotli=false] - Habilitar compresión Brotli
 * @param {boolean} [options.enableCache=true] - Habilitar caché de compresión
 * @param {number} [options.chunkSize=16384] - Tamaño del chunk para la compresión
 * @returns {Function} Middleware de Express
 */
const compressionMiddleware = (options = {}) => {
  const {
    level = 6,
    threshold = 1024,
    excludeMimeTypes = [],
    enableBrotli = false,
    enableCache = true,
    chunkSize = 16 * 1024, // 16KB por defecto
  } = options;

  // Validación de nivel de compresión
  const compressionLevel = Math.max(0, Math.min(9, Math.floor(level)));

  // Validación de threshold
  const compressionThreshold = Math.max(0, Math.floor(threshold));

  // Validación de chunkSize
  const compressionChunkSize = Math.max(1024, Math.floor(chunkSize));

  // Función de filtro personalizada
  const filter = (req, res) => {
    if (req.headers['x-no-compression']) {
      logger.debug('Compression skipped due to x-no-compression header');
      return false; // No comprimir si se envía este encabezado
    }

    const contentType = res.getHeader('Content-Type');
    if (contentType) {
      const mimeType = contentType.split(';')[0].trim();
      if (excludeMimeTypes.includes(mimeType)) {
        logger.debug(`Compression skipped for excluded MIME type: ${mimeType}`);
        return false; // No comprimir si el MIME type está excluido
      }
    }

    return compression.filter(req, res);
  };

  // Configuración de compresión
  const compressionOptions = {
    level: compressionLevel,
    threshold: compressionThreshold,
    filter,
    brotli: enableBrotli ? { enabled: true, params: { [require('zlib').constants.BROTLI_PARAM_SIZE_HINT]: compressionThreshold } } : false,
    cache: enableCache,
    chunkSize: compressionChunkSize,
  };

  // Logging de la configuración
  logger.info('Compression middleware configured:', JSON.stringify(compressionOptions, null, 2));

  return (req, res, next) => {
    try {
      compression(compressionOptions)(req, res, next);
    } catch (error) {
      logger.error('Error in compression middleware:', error);
      next(error);
    }
  };
};

module.exports = compressionMiddleware;
