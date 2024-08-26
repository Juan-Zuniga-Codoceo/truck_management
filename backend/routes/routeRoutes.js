const express = require('express');
const routeController = require('../controllers/RouteController');
const router = express.Router();

// Definir las rutas y conectarlas con los métodos del controlador
router.get('/', routeController.getAll.bind(routeController)); // Obtener todas las rutas
router.get('/:id', routeController.getById.bind(routeController)); // Obtener una ruta por ID
router.post('/', routeController.create.bind(routeController)); // Crear una nueva ruta
router.put('/:id', routeController.update.bind(routeController)); // Actualizar una ruta existente
router.delete('/:id', routeController.delete.bind(routeController)); // Eliminar una ruta

module.exports = router;
