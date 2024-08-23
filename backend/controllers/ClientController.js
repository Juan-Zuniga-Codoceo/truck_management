const { Client } = require('../models');
const { ValidationError, NotFoundError } = require('../errors');
const clientService = require('../services/clientService');
const logger = require('../utils/logger');
const { validateClient } = require('../validators/clientValidator');
const Redis = require('ioredis');

const redis = new Redis();

class ClientController {
  // Crear un nuevo cliente
  async create(req, res, next) {
    try {
      await validateClient(req.body);
      const client = await clientService.createClient(req.body);
      logger.info(`Cliente creado con ID: ${client.id}`);
      await this.invalidateCache('clients'); // Invalida caché después de crear un cliente
      return res.status(201).json(client);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al crear cliente:', error);
      next(error);
    }
  }

  // Obtener todos los clientes con paginación y filtrado
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, name, email } = req.query;
      const filters = { name, email };
      const paginationOptions = { page: Number(page), limit: Number(limit) };

      const cacheKey = `clients:${JSON.stringify({ filters, paginationOptions })}`;
      const cachedResult = await redis.get(cacheKey);

      if (cachedResult) {
        logger.info('Devolviendo clientes desde caché');
        return res.status(200).json(JSON.parse(cachedResult));
      }

      const result = await clientService.getAllClients(filters, paginationOptions);
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300); // Cache for 5 minutes
      logger.info(`Recuperados ${result.count} clientes`);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al obtener clientes:', error);
      next(error);
    }
  }

  // Obtener un cliente por ID
  async getById(req, res, next) {
    try {
      const client = await clientService.getClientById(req.params.id);
      return res.status(200).json(client);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener cliente por ID:', error);
      next(error);
    }
  }

  // Actualizar un cliente
  async update(req, res, next) {
    try {
      await validateClient(req.body, true);
      const updatedClient = await clientService.updateClient(req.params.id, req.body);
      await this.invalidateCache('clients'); // Invalida caché después de actualizar un cliente
      await this.invalidateCache(`client:${req.params.id}`); // Invalida caché del cliente específico
      return res.status(200).json(updatedClient);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al actualizar cliente:', error);
      next(error);
    }
  }

  // Eliminar un cliente
  async delete(req, res, next) {
    try {
      await clientService.deleteClient(req.params.id);
      await this.invalidateCache('clients'); // Invalida caché después de eliminar un cliente
      await this.invalidateCache(`client:${req.params.id}`); // Invalida caché del cliente específico
      return res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al eliminar cliente:', error);
      next(error);
    }
  }

  // Obtener estadísticas de clientes
  async getClientStatistics(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const statistics = await clientService.getClientStatistics({ start_date, end_date });
      return res.status(200).json(statistics);
    } catch (error) {
      logger.error('Error al obtener estadísticas de clientes:', error);
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

module.exports = new ClientController();