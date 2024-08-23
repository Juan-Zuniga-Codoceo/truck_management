const { ForbiddenError } = require('../errors');
const logger = require('../utils/logger');

// Este middleware verifica si el usuario tiene el rol necesario para realizar una acción
const checkUserPermissions = (requiredRoles) => {
  return (req, res, next) => {
    try {
      // Verificar que req.user y req.user.role estén definidos
      if (!req.user || !req.user.role) {
        logger.warn('Usuario no autenticado o rol no definido');
        throw new ForbiddenError('No tienes permisos para realizar esta acción');
      }

      const userRole = req.user.role; // Asegúrate de que el rol del usuario esté asignado en `req.user`

      if (!requiredRoles.includes(userRole)) {
        logger.warn(`Usuario ID: ${req.user.id} no tiene permiso para acceder a esta ruta`);
        throw new ForbiddenError('No tienes permisos para realizar esta acción');
      }

      logger.info(`Usuario ID: ${req.user.id} tiene los permisos necesarios`);
      next(); // El usuario tiene permiso, continuar
    } catch (error) {
      logger.error(`Error de permisos: ${error.message}`);
      res.status(403).json({ error: error.message });
    }
  };
};

module.exports = checkUserPermissions;