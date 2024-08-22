const { Assignment, Driver, Vehicle, Route } = require('../models');
const { Op } = require('sequelize');

class AssignmentController {
  // Crear una nueva asignación
  async create(req, res) {
    try {
      const { driver_id, vehicle_id, route_id, start_date, end_date } = req.body;

      // Validación básica
      if (!driver_id || !vehicle_id || !route_id || !start_date) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      // Verificar si el conductor, vehículo y ruta existen
      const [driver, vehicle, route] = await Promise.all([
        Driver.findByPk(driver_id),
        Vehicle.findByPk(vehicle_id),
        Route.findByPk(route_id)
      ]);

      if (!driver || !vehicle || !route) {
        return res.status(404).json({ error: 'Conductor, vehículo o ruta no encontrados' });
      }

      // Verificar conflictos de horarios
      const conflictingAssignments = await Assignment.findOne({
        where: {
          [Op.or]: [
            { driver_id },
            { vehicle_id }
          ],
          [Op.and]: [
            { start_date: { [Op.lte]: new Date(end_date) } },
            { end_date: { [Op.gte]: new Date(start_date) } }
          ]
        }
      });

      if (conflictingAssignments) {
        return res.status(400).json({ error: 'Conflicto de horario con otra asignación existente' });
      }

      const assignment = await Assignment.create({
        driver_id,
        vehicle_id,
        route_id,
        start_date,
        end_date,
        status: 'pending'
      });

      return res.status(201).json(assignment);
    } catch (error) {
      console.error('Error al crear asignación:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Obtener todas las asignaciones con paginación y filtrado
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, status, start_date } = req.query;
      const offset = (page - 1) * limit;

      let where = {};
      if (status) where.status = status;
      if (start_date) where.start_date = { [Op.gte]: new Date(start_date) };

      const assignments = await Assignment.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          { model: Driver, as: 'driver' },
          { model: Vehicle, as: 'vehicle' },
          { model: Route, as: 'route' }
        ],
        order: [['start_date', 'DESC']]
      });

      return res.status(200).json({
        assignments: assignments.rows,
        totalPages: Math.ceil(assignments.count / limit),
        currentPage: parseInt(page),
        totalCount: assignments.count
      });
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Obtener una asignación por ID
  async getById(req, res) {
    try {
      const assignment = await Assignment.findByPk(req.params.id, {
        include: [
          { model: Driver, as: 'driver' },
          { model: Vehicle, as: 'vehicle' },
          { model: Route, as: 'route' }
        ]
      });
      if (assignment) {
        return res.status(200).json(assignment);
      }
      return res.status(404).json({ error: 'Asignación no encontrada' });
    } catch (error) {
      console.error('Error al obtener asignación por ID:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Actualizar una asignación
  async update(req, res) {
    try {
      const assignment = await Assignment.findByPk(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      const updatedAssignment = await assignment.update(req.body, {
        fields: ['driver_id', 'vehicle_id', 'route_id', 'start_date', 'end_date', 'status']
      });

      return res.status(200).json(updatedAssignment);
    } catch (error) {
      console.error('Error al actualizar asignación:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Eliminar una asignación
  async delete(req, res) {
    try {
      const deleted = await Assignment.destroy({
        where: { id: req.params.id }
      });
      if (deleted) {
        return res.status(204).send();
      }
      return res.status(404).json({ error: "Asignación no encontrada" });
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Obtener asignaciones actuales
  async getCurrentAssignments(req, res) {
    try {
      const currentDate = new Date();
      const currentAssignments = await Assignment.findAll({
        where: {
          start_date: { [Op.lte]: currentDate },
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: currentDate } }
          ],
          status: 'in_progress'
        },
        include: [
          { model: Driver, as: 'driver' },
          { model: Vehicle, as: 'vehicle' },
          { model: Route, as: 'route' }
        ]
      });
      return res.status(200).json(currentAssignments);
    } catch (error) {
      console.error('Error al obtener asignaciones actuales:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Completar una asignación
  async completeAssignment(req, res) {
    try {
      const assignment = await Assignment.findByPk(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: 'Asignación no encontrada' });
      }

      if (assignment.status === 'completed') {
        return res.status(400).json({ error: 'La asignación ya está completada' });
      }

      assignment.status = 'completed';
      assignment.end_date = new Date();
      await assignment.save();

      return res.status(200).json(assignment);
    } catch (error) {
      console.error('Error al completar asignación:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AssignmentController();
