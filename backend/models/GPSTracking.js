module.exports = (sequelize, DataTypes) => {
    const GPSTracking = sequelize.define('GPSTracking', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false
      },
      speed: {
        type: DataTypes.FLOAT,
        allowNull: true
      }
    }, {
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  
    GPSTracking.associate = function(models) {
      GPSTracking.belongsTo(models.Vehicle, {
        foreignKey: 'vehicle_id',
        as: 'vehicle'
      });
    };
  
    return GPSTracking;
  };