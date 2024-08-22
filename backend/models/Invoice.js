module.exports = (sequelize, DataTypes) => {
    const Invoice = sequelize.define('Invoice', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      invoice_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'overdue'),
        defaultValue: 'pending'
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      timestamps: true,
      paranoid: true,
      underscored: true
    });
  
    Invoice.associate = function(models) {
      Invoice.belongsTo(models.Assignment, {
        foreignKey: 'assignment_id',
        as: 'assignment'
      });
    };
  
    return Invoice;
  };