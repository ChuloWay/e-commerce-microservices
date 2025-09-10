/**
 * Customer Service Tests
 */

import request from 'supertest';
import app from '../app';
import { CustomerModel } from '../models/Customer';
import { connectDatabase, disconnectDatabase } from '../config/database';

describe('Customer Service', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await CustomerModel.deleteMany({});
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await CustomerModel.deleteMany({});
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-012-3456',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(customerData.name);
      expect(response.body.data.email).toBe(customerData.email);
      expect(response.body.data.customerId).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '+1-555-012-3456'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email format');
    });

    it('should return 400 for missing required fields', async () => {
      const customerData = {
        name: 'John Doe'
        // Missing email
      };

      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 409 for duplicate email', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-012-3456'
      };

      // Create first customer
      await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(201);

      // Try to create second customer with same email
      const response = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('GET /api/customers/:customerId', () => {
    it('should get customer by ID', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-012-3456'
      };

      const createResponse = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(201);

      const customerId = createResponse.body.data.customerId;

      const response = await request(app)
        .get(`/api/customers/${customerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerId).toBe(customerId);
      expect(response.body.data.name).toBe(customerData.name);
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/customers/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/customers', () => {
    it('should get all customers with pagination', async () => {
      // Create multiple customers
      const customers = [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' },
        { name: 'Bob Johnson', email: 'bob@example.com' }
      ];

      for (const customer of customers) {
        await request(app)
          .post('/api/customers')
          .send(customer)
          .expect(201);
      }

      const response = await request(app)
        .get('/api/customers?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customers).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(3);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(2);
    });
  });

  describe('PUT /api/customers/:customerId', () => {
    it('should update customer', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-012-3456'
      };

      const createResponse = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(201);

      const customerId = createResponse.body.data.customerId;

      const updateData = {
        name: 'John Updated',
        phone: '+1-555-999-9999'
      };

      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.email).toBe(customerData.email); // Should remain unchanged
    });
  });

  describe('DELETE /api/customers/:customerId', () => {
    it('should delete customer (soft delete)', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-012-3456'
      };

      const createResponse = await request(app)
        .post('/api/customers')
        .send(customerData)
        .expect(201);

      const customerId = createResponse.body.data.customerId;

      const response = await request(app)
        .delete(`/api/customers/${customerId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify customer is soft deleted
      const getResponse = await request(app)
        .get(`/api/customers/${customerId}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.service).toBe('customer-service');
    });
  });
});

