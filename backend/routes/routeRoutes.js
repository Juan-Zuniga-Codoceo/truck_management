const express = require('express');
const routeController = require('../controllers/routeController');
const router = express.Router();

// Definir las rutas y conectarlas con los métodos del controlador
router.get('/', routeController.getAllRoutes); // Obtener todas las rutas
router.get('/:id', routeController.getRouteById); // Obtener una ruta por ID
router.post('/', routeController.createRoute); // Crear una nueva ruta
router.put('/:id', routeController.updateRoute); // Actualizar una ruta existente
router.delete('/:id', routeController.deleteRoute); // Eliminar una ruta

module.exports = router;
