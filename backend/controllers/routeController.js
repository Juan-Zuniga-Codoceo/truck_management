const { Route } = require('../models');

// Obtener todas las rutas
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll();
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una nueva ruta
exports.createRoute = async (req, res) => {
  try {
    const newRoute = await Route.create(req.body);
    res.status(201).json(newRoute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una ruta
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Route.update(req.body, {
      where: { id: id }
    });
    if (updated) {
      const updatedRoute = await Route.findOne({ where: { id: id } });
      res.status(200).json(updatedRoute);
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una ruta
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Route.destroy({
      where: { id: id }
    });
    if (deleted) {
      res.status(204).json({ message: 'Route deleted' });
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
