const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
try {
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }
  console.log('Sequelize connection established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
  process.exit(1);
}

// Primero, cargamos todos los modelos
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    try {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
      console.log(`Loaded model: ${model.name}`);
    } catch (error) {
      console.error(`Error loading model from file ${file}:`, error);
    }
  });

// Luego, establecemos las asociaciones
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    try {
      console.log(`Associating model: ${modelName}`);
      db[modelName].associate(db);
    } catch (error) {
      console.error(`Error associating model ${modelName}:`, error);
    }
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;