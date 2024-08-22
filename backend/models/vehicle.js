module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
    vin: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    license_plate: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    make: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1900,
        max: new Date().getFullYear() + 1
      }
    },
    capacity: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'maintenance', 'inactive']]
      }
    },
    next_maintenance_date: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      }
    },
    insurance_expiry_date: {
      type: DataTypes.DATE,
      validate: {
        isDate: true,
        isAfter: new Date().toISOString() // Asegura que la fecha de expiración sea en el futuro
      }
    },
    created_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['make', 'model']
      },
      {
        fields: ['vin']
      },
      {
        fields: ['license_plate']
      }
    ],
    hooks: {
      beforeUpdate: (vehicle) => {
        vehicle.updated_at = new Date();
      }
    }
  });

  // Asociaciones
  Vehicle.associate = function(models) {
    Vehicle.hasMany(models.Assignment, {
      foreignKey: 'vehicleId',
      as: 'assignments'
    });
    Vehicle.hasMany(models.Maintenance, {
      foreignKey: 'vehicleId',
      as: 'maintenances'
    });
    Vehicle.hasMany(models.Fuel, {
      foreignKey: 'vehicleId',
      as: 'fuels'
    });
    Vehicle.hasMany(models.GPSTracking, {
      foreignKey: 'vehicleId',
      as: 'gpsTrackings'
    });
    Vehicle.hasMany(models.Incident, {
      foreignKey: 'vehicleId',
      as: 'incidents'
    });
  };

  // Método de instancia para verificar si se necesita mantenimiento
  Vehicle.prototype.needsMaintenance = function() {
    return this.next_maintenance_date && new Date() >= this.next_maintenance_date;
  };

  // Método de clase para encontrar vehículos activos
  Vehicle.findActiveVehicles = function() {
    return this.findAll({
      where: {
        status: 'active'
      }
    });
  };

  // Nuevo método de clase para encontrar vehículos que necesitan mantenimiento pronto
  Vehicle.findVehiclesNeedingMaintenance = function(daysThreshold = 7) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    
    return this.findAll({
      where: {
        next_maintenance_date: {
          [sequelize.Op.lte]: thresholdDate
        },
        status: 'active'
      }
    });
  };

  return Vehicle;
};