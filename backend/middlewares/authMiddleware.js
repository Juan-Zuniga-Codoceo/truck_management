const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError } = require('../errors');
const config = require('../config');
const logger = require('../utils/logger'); // Asegúrate de tener un logger configurado

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      logger.warn('Token no proporcionado');
      throw new UnauthorizedError('Token no proporcionado');
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      logger.warn(`Usuario no encontrado: ${decoded.id}`);
      throw new UnauthorizedError('Usuario no encontrado');
    }

    req.user = user; // Asignar el usuario a la solicitud
    logger.info(`Usuario autenticado: ${user.id}`);
    next(); // Continuar con la siguiente función middleware
  } catch (error) {
    logger.error(`Error en autenticación: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(401).json({ error: error.message });
  }
};

module.exports = authMiddleware;