const { Route, Assignment } = require('../models');
const { Op } = require('sequelize');

class RouteController {
  // Crear una nueva ruta
  async create(req, res) {
    try {
      const { origin, destination, distance_km, estimated_time, intermediate_stops = [] } = req.body;

      if (!origin || !destination || !distance_km || !estimated_time) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      if (!Array.isArray(intermediate_stops)) {
        return res.status(400).json({ error: 'Intermediate stops debe ser un array' });
      }

      const route = await Route.create({ 
        origin, 
        destination, 
        distance_km, 
        estimated_time, 
        intermediate_stops, 
        status: 'active' 
      });
      return res.status(201).json(route);
    } catch (error) {
      console.error('Error al crear ruta:', error);
      return res.status(500).json({ error: 'Error al crear ruta' });
    }
  }

  // Obtener todas las rutas con paginación y filtrado
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, status, origin, destination } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (origin) where.origin = { [Op.iLike]: `%${origin}%` };
      if (destination) where.destination = { [Op.iLike]: `%${destination}%` };

      const routes = await Route.findAndCountAll({
        where,
        limit: +limit,
        offset: +offset,
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        routes: routes.rows,
        totalPages: Math.ceil(routes.count / limit),
        currentPage: +page,
        totalCount: routes.count
      });
    } catch (error) {
      console.error('Error al obtener rutas:', error);
      return res.status(500).json({ error: 'Error al obtener rutas' });
    }
  }

  // Obtener una ruta por ID
  async getById(req, res) {
    try {
      const route = await Route.findByPk(req.params.id);
      if (!route) return res.status(404).json({ error: 'Ruta no encontrada' });
      return res.status(200).json(route);
    } catch (error) {
      console.error('Error al obtener ruta por ID:', error);
      return res.status(500).json({ error: 'Error al obtener ruta por ID' });
    }
  }

  // Actualizar una ruta
  async update(req, res) {
    try {
      const route = await Route.findByPk(req.params.id);
      if (!route) return res.status(404).json({ error: 'Ruta no encontrada' });

      const { intermediate_stops } = req.body;
      if (intermediate_stops && !Array.isArray(intermediate_stops)) {
        return res.status(400).json({ error: 'Intermediate stops debe ser un array' });
      }

      const updatedRoute = await route.update(req.body);
      return res.status(200).json(updatedRoute);
    } catch (error) {
      console.error('Error al actualizar ruta:', error);
      return res.status(500).json({ error: 'Error al actualizar ruta' });
    }
  }

  // Eliminar una ruta
  async delete(req, res) {
    try {
      const route = await Route.findByPk(req.params.id);
      if (!route) return res.status(404).json({ error: 'Ruta no encontrada' });

      const assignmentsUsingRoute = await Assignment.count({ where: { routeId: req.params.id } });
      if (assignmentsUsingRoute > 0) {
        return res.status(400).json({ error: 'No se puede eliminar la ruta porque está siendo utilizada en asignaciones' });
      }

      await route.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar ruta:', error);
      return res.status(500).json({ error: 'Error al eliminar ruta' });
    }
  }
}

module.exports = new RouteController();
