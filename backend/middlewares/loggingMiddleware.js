const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Middleware de logging
const loggingMiddleware = (options = {}) => (req, res, next) => {
  const start = process.hrtime();
  const requestId = options.getRequestId ? options.getRequestId(req) : uuidv4();

  req.requestId = requestId;

  // Capturar el cuerpo de la solicitud de manera segura
  const safeBody = getSafeBody(req.body, options.additionalSensitiveFields);

  // Loguear la solicitud entrante
  logger.info({
    message: 'Solicitud entrante',
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: safeBody,
    headers: options.logHeaders ? req.headers : undefined,
    userAgent: req.get('User-Agent')
  });

  // Interceptar y loguear la respuesta
  const originalSend = res.send;
  res.send = function (body) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };

  // Escuchar el evento 'finish' para loguear la respuesta
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationInMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

    const responseBody = res.locals.responseBody;
    const safeResponseBody = options.logResponseBody ? getSafeBody(responseBody, options.additionalSensitiveFields) : undefined;

    logger.info({
      message: 'Respuesta enviada',
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${durationInMs}ms`,
      responseBody: safeResponseBody,
      headers: options.logHeaders ? res.getHeaders() : undefined
    });
  });

  next();
};

// Función para obtener una versión segura del cuerpo (evitando información sensible)
function getSafeBody(body, additionalSensitiveFields = []) {
  if (!body || typeof body !== 'object') return null;

  const sensitiveFields = ['password', 'token', 'credit_card', ...additionalSensitiveFields];

  return redactSensitiveFields(body, sensitiveFields);
}

// Función recursiva para redactar campos sensibles en profundidad
function redactSensitiveFields(obj, sensitiveFields) {
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveFields(item, sensitiveFields));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      if (sensitiveFields.includes(key)) {
        acc[key] = '[REDACTED]';
      } else {
        acc[key] = redactSensitiveFields(obj[key], sensitiveFields);
      }
      return acc;
    }, {});
  }
  return obj;
}

module.exports = loggingMiddleware;