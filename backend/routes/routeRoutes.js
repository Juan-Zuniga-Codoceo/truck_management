const express = require('express');
const {
  getAllRoutes,
  createRoute,
  updateRoute,
  deleteRoute
} = require('../controllers/routeController');

const router = express.Router();

router.get('/', getAllRoutes);
router.post('/', createRoute);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);

module.exports = router;
