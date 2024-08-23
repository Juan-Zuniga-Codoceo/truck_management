const { User } = require('../models');
const { ValidationError, NotFoundError } = require('../errors');
const userService = require('../services/userService');
const logger = require('../utils/logger');
const { validateUser } = require('../validators/userValidator');
const Redis = require('ioredis');
const bcrypt = require('bcrypt');
const { checkUserPermissions } = require('../middlewares/authMiddleware'); // Middleware para verificar permisos

const redis = new Redis();

class UserController {
  // Crear un nuevo usuario
  async create(req, res, next) {
    try {
      await validateUser(req.body);
      const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash seguro de la contraseña
      const user = await userService.createUser({ ...req.body, password: hashedPassword });
      logger.info(`Usuario creado con ID: ${user.id} por el usuario ID: ${req.user.id} desde la IP: ${req.ip}`);
      await this.invalidateCache('users'); // Invalida caché después de crear un usuario
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al crear usuario:', error);
      next(error);
    }
  }

  // Obtener todos los usuarios con paginación y filtrado
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, name, email } = req.query;
      const filters = { name, email };
      const paginationOptions = { page: Number(page), limit: Number(limit) };

      const cacheKey = `users:${JSON.stringify({ filters, paginationOptions })}`;
      const cachedResult = await redis.get(cacheKey);

      if (cachedResult) {
        logger.info('Devolviendo usuarios desde caché');
        return res.status(200).json(JSON.parse(cachedResult));
      }

      const result = await userService.getAllUsers(filters, paginationOptions);
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300); // Cache for 5 minutes
      logger.info(`Recuperados ${result.count} usuarios por el usuario ID: ${req.user.id} desde la IP: ${req.ip}`);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al obtener usuarios:', error);
      next(error);
    }
  }

  // Obtener un usuario por ID
  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      logger.info(`Usuario ID: ${req.params.id} recuperado por el usuario ID: ${req.user.id} desde la IP: ${req.ip}`);
      await this.invalidateCache(`user:${req.params.id}`);
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener usuario por ID:', error);
      next(error);
    }
  }

  // Actualizar un usuario
  async update(req, res, next) {
    try {
      await validateUser(req.body, true);

      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10); // Hash seguro de la contraseña si se actualiza
      }

      const updatedUser = await userService.updateUser(req.params.id, req.body);
      await this.invalidateCache('users'); // Invalida caché después de actualizar un usuario
      await this.invalidateCache(`user:${req.params.id}`); // Invalida caché del usuario específico
      logger.info(`Usuario ID: ${req.params.id} actualizado por el usuario ID: ${req.user.id} desde la IP: ${req.ip}`);
      return res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al actualizar usuario:', error);
      next(error);
    }
  }

  // Eliminar un usuario
  async delete(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      await this.invalidateCache('users'); // Invalida caché después de eliminar un usuario
      await this.invalidateCache(`user:${req.params.id}`); // Invalida caché del usuario específico
      logger.info(`Usuario ID: ${req.params.id} eliminado por el usuario ID: ${req.user.id} desde la IP: ${req.ip}`);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al eliminar usuario:', error);
      next(error);
    }
  }

  // Obtener estadísticas de usuarios
  async getUserStatistics(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const statistics = await userService.getUserStatistics({ start_date, end_date });
      logger.info('Estadísticas de usuarios recuperadas');
      return res.status(200).json(statistics);
    } catch (error) {
      logger.error('Error al obtener estadísticas de usuarios:', error);
      next(error);
    }
  }

  // Método para invalidar caché
  async invalidateCache(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info(`Caché invalidada para el patrón: ${pattern}`);
    }
  }
}

module.exports = new UserController();