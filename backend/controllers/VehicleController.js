const { Vehicle } = require('../models');
const { Op } = require('sequelize');

class VehicleController {
  // Crear un nuevo vehículo
  async create(req, res) {
    try {
      // Validación básica
      if (!req.body.vin || !req.body.make || !req.body.model || !req.body.year) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }
      if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(req.body.vin)) {
        return res.status(400).json({ error: 'VIN inválido' });
      }

      const vehicle = await Vehicle.create(req.body);
      return res.status(201).json(vehicle);
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Obtener todos los vehículos con paginación, ordenamiento y filtrado
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'ASC', status, make, model } = req.query;
      const offset = (page - 1) * limit;
      
      let where = {};
      if (status) where.status = status;
      if (make) where.make = { [Op.iLike]: `%${make}%` };
      if (model) where.model = { [Op.iLike]: `%${model}%` };

      const vehicles = await Vehicle.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]]
      });

      return res.status(200).json({
        vehicles: vehicles.rows,
        totalPages: Math.ceil(vehicles.count / limit),
        currentPage: parseInt(page),
        totalCount: vehicles.count
      });
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Obtener un vehículo por ID
  async getById(req, res) {
    try {
      const vehicle = await Vehicle.findByPk(req.params.id);
      if (vehicle) {
        return res.status(200).json(vehicle);
      }
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    } catch (error) {
      console.error('Error al obtener vehículo por ID:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Actualizar un vehículo
  async update(req, res) {
    try {
      const vehicle = await Vehicle.findByPk(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      // Validación básica
      if (req.body.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(req.body.vin)) {
        return res.status(400).json({ error: 'VIN inválido' });
      }

      const updatedVehicle = await vehicle.update(req.body, {
        fields: ['vin', 'make', 'model', 'year', 'status', 'next_maintenance_date'] // Lista blanca de campos actualizables
      });

      return res.status(200).json(updatedVehicle);
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Eliminar un vehículo
  async delete(req, res) {
    try {
      const deleted = await Vehicle.destroy({
        where: { id: req.params.id }
      });
      if (deleted) {
        return res.status(204).send();
      }
      return res.status(404).json({ error: "Vehículo no encontrado" });
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Obtener vehículos activos
  async getActiveVehicles(req, res) {
    try {
      const activeVehicles = await Vehicle.findAll({
        where: { status: 'active' }
      });
      return res.status(200).json(activeVehicles);
    } catch (error) {
      console.error('Error al obtener vehículos activos:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Programar mantenimiento para un vehículo
  async scheduleMaintenance(req, res) {
    try {
      const vehicle = await Vehicle.findByPk(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }

      if (!req.body.next_maintenance_date) {
        return res.status(400).json({ error: 'Se requiere la fecha del próximo mantenimiento' });
      }

      vehicle.next_maintenance_date = new Date(req.body.next_maintenance_date);
      await vehicle.save();
      return res.status(200).json(vehicle);
    } catch (error) {
      console.error('Error al programar mantenimiento:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // Obtener vehículos que necesitan mantenimiento pronto
  async getVehiclesNeedingMaintenance(req, res) {
    try {
      const date = new Date();
      date.setDate(date.getDate() + 7); // Próximos 7 días

      const vehiclesNeedingMaintenance = await Vehicle.findAll({
        where: {
          next_maintenance_date: {
            [Op.lte]: date
          },
          status: 'active'
        }
      });

      return res.status(200).json(vehiclesNeedingMaintenance);
    } catch (error) {
      console.error('Error al obtener vehículos que necesitan mantenimiento:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new VehicleController();