const { ValidationError } = require('../errors');
const logger = require('../utils/logger'); // Asegúrate de tener un logger configurado

// Middleware de validación
const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      logger.warn(`Error de validación: ${errorMessages.join(', ')} - Request: ${req.method} ${req.originalUrl}`);
      next(new ValidationError(errorMessages.join(', '))); // Pasar el error al siguiente middleware
    } else {
      next(); // Continuar si no hay errores
    }
  };
};

module.exports = validationMiddleware;