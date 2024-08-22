const { Driver } = require('../models');

class DriverController {
  // Crear un nuevo conductor
  async create(req, res) {
    try {
      const driver = await Driver.create(req.body);
      return res.status(201).json(driver);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Obtener todos los conductores
  async getAll(req, res) {
    try {
      const drivers = await Driver.findAll();
      return res.status(200).json(drivers);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Obtener un conductor por ID
  async getById(req, res) {
    try {
      const driver = await Driver.findByPk(req.params.id);
      if (driver) {
        return res.status(200).json(driver);
      }
      return res.status(404).send('Conductor no encontrado');
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Actualizar un conductor
  async update(req, res) {
    try {
      const [updated] = await Driver.update(req.body, {
        where: { id: req.params.id }
      });
      if (updated) {
        const updatedDriver = await Driver.findByPk(req.params.id);
        return res.status(200).json(updatedDriver);
      }
      return res.status(404).send('Conductor no encontrado');
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Eliminar un conductor
  async delete(req, res) {
    try {
      const deleted = await Driver.destroy({
        where: { id: req.params.id }
      });
      if (deleted) {
        return res.status(204).send("Conductor eliminado");
      }
      return res.status(404).send("Conductor no encontrado");
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Métodos adicionales específicos para Driver

  // Obtener conductores activos
  async getActiveDrivers(req, res) {
    try {
      const activeDrivers = await Driver.findAll({
        where: { status: 'active' }
      });
      return res.status(200).json(activeDrivers);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // Verificar la validez de la licencia de un conductor
  async checkLicenseValidity(req, res) {
    try {
      const driver = await Driver.findByPk(req.params.id);
      if (driver) {
        const isValid = driver.isLicenseValid();
        return res.status(200).json({ isValid });
      }
      return res.status(404).send('Conductor no encontrado');
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DriverController();