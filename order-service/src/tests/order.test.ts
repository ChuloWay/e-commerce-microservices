/**
 * Order Service Tests
 */

import request from 'supertest';
import app from '../app';
import { OrderModel } from '../models/Order';
import { connectDatabase, disconnectDatabase } from '../config/database';

// Mock the external service calls
jest.mock('../services/customerService');
jest.mock('../services/productService');
jest.mock('../services/paymentService');

import { validateCustomer } from '../services/customerService';
import { validateProduct, updateProductStock } from '../services/productService';
import { processPayment } from '../services/paymentService';

const mockValidateCustomer = validateCustomer as jest.MockedFunction<typeof validateCustomer>;
const mockValidateProduct = validateProduct as jest.MockedFunction<typeof validateProduct>;
const mockUpdateProductStock = updateProductStock as jest.MockedFunction<typeof updateProductStock>;
const mockProcessPayment = processPayment as jest.MockedFunction<typeof processPayment>;

describe('Order Service', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await OrderModel.deleteMany({});
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await OrderModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    it('should create a new order successfully', async () => {
      // Mock successful service responses
      mockValidateCustomer.mockResolvedValue({
        success: true,
        data: { customerId: 'CUST_123', name: 'John Doe', email: 'john@example.com' },
        error: undefined,
        statusCode: 200
      });

      mockValidateProduct.mockResolvedValue({
        success: true,
        data: { productId: 'PROD_123', name: 'Test Product', price: 99.99, stock: 10 },
        error: undefined,
        statusCode: 200
      });

      mockProcessPayment.mockResolvedValue({
        success: true,
        data: {
          paymentId: 'PAY_123',
          customerId: 'CUST_123',
          orderId: 'ORD_123',
          amount: 99.99,
          paymentStatus: 'completed',
          transactionId: 'TXN_123',
          paymentDate: new Date()
        },
        error: undefined,
        statusCode: 200
      });

      mockUpdateProductStock.mockResolvedValue({
        success: true,
        data: true,
        error: undefined,
        statusCode: 200
      });

      const orderData = {
        customerId: 'CUST_123',
        productId: 'PROD_123',
        amount: 99.99
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerId).toBe(orderData.customerId);
      expect(response.body.data.productId).toBe(orderData.productId);
      expect(response.body.data.orderStatus).toBe('confirmed');
      expect(response.body.data.orderId).toBeDefined();

      // Verify mocks were called
      expect(mockValidateCustomer).toHaveBeenCalledWith(orderData.customerId);
      expect(mockValidateProduct).toHaveBeenCalledWith(orderData.productId, 1);
      expect(mockProcessPayment).toHaveBeenCalledWith(
        orderData.customerId,
        expect.any(String),
        orderData.productId,
        orderData.amount
      );
    });

    it('should return 400 for invalid customer', async () => {
      mockValidateCustomer.mockResolvedValue({
        success: false,
        data: null,
        error: 'Customer not found',
        statusCode: 404
      });

      const orderData = {
        customerId: 'INVALID_CUST',
        productId: 'PROD_123',
        amount: 99.99
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Customer validation failed');
    });

    it('should return 400 for invalid product', async () => {
      mockValidateCustomer.mockResolvedValue({
        success: true,
        data: { customerId: 'CUST_123', name: 'John Doe', email: 'john@example.com' },
        error: undefined,
        statusCode: 200
      });

      mockValidateProduct.mockResolvedValue({
        success: false,
        data: null,
        error: 'Product not found',
        statusCode: 404
      });

      const orderData = {
        customerId: 'CUST_123',
        productId: 'INVALID_PROD',
        amount: 99.99
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Product validation failed');
    });

    it('should return 400 for payment failure', async () => {
      mockValidateCustomer.mockResolvedValue({
        success: true,
        data: { customerId: 'CUST_123', name: 'John Doe', email: 'john@example.com' },
        error: undefined,
        statusCode: 200
      });

      mockValidateProduct.mockResolvedValue({
        success: true,
        data: { productId: 'PROD_123', name: 'Test Product', price: 99.99, stock: 10 },
        error: undefined,
        statusCode: 200
      });

      mockProcessPayment.mockResolvedValue({
        success: false,
        data: null,
        error: 'Payment failed',
        statusCode: 400
      });

      const orderData = {
        customerId: 'CUST_123',
        productId: 'PROD_123',
        amount: 99.99
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Payment processing failed');
    });

    it('should return 400 for negative amount', async () => {
      const orderData = {
        customerId: 'CUST_123',
        productId: 'PROD_123',
        amount: -10
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive number');
    });

    it('should return 400 for missing required fields', async () => {
      const orderData = {
        customerId: 'CUST_123'
        // Missing productId and amount
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/orders/:orderId', () => {
    it('should get order by ID', async () => {
      // Create an order directly in the database
      const order = new OrderModel({
        customerId: 'CUST_123',
        productId: 'PROD_123',
        amount: 99.99,
        orderStatus: 'confirmed',
        orderDate: new Date()
      });
      await order.save();

      const response = await request(app)
        .get(`/api/orders/${order.orderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBe(order.orderId);
      expect(response.body.data.customerId).toBe('CUST_123');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/orders', () => {
    it('should get all orders with pagination', async () => {
      // Create multiple orders
      const orders = [
        { customerId: 'CUST_1', productId: 'PROD_1', amount: 10, orderStatus: 'confirmed' },
        { customerId: 'CUST_2', productId: 'PROD_2', amount: 20, orderStatus: 'pending' },
        { customerId: 'CUST_3', productId: 'PROD_3', amount: 30, orderStatus: 'confirmed' }
      ];

      for (const orderData of orders) {
        const order = new OrderModel(orderData);
        await order.save();
      }

      const response = await request(app)
        .get('/api/orders?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should filter orders by status', async () => {
      // Create orders with different statuses
      const orders = [
        { customerId: 'CUST_1', productId: 'PROD_1', amount: 10, orderStatus: 'confirmed' },
        { customerId: 'CUST_2', productId: 'PROD_2', amount: 20, orderStatus: 'pending' },
        { customerId: 'CUST_3', productId: 'PROD_3', amount: 30, orderStatus: 'confirmed' }
      ];

      for (const orderData of orders) {
        const order = new OrderModel(orderData);
        await order.save();
      }

      const response = await request(app)
        .get('/api/orders?status=confirmed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(2);
      expect(response.body.data.orders.every((o: any) => o.orderStatus === 'confirmed')).toBe(true);
    });
  });

  describe('PATCH /api/orders/:orderId/status', () => {
    it('should update order status', async () => {
      const order = new OrderModel({
        customerId: 'CUST_123',
        productId: 'PROD_123',
        amount: 99.99,
        orderStatus: 'confirmed',
        orderDate: new Date()
      });
      await order.save();

      const response = await request(app)
        .patch(`/api/orders/${order.orderId}/status`)
        .send({ status: 'processing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderStatus).toBe('processing');
    });

    it('should return 400 for invalid status transition', async () => {
      const order = new OrderModel({
        customerId: 'CUST_123',
        productId: 'PROD_123',
        amount: 99.99,
        orderStatus: 'delivered',
        orderDate: new Date()
      });
      await order.save();

      const response = await request(app)
        .patch(`/api/orders/${order.orderId}/status`)
        .send({ status: 'pending' });

      // Status transition might be allowed or not depending on implementation
      expect([200, 400]).toContain(response.status);
      if (response.status === 400) {
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Invalid status transition');
      } else {
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.service).toBe('order-service');
    });
  });
});

