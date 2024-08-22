module.exports = (sequelize, DataTypes) => {
    const Maintenance = sequelize.define('Maintenance', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('preventive', 'corrective'),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed'),
        defaultValue: 'scheduled'
      }
    }, {
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  
    Maintenance.associate = function(models) {
      Maintenance.belongsTo(models.Vehicle, {
        foreignKey: 'vehicle_id',
        as: 'vehicle'
      });
    };
  
    return Maintenance;
  };