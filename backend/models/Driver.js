module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define('Driver', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    license_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    license_type: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [['A', 'B', 'C', 'D', 'E']] // Ajusta según los tipos de licencia en tu país
      }
    },
    license_expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfter: new Date().toISOString() // La fecha de expiración debe ser en el futuro
      }
    },
    medical_exam_date: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      }
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0
      }
    },
    phone: {
      type: DataTypes.STRING(15),
      validate: {
        is: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im
      }
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: {
        isEmail: true
      }
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive', 'suspended']]
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
        fields: ['license_number']
      }
    ],
    hooks: {
      beforeUpdate: (driver) => {
        driver.updated_at = new Date();
      }
    }
  });

  Driver.associate = function(models) {
    Driver.hasMany(models.Assignment, {
      foreignKey: 'driverId',
      as: 'assignments'
    });
    Driver.hasMany(models.Incident, {
      foreignKey: 'driverId',
      as: 'incidents'
    });
  };

  // Instance method
  Driver.prototype.isLicenseValid = function() {
    return new Date() < this.license_expiry_date;
  };

  // Class method
  Driver.findActiveDrivers = function() {
    return this.findAll({
      where: {
        status: 'active'
      }
    });
  };

  return Driver;
};