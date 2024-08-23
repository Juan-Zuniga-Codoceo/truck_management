const { GPSTracking } = require('../models');
const { ValidationError, NotFoundError } = require('../errors');
const gpsTrackingService = require('../services/gpsTrackingService');
const logger = require('../utils/logger');
const config = require('../config');
const { validateGPSTracking } = require('../validators/gpsTrackingValidator');

class GPSTrackingController {
  // Crear un nuevo registro de rastreo GPS
  async create(req, res, next) {
    try {
      await validateGPSTracking(req.body);
      const gpsTracking = await gpsTrackingService.createGPSTracking(req.body);
      logger.info(`Registro de GPS creado con ID: ${gpsTracking.id}`);
      return res.status(201).json(gpsTracking);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al crear registro de GPS:', error);
      next(error);
    }
  }

  // Obtener todos los registros de rastreo GPS con paginación y filtrado
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = config.pagination.defaultLimit, vehicle_id, start_date, end_date } = req.query;
      
      const filters = { vehicle_id, start_date, end_date };
      const paginationOptions = { page: Number(page), limit: Number(limit) };

      const result = await gpsTrackingService.getAllGPSTrackings(filters, paginationOptions);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al obtener registros de GPS:', error);
      next(error);
    }
  }

  // Obtener un registro de rastreo GPS por ID
  async getById(req, res, next) {
    try {
      const gpsTracking = await gpsTrackingService.getGPSTrackingById(req.params.id);
      return res.status(200).json(gpsTracking);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener registro de GPS por ID:', error);
      next(error);
    }
  }

  // Actualizar un registro de rastreo GPS
  async update(req, res, next) {
    try {
      await validateGPSTracking(req.body, true);
      const updatedGPSTracking = await gpsTrackingService.updateGPSTracking(req.params.id, req.body);
      return res.status(200).json(updatedGPSTracking);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al actualizar registro de GPS:', error);
      next(error);
    }
  }

  // Eliminar un registro de rastreo GPS
  async delete(req, res, next) {
    try {
      await gpsTrackingService.deleteGPSTracking(req.params.id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al eliminar registro de GPS:', error);
      next(error);
    }
  }

  // Obtener historial de rastreo GPS para un vehículo
  async getVehicleGPSTrackingHistory(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const gpsTrackings = await gpsTrackingService.getVehicleGPSTrackingHistory(req.params.vehicle_id, { start_date, end_date });
      return res.status(200).json(gpsTrackings);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener historial de GPS del vehículo:', error);
      next(error);
    }
  }

  // Obtener estadísticas de rastreo GPS
  async getGPSTrackingStatistics(req, res, next) {
    try {
      const { vehicle_id, start_date, end_date } = req.query;
      const statistics = await gpsTrackingService.getGPSTrackingStatistics(vehicle_id, { start_date, end_date });
      return res.status(200).json(statistics);
    } catch (error) {
      logger.error('Error al obtener estadísticas de GPS:', error);
      next(error);
    }
  }
}

module.exports = new GPSTrackingController();