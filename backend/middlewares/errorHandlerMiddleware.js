const { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

// Middleware de manejo de errores
const errorHandlerMiddleware = (err, req, res, next) => {
  let statusCode;
  let errorMessage;

  // Determina el tipo de error y asigna el código de estado y el mensaje correspondientes
  if (err instanceof ValidationError) {
    statusCode = 400;
    errorMessage = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    errorMessage = err.message;
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    errorMessage = err.message;
  } else if (err instanceof ForbiddenError) {
    statusCode = 403;
    errorMessage = err.message;
  } else {
    statusCode = 500; // Error de servidor interno por defecto
    errorMessage = 'Ha ocurrido un error inesperado';
  }

  // Registra el error
  logger.error(`Error: ${errorMessage}, Status Code: ${statusCode}, Request: ${req.method} ${req.originalUrl}, Body: ${JSON.stringify(req.body)}, Params: ${JSON.stringify(req.params)}, Query: ${JSON.stringify(req.query)}`);

  // Devuelve la respuesta de error al cliente
  res.status(statusCode).json({ error: errorMessage });
};

module.exports = errorHandlerMiddleware;