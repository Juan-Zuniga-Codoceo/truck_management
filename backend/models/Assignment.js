module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: sequelize.models.Vehicle,  // Referencia directa al modelo
        key: 'id'
      }
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: sequelize.models.Driver,  // Referencia directa al modelo
        key: 'id'
      }
    },
    route_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: sequelize.models.Route,  // Referencia directa al modelo
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
