module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      contact_person: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  
    Client.associate = function(models) {
      Client.hasMany(models.Assignment, {
        foreignKey: 'client_id',
        as: 'assignments'
      });
    };
  
    return Client;
  };