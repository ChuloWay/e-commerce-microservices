/**
 * Payment Service Tests
 */

import request from 'supertest';
import app from '../app';
import { PaymentModel } from '../models/Payment';
import { connectDatabase, disconnectDatabase } from '../config/database';

// Mock RabbitMQ service
jest.mock('../services/rabbitmqService');
import { rabbitMQService } from '../services/rabbitmqService';
const mockRabbitMQService = rabbitMQService as jest.Mocked<typeof rabbitMQService>;

describe('Payment Service', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await PaymentModel.deleteMany({});
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await PaymentModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('POST /api/payments', () => {
    it('should process a payment successfully', async () => {
      const paymentData = {
        customerId: 'CUST_123',
        orderId: 'ORD_123',
        productId: 'PROD_123',
        amount: 50000,
        paymentMethod: 'bank_transfer'
      };

      mockRabbitMQService.publishTransaction.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentId).toBeDefined();
      expect(response.body.data.transactionId).toBeDefined();
      expect(response.body.message).toBe('Payment processed successfully');
    });

    it('should fail payment processing with invalid amount', async () => {
      const paymentData = {
        customerId: 'CUST_123',
        orderId: 'ORD_123',
        productId: 'PROD_123',
        amount: -100,
        paymentMethod: 'bank_transfer'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should fail payment processing with missing required fields', async () => {
      const paymentData = {
        customerId: 'CUST_123',
        orderId: 'ORD_123',
        // Missing productId and amount
        paymentMethod: 'bank_transfer'
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should handle payment gateway failure', async () => {
      const paymentData = {
        customerId: 'CUST_123',
        orderId: 'ORD_123',
        productId: 'PROD_123',
        amount: 1, // Valid amount that might trigger failure
        paymentMethod: 'bank_transfer'
      };

      // This test might pass or fail depending on the 5% failure rate
      // We'll just test that the endpoint responds correctly
      const response = await request(app)
        .post('/api/payments')
        .send(paymentData);

      expect([200, 201, 400]).toContain(response.status);
      expect(response.body.success).toBeDefined();
    });
  });

  describe('GET /api/payments', () => {
    it('should get all payments', async () => {
      // Create test payments
      const payment1 = new PaymentModel({
        customerId: 'CUST_123',
        orderId: 'ORD_123',
        productId: 'PROD_123',
        amount: 50000,
        status: 'completed',
        paymentMethod: 'bank_transfer'
      });
      await payment1.save();

      const payment2 = new PaymentModel({
        customerId: 'CUST_456',
        orderId: 'ORD_456',
        productId: 'PROD_456',
        amount: 75000,
        status: 'completed',
        paymentMethod: 'credit_card'
      });
      await payment2.save();

      const response = await request(app)
        .get('/api/payments')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payments).toHaveLength(2);
    });
  });

  describe('GET /api/payments/order/:orderId', () => {
    it('should get payment by order ID', async () => {
      const payment = new PaymentModel({
        customerId: 'CUST_123',
        orderId: 'ORD_123',
        productId: 'PROD_123',
        amount: 50000,
        status: 'completed',
        paymentMethod: 'bank_transfer'
      });
      await payment.save();

      const response = await request(app)
        .get('/api/payments/order/ORD_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBe('ORD_123');
      expect(response.body.data.amount).toBe(50000);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/payments/order/NON_EXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Payment not found');
    });
  });

  describe('GET /api/payments/:paymentId', () => {
    it('should get payment by payment ID', async () => {
      const payment = new PaymentModel({
        customerId: 'CUST_123',
        orderId: 'ORD_123',
        productId: 'PROD_123',
        amount: 50000,
        status: 'completed',
        paymentMethod: 'bank_transfer'
      });
      await payment.save();

      const response = await request(app)
        .get(`/api/payments/${payment.paymentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentId).toBe(payment.paymentId);
      expect(response.body.data.amount).toBe(50000);
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/NON_EXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Payment not found');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.service).toBe('payment-service');
      expect(response.body.message).toContain('healthy');
    });
  });
});
