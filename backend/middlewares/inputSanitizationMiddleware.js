const { body } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware de sanitización de entradas
 *
 * @param {Object} options - Opciones de configuración del middleware
 * @param {Object} options.fields - Objeto con campos a sanitizar y sus métodos de sanitización
 * @returns {Array<Function>} Array de middleware de Express
 */
const inputSanitizationMiddleware = (options = {}) => {
  const { fields = {} } = options;

  return Object.keys(fields).map(field => {
    const sanitizationMethods = fields[field];
    let sanitizationChain = body(field);

    sanitizationMethods.forEach(method => {
      switch (method) {
        case 'escape':
          sanitizationChain = sanitizationChain.escape();
          break;
        case 'trim':
          sanitizationChain = sanitizationChain.trim();
          break;
        case 'toInt':
          sanitizationChain = sanitizationChain.toInt();
          break;
        default:
          logger.warn(`Método de sanitización desconocido: ${method}`);
          // Considera lanzar un error o manejar el error de otra manera
      }
    });

    return sanitizationChain;
  });
};

module.exports = inputSanitizationMiddleware;