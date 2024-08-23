const { ValidationError, NotFoundError } = require('../errors');
const incidentService = require('../services/incidentService');
const logger = require('../utils/logger');
const config = require('../config');
const { validateIncident } = require('../validators/incidentValidator');

class IncidentController {
  // Crear un nuevo incidente
  async create(req, res, next) {
    try {
      await validateIncident(req.body);
      const incident = await incidentService.createIncident(req.body);
      logger.info(`Incidente creado con ID: ${incident.id}`);
      return res.status(201).json(incident);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al crear incidente:', error);
      next(error);
    }
  }

  // Obtener todos los incidentes con paginación y filtrado
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = config.pagination.defaultLimit, type, severity, status, vehicle_id, driver_id, start_date, end_date } = req.query;
      const filters = { type, severity, status, vehicle_id, driver_id, start_date, end_date };
      const paginationOptions = { page: Number(page), limit: Number(limit) };

      const result = await incidentService.getAllIncidents(filters, paginationOptions);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al obtener incidentes:', error);
      next(error);
    }
  }

  // Obtener un incidente por ID
  async getById(req, res, next) {
    try {
      const incident = await incidentService.getIncidentById(req.params.id);
      return res.status(200).json(incident);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener incidente por ID:', error);
      next(error);
    }
  }

  // Actualizar un incidente
  async update(req, res, next) {
    try {
      await validateIncident(req.body, true);
      const updatedIncident = await incidentService.updateIncident(req.params.id, req.body);
      return res.status(200).json(updatedIncident);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al actualizar incidente:', error);
      next(error);
    }
  }

  // Eliminar un incidente
  async delete(req, res, next) {
    try {
      await incidentService.deleteIncident(req.params.id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al eliminar incidente:', error);
      next(error);
    }
  }

  // Obtener incidentes de un vehículo específico
  async getVehicleIncidents(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const incidents = await incidentService.getVehicleIncidents(req.params.vehicle_id, { start_date, end_date });
      return res.status(200).json(incidents);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener incidentes del vehículo:', error);
      next(error);
    }
  }

  // Obtener incidentes de un conductor específico
  async getDriverIncidents(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const incidents = await incidentService.getDriverIncidents(req.params.driver_id, { start_date, end_date });
      return res.status(200).json(incidents);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener incidentes del conductor:', error);
      next(error);
    }
  }

  // Obtener estadísticas de incidentes
  async getIncidentStatistics(req, res, next) {
    try {
      const { start_date, end_date, vehicle_id, driver_id } = req.query;
      const statistics = await incidentService.getIncidentStatistics({ start_date, end_date, vehicle_id, driver_id });
      return res.status(200).json(statistics);
    } catch (error) {
      logger.error('Error al obtener estadísticas de incidentes:', error);
      next(error);
    }
  }
}

module.exports = new IncidentController();