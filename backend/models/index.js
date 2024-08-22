'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Leer todos los archivos en la carpeta de modelos
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
    console.log(`Loaded model: ${model.name}`);
  });

// Configurar asociaciones para cada modelo
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
    console.log(`Associated model: ${modelName}`);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Exportar todos los modelos
module.exports = {
  sequelize,
  Sequelize,
  Driver: db.Driver,
  Vehicle: db.Vehicle,
  Assignment: db.Assignment,
  Route: db.Route,
  Maintenance: db.Maintenance,
  Fuel: db.Fuel,
  Incident: db.Incident,
  GPSTracking: db.GPSTracking,
  Invoice: db.Invoice,
  Client: db.Client,
  User: db.User
};