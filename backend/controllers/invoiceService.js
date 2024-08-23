const { Invoice, Client, sequelize } = require('../models');
const { NotFoundError, ValidationError } = require('../errors');
const PDFDocument = require('pdfkit');
const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis();

class InvoiceService {
  // Crear una nueva factura
  async createInvoice(data) {
    const transaction = await sequelize.transaction();
    try {
      this.validateInvoiceData(data);
      const client = await Client.findByPk(data.client_id);
      if (!client) {
        throw new NotFoundError('Client not found');
      }

      const invoice = await Invoice.create(data, { transaction });
      await transaction.commit();
      logger.info(`Invoice created with ID: ${invoice.id}`);
      await this.invalidateCache('invoices');
      return invoice;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error creating invoice: ${error.message}`);
      throw error;
    }
  }

  // Obtener todas las facturas con filtros, paginación y ordenación
  async getAllInvoices(filters = {}, paginationOptions = { page: 1, limit: 10 }, sortOptions = { field: 'createdAt', order: 'DESC' }) {
    const cacheKey = `invoices:${JSON.stringify({ filters, paginationOptions, sortOptions })}`;
    const cachedResult = await redis.get(cacheKey);

    if (cachedResult) {
      logger.info('Returning invoices from cache');
      return JSON.parse(cachedResult);
    }

    const { page, limit } = paginationOptions;
    const offset = (page - 1) * limit;
    const { field, order } = sortOptions;

    const result = await Invoice.findAndCountAll({
      where: filters,
      limit,
      offset,
      order: [[field, order]],
      include: [{ model: Client, attributes: ['id', 'name', 'email'] }]
    });

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);  // Cache for 5 minutes
    logger.info(`Retrieved ${result.count} invoices`);
    return result;
  }

  // Obtener una factura por ID
  async getInvoiceById(id) {
    const cacheKey = `invoice:${id}`;
    const cachedInvoice = await redis.get(cacheKey);

    if (cachedInvoice) {
      logger.info(`Returning invoice ${id} from cache`);
      return JSON.parse(cachedInvoice);
    }

    const invoice = await Invoice.findByPk(id, {
      include: [{ model: Client, attributes: ['id', 'name', 'email'] }]
    });
    if (!invoice) {
      logger.warn(`Invoice with ID ${id} not found`);
      throw new NotFoundError('Invoice not found');
    }
    await redis.set(cacheKey, JSON.stringify(invoice), 'EX', 300);  // Cache for 5 minutes
    return invoice;
  }

  // Actualizar una factura
  async updateInvoice(id, data) {
    const transaction = await sequelize.transaction();
    try {
      const invoice = await this.getInvoiceById(id);
      if (data.client_id && data.client_id !== invoice.client_id) {
        const client = await Client.findByPk(data.client_id);
        if (!client) {
          throw new NotFoundError('New client not found');
        }
      }
      await invoice.update(data, { transaction });
      await transaction.commit();
      logger.info(`Invoice ${id} updated successfully`);
      await this.invalidateCache('invoices');
      await this.invalidateCache(`invoice:${id}`);
      return invoice;
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error updating invoice ${id}: ${error.message}`);
      throw error;
    }
  }

  // Eliminar una factura
  async deleteInvoice(id) {
    const transaction = await sequelize.transaction();
    try {
      const invoice = await this.getInvoiceById(id);
      await invoice.destroy({ transaction });
      await transaction.commit();
      logger.info(`Invoice ${id} deleted successfully`);
      await this.invalidateCache('invoices');
      await this.invalidateCache(`invoice:${id}`);
      return { message: 'Invoice deleted successfully' };
    } catch (error) {
      await transaction.rollback();
      logger.error(`Error deleting invoice ${id}: ${error.message}`);
      throw error;
    }
  }

  // Obtener facturas de un cliente con filtros, paginación y ordenación
  async getInvoicesByClient(client_id, filters = {}, paginationOptions = { page: 1, limit: 10 }, sortOptions = { field: 'createdAt', order: 'DESC' }) {
    const client = await Client.findByPk(client_id);
    if (!client) {
      logger.warn(`Client with ID ${client_id} not found`);
      throw new NotFoundError('Client not found');
    }

    const { page, limit } = paginationOptions;
    const offset = (page - 1) * limit;
    const { field, order } = sortOptions;

    return await Invoice.findAndCountAll({
      where: { client_id, ...filters },
      limit,
      offset,
      order: [[field, order]],
      include: [{ model: Client, attributes: ['id', 'name', 'email'] }]
    });
  }

  // Obtener estadísticas de facturas
  async getInvoiceStatistics(filters = {}) {
    const stats = await Invoice.findAll({
      where: filters,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalInvoices'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
        [sequelize.fn('AVG', sequelize.col('amount')), 'averageAmount'],
        [sequelize.fn('MIN', sequelize.col('amount')), 'minAmount'],
        [sequelize.fn('MAX', sequelize.col('amount')), 'maxAmount']
      ],
      raw: true
    });

    logger.info('Invoice statistics calculated');
    return stats[0];
  }

  // Generar PDF de factura
  async generateInvoicePDF(id) {
    const invoice = await this.getInvoiceById(id);
    const doc = new PDFDocument();
    
    return new Promise((resolve, reject) => {
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Contenido del PDF mejorado
      doc.fontSize(25).text('Invoice', 100, 50);
      doc.fontSize(15).text(`Invoice ID: ${invoice.id}`, 100, 100);
      doc.text(`Client: ${invoice.Client.name}`, 100, 130);
      doc.text(`Email: ${invoice.Client.email}`, 100, 160);
      doc.text(`Amount: ${invoice.amount.toFixed(2)}`, 100, 190);
      doc.text(`Date: ${invoice.createdAt.toDateString()}`, 100, 220);
      doc.text(`Due Date: ${invoice.due_date.toDateString()}`, 100, 250);

      // Tabla de items facturados (suponiendo que tienes esta información)
      doc.moveDown().table({
        headers: ['Item', 'Quantity', 'Unit Price', 'Total'],
        rows: invoice.items.map(item => [
          item.name,
          item.quantity,
          `${item.unitPrice.toFixed(2)}`,
          `${(item.quantity * item.unitPrice).toFixed(2)}`
        ])
      }, 100, 280, { width: 300 });

      doc.end();
    });
  }

  // Método para validar datos de factura
  validateInvoiceData(data) {
    const requiredFields = ['client_id', 'amount', 'due_date', 'items'];
    for (let field of requiredFields) {
      if (!data[field]) {
        throw new ValidationError(`Missing required field: ${field}`);
      }
    }

    if (typeof data.amount !== 'number' || data.amount <= 0) {
      throw new ValidationError('Amount must be a positive number');
    }

    if (!(data.due_date instanceof Date) && isNaN(Date.parse(data.due_date))) {
      throw new ValidationError('Invalid due date');
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new ValidationError('Items must be a non-empty array');
    }
  }

  // Método para invalidar cache
  async invalidateCache(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info(`Cache invalidated for pattern: ${pattern}`);
    }
  }
}

module.exports = new InvoiceService();