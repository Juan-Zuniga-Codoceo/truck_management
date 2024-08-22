module.exports = (sequelize, DataTypes) => {
  const Route = sequelize.define('Route', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    origin: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    destination: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    distance_km: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    estimated_time: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    intermediate_stops: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('intermediate_stops');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('intermediate_stops', JSON.stringify(value));
      }
    },
    alternative_routes: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('alternative_routes');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('alternative_routes', JSON.stringify(value));
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'under_maintenance'),
      defaultValue: 'active'
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
        fields: ['origin', 'destination']
      },
      {
        fields: ['status']
      }
    ],
    hooks: {
      beforeUpdate: (route) => {
        route.updated_at = new Date();
      }
    }
  });

  Route.associate = function(models) {
    Route.hasMany(models.Assignment, {
      foreignKey: {
        name: 'routeId',
        allowNull: false
      },
      as: 'assignments'
    });
  };

  // Instance method
  Route.prototype.getTotalStops = function() {
    return this.intermediate_stops.length + 2; // origin and destination included
  };

  // Class method
  Route.findActiveRoutes = function() {
    return this.findAll({
      where: {
        status: 'active'
      }
    });
  };

  return Route;
};