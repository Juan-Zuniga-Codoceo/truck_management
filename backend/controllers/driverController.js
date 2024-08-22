const { Driver } = require('../models');
const { ValidationError } = require('sequelize');

exports.getAllDrivers = async (req, res) => {
  try {
    const { status, sort } = req.query;
    let options = {};
    
    if (status) {
      options.where = { status };
    }
    
    if (sort) {
      options.order = [sort.split(',')];
    }
    
    const drivers = await Driver.findAll(options);
    res.status(200).json(drivers);
  } catch (error) {
    console.error('Error in getAllDrivers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (driver) {
      res.status(200).json(driver);
    } else {
      res.status(404).json({ error: 'Driver not found' });
    }
  } catch (error) {
    console.error('Error in getDriverById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const newDriver = await Driver.create(req.body);
    res.status(201).json(newDriver);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.errors.map(e => e.message) });
    } else {
      console.error('Error in createDriver:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const [updated] = await Driver.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedDriver = await Driver.findByPk(req.params.id);
      res.status(200).json(updatedDriver);
    } else {
      res.status(404).json({ error: 'Driver not found' });
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.errors.map(e => e.message) });
    } else {
      console.error('Error in updateDriver:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const deleted = await Driver.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Driver not found' });
    }
  } catch (error) {
    console.error('Error in deleteDriver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};