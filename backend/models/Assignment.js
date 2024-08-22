module.exports = (sequelize, DataTypes) => {
    const Assignment = sequelize.define('Assignment', {
      vehicle_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Vehicles',
          key: 'id'
        }
      },
      driver_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Drivers',
          key: 'id'
        }
      },
      route_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Routes',
          key: 'id'
        }
      }
    }, {
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  
    Assignment.associate = function(models) {
      Assignment.belongsTo(models.Vehicle, { foreignKey: 'vehicle_id' });
      Assignment.belongsTo(models.Driver, { foreignKey: 'driver_id' });
      Assignment.belongsTo(models.Route, { foreignKey: 'route_id' });
    };
  
    return Assignment;
  };
  