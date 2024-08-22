module.exports = (sequelize, DataTypes) => {
    const Fuel = sequelize.define('Fuel', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      quantity: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      odometer_reading: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  
    Fuel.associate = function(models) {
      Fuel.belongsTo(models.Vehicle, {
        foreignKey: 'vehicle_id',
        as: 'vehicle'
      });
    };
  
    return Fuel;
  };