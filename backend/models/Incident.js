module.exports = (sequelize, DataTypes) => {
    const Incident = sequelize.define('Incident', {
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
        type: DataTypes.ENUM('accident', 'breakdown', 'theft', 'other'),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true
      },
      severity: {
        type: DataTypes.ENUM('minor', 'major', 'critical'),
        allowNull: false,
        defaultValue: 'minor'
      },
      status: {
        type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
        defaultValue: 'open'
      },
      resolution: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      estimated_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      }
    }, {
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  
    Incident.associate = function(models) {
      Incident.belongsTo(models.Vehicle, {
        foreignKey: 'vehicle_id',
        as: 'vehicle'
      });
      Incident.belongsTo(models.Driver, {
        foreignKey: 'driver_id',
        as: 'driver'
      });
    };
  
    return Incident;
  };