const { ValidationError, NotFoundError } = require('../errors');
const fuelService = require('../services/fuelService');
const logger = require('../utils/logger');
const config = require('../config');
const { validateFuel } = require('../validators/fuelValidator');

class FuelController {
  // Crear un nuevo registro de combustible
  async create(req, res, next) {
    try {
      await validateFuel(req.body);
      const fuel = await fuelService.createFuel(req.body);
      logger.info(`Registro de combustible creado con ID: ${fuel.id}`);
      return res.status(201).json(fuel);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al crear registro de combustible:', error);
      next(error);
    }
  }

  // Obtener todos los registros de combustible con paginación y filtrado
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = config.pagination.defaultLimit, vehicle_id, start_date, end_date } = req.query;
      
      const filters = { vehicle_id, start_date, end_date };
      const paginationOptions = { page: Number(page), limit: Number(limit) };

      const result = await fuelService.getAllFuels(filters, paginationOptions);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al obtener registros de combustible:', error);
      next(error);
    }
  }

  // Obtener un registro de combustible por ID
  async getById(req, res, next) {
    try {
      const fuel = await fuelService.getFuelById(req.params.id);
      return res.status(200).json(fuel);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener registro de combustible por ID:', error);
      next(error);
    }
  }

  // Actualizar un registro de combustible
  async update(req, res, next) {
    try {
      await validateFuel(req.body, true);
      const updatedFuel = await fuelService.updateFuel(req.params.id, req.body);
      return res.status(200).json(updatedFuel);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al actualizar registro de combustible:', error);
      next(error);
    }
  }

  // Eliminar un registro de combustible
  async delete(req, res, next) {
    try {
      await fuelService.deleteFuel(req.params.id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al eliminar registro de combustible:', error);
      next(error);
    }
  }

  // Obtener historial de combustible de un vehículo
  async getVehicleFuelHistory(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const fuels = await fuelService.getVehicleFuelHistory(req.params.vehicle_id, { start_date, end_date });
      return res.status(200).json(fuels);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener historial de combustible:', error);
      next(error);
    }
  }

  // Obtener estadísticas de consumo de combustible
  async getFuelStatistics(req, res, next) {
    try {
      const { vehicle_id, start_date, end_date } = req.query;
      const statistics = await fuelService.getFuelStatistics(vehicle_id, { start_date, end_date });
      return res.status(200).json(statistics);
    } catch (error) {
      logger.error('Error al obtener estadísticas de combustible:', error);
      next(error);
    }
  }
}

module.exports = new FuelController();