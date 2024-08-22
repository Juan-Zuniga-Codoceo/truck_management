const { Route } = require('../models');
const { ValidationError } = require('sequelize');

// Obtener todas las rutas
exports.getAllRoutes = async (req, res) => {
  try {
    const { status, sort } = req.query;
    let options = {};

    // Filtrar por estado si se proporciona
    if (status) {
      options.where = { status };
    }

    // Ordenar por el campo especificado en `sort`
    if (sort && typeof sort === 'string') {
      options.order = [sort.split(',')];
    }

    // Obtener todas las rutas con las opciones aplicadas
    const routes = await Route.findAll(options);
    res.status(200).json(routes);
  } catch (error) {
    console.error('Error in getAllRoutes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Obtener una ruta por ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (route) {
      res.status(200).json(route);
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    console.error('Error in getRouteById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Crear una nueva ruta
exports.createRoute = async (req, res) => {
  try {
    // Validar entrada
    const { name, status, origin, destination } = req.body;
    if (!name || !status || !origin || !destination) {
      return res.status(400).json({ error: 'Name, status, origin, and destination are required' });
    }

    // Crear la nueva ruta
    const newRoute = await Route.create(req.body);
    res.status(201).json(newRoute);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.errors.map(e => e.message) });
    } else {
      console.error('Error in createRoute:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Actualizar una ruta
exports.updateRoute = async (req, res) => {
  try {
    // Validar entrada
    const { name, status, origin, destination } = req.body;
    if (!name || !status || !origin || !destination) {
      return res.status(400).json({ error: 'Name, status, origin, and destination are required' });
    }

    // Actualizar la ruta
    const [updated] = await Route.update(req.body, {
      where: { id: req.params.id }
    });

    // Si la ruta se actualizó, devolver la ruta actualizada
    if (updated) {
      res.status(200).json({ ...req.body, id: req.params.id });
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.errors.map(e => e.message) });
    } else {
      console.error('Error in updateRoute:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Eliminar una ruta
exports.deleteRoute = async (req, res) => {
  try {
    const deleted = await Route.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    console.error('Error in deleteRoute:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
