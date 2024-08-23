const { Invoice } = require('../models');
const { ValidationError, NotFoundError } = require('../errors');
const invoiceService = require('../services/invoiceService');
const logger = require('../utils/logger');
const config = require('../config');
const { validateInvoice } = require('../validators/invoiceValidator');

class InvoiceController {
  // Crear una nueva factura
  async create(req, res, next) {
    try {
      await validateInvoice(req.body);
      const invoice = await invoiceService.createInvoice(req.body);
      logger.info(`Factura creada con ID: ${invoice.id}`);
      return res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al crear factura:', error);
      next(error);
    }
  }

  // Obtener todas las facturas con paginación y filtrado
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = config.pagination.defaultLimit, status, client_id, start_date, end_date } = req.query;
      
      const filters = { status, client_id, start_date, end_date };
      const paginationOptions = { page: Number(page), limit: Number(limit) };

      const result = await invoiceService.getAllInvoices(filters, paginationOptions);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error al obtener facturas:', error);
      next(error);
    }
  }

  // Obtener una factura por ID
  async getById(req, res, next) {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);
      return res.status(200).json(invoice);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener factura por ID:', error);
      next(error);
    }
  }

  // Actualizar una factura
  async update(req, res, next) {
    try {
      await validateInvoice(req.body, true);
      const updatedInvoice = await invoiceService.updateInvoice(req.params.id, req.body);
      return res.status(200).json(updatedInvoice);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Error al actualizar factura:', error);
      next(error);
    }
  }

  // Eliminar una factura
  async delete(req, res, next) {
    try {
      await invoiceService.deleteInvoice(req.params.id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al eliminar factura:', error);
      next(error);
    }
  }

  // Obtener facturas por cliente
  async getInvoicesByClient(req, res, next) {
    try {
      const { start_date, end_date, page = 1, limit = config.pagination.defaultLimit } = req.query;
      const filters = { start_date, end_date };
      const paginationOptions = { page: Number(page), limit: Number(limit) };
      const invoices = await invoiceService.getInvoicesByClient(req.params.client_id, filters, paginationOptions);
      return res.status(200).json(invoices);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al obtener facturas del cliente:', error);
      next(error);
    }
  }

  // Obtener estadísticas de facturas
  async getInvoiceStatistics(req, res, next) {
    try {
      const { start_date, end_date, client_id } = req.query;
      const statistics = await invoiceService.getInvoiceStatistics({ start_date, end_date, client_id });
      return res.status(200).json(statistics);
    } catch (error) {
      logger.error('Error al obtener estadísticas de facturas:', error);
      next(error);
    }
  }

  // Generar PDF de factura
  async generateInvoicePDF(req, res, next) {
    try {
      const pdfBuffer = await invoiceService.generateInvoicePDF(req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${req.params.id}.pdf`);
      return res.send(pdfBuffer);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Error al generar PDF de factura:', error);
      next(error);
    }
  }
}

module.exports = new InvoiceController();