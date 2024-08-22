'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vehicles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      vin: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      license_plate: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      model: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      make: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      capacity: {
        type: Sequelize.DECIMAL(8, 2),  // Aumentado a 8,2 para permitir capacidades mayores
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'active'
      },
      next_maintenance_date: {
        type: Sequelize.DATE
      },
      insurance_expiry_date: {
        type: Sequelize.DATE
      },
      created_by: {  // Cambiado a snake_case
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      updated_by: {  // Cambiado a snake_case
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      created_at: {  // Cambiado a snake_case
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {  // Cambiado a snake_case
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {  // Cambiado a snake_case
        type: Sequelize.DATE
      }
    });

    // Añadir índices
    await queryInterface.addIndex('Vehicles', ['status']);
    await queryInterface.addIndex('Vehicles', ['make', 'model']);
    await queryInterface.addIndex('Vehicles', ['vin']);
    await queryInterface.addIndex('Vehicles', ['license_plate']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vehicles');
  }
};