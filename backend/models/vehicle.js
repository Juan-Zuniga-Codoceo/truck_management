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
        type: DataTypes.DECIMAL(5, 2),
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
        type: DataTypes.DATE
      },
      insurance_expiry_date: {
        type: DataTypes.DATE
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
        }
      ],
      hooks: {
        beforeUpdate: (vehicle) => {
          vehicle.updated_at = new Date();
        }
      }
    });
  
    Vehicle.associate = function(models) {
      Vehicle.hasMany(models.Assignment);
      Vehicle.hasMany(models.Maintenance);
      Vehicle.hasMany(models.Fuel);
      Vehicle.hasMany(models.GPSTracking);
      Vehicle.hasMany(models.Incident);
    };
  
    // Instance method
    Vehicle.prototype.needsMaintenance = function() {
      return this.next_maintenance_date <= new Date();
    };
  
    // Class method
    Vehicle.findActiveVehicles = function() {
      return this.findAll({
        where: {
          status: 'active'
        }
      });
    };
  
    return Vehicle;
  };
  