const { Maintenance, Vehicle } = require('../models');
const { ValidationError, NotFoundError } = require('../errors');
const maintenanceService = require('../services/maintenanceService');
const logger = require('../utils/logger');
const config = require('../config');
const { validateMaintenance } = require('../validators/maintenanceValidator');

class MaintenanceController {
  // Crear un nuevo registro de mantenimiento
  async create(req, res, next) {
    try {
      const { vehicle_id, date, type, description, cost } = req.body;

      await validateMaintenance(req.body);

      const maintenance = await maintenanceService.createMaintenance({
        vehicle_id,
        date,
        type,
        description,
        cost
      });

      logger.info(`Mantenimiento creado con ID: ${maintenance.id}`);
      return res.status(201).json(maintenance);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al crear mantenimiento:', error);
      next(error);
    }
  }

  // Obtener todos los registros de mantenimiento con paginación y filtrado
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = config.pagination.defaultLimit, status, vehicle_id } = req.query;
      
      const filters = { status, vehicle_id };
      const paginationOptions = { page: Number(page), limit: Number(limit) };

      const result = await maintenanceService.getAllMaintenances(filters, paginationOptions);

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al obtener mantenimientos:', error);
      next(error);
    }
  }

  // Obtener un registro de mantenimiento por ID
  async getById(req, res, next) {
    try {
      const maintenance = await maintenanceService.getMaintenanceById(req.params.id);
      return res.status(200).json(maintenance);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener mantenimiento por ID:', error);
      next(error);
    }
  }

  // Actualizar un registro de mantenimiento
  async update(req, res, next) {
    try {
      await validateMaintenance(req.body, true);
      const updatedMaintenance = await maintenanceService.updateMaintenance(req.params.id, req.body);
      return res.status(200).json(updatedMaintenance);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al actualizar mantenimiento:', error);
      next(error);
    }
  }

  // Eliminar un registro de mantenimiento
  async delete(req, res, next) {
    try {
      await maintenanceService.deleteMaintenance(req.params.id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al eliminar mantenimiento:', error);
      next(error);
    }
  }

  // Obtener historial de mantenimiento de un vehículo
  async getVehicleMaintenanceHistory(req, res, next) {
    try {
      const maintenances = await maintenanceService.getVehicleMaintenanceHistory(req.params.vehicle_id);
      return res.status(200).json(maintenances);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener historial de mantenimiento:', error);
      next(error);
    }
  }
}

module.exports = new MaintenanceController();