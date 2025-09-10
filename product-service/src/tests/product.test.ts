/**
 * Product Service Tests
 */

import request from 'supertest';
import app from '../app';
import { ProductModel } from '../models/Product';
import { connectDatabase, disconnectDatabase } from '../config/database';

describe('Product Service', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await ProductModel.deleteMany({});
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await ProductModel.deleteMany({});
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        category: 'Electronics',
        stock: 50,
        imageUrl: 'https://example.com/images/headphones.jpg'
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.price).toBe(productData.price);
      expect(response.body.data.productId).toBeDefined();
    });

    it('should return 400 for negative price', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: -10,
        category: 'Test',
        stock: 10
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive number');
    });

    it('should return 400 for negative stock', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 10,
        category: 'Test',
        stock: -5
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('non-negative number');
    });

    it('should return 400 for missing required fields', async () => {
      const productData = {
        name: 'Test Product'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/products/:productId', () => {
    it('should get product by ID', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Test',
        stock: 10
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      const productId = createResponse.body.data.productId;

      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.productId).toBe(productId);
      expect(response.body.data.name).toBe(productData.name);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /api/products', () => {
    it('should get all products with pagination', async () => {
      // Create multiple products
      const products = [
        { name: 'Product 1', description: 'Desc 1', price: 10, category: 'Cat 1', stock: 5 },
        { name: 'Product 2', description: 'Desc 2', price: 20, category: 'Cat 2', stock: 10 },
        { name: 'Product 3', description: 'Desc 3', price: 30, category: 'Cat 1', stock: 15 }
      ];

      for (const product of products) {
        await request(app)
          .post('/api/products')
          .send(product)
          .expect(201);
      }

      const response = await request(app)
        .get('/api/products?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(3);
    });

    it('should filter products by category', async () => {
      // Create products in different categories
      const products = [
        { name: 'Electronics 1', description: 'Desc 1', price: 10, category: 'Electronics', stock: 5 },
        { name: 'Clothing 1', description: 'Desc 2', price: 20, category: 'Clothing', stock: 10 },
        { name: 'Electronics 2', description: 'Desc 3', price: 30, category: 'Electronics', stock: 15 }
      ];

      for (const product of products) {
        await request(app)
          .post('/api/products')
          .send(product)
          .expect(201);
      }

      const response = await request(app)
        .get('/api/products?category=Electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.products.every((p: any) => p.category === 'Electronics')).toBe(true);
    });

    it('should filter products in stock', async () => {
      // Create products with different stock levels
      const products = [
        { name: 'In Stock 1', description: 'Desc 1', price: 10, category: 'Test', stock: 5 },
        { name: 'Out of Stock', description: 'Desc 2', price: 20, category: 'Test', stock: 0 },
        { name: 'In Stock 2', description: 'Desc 3', price: 30, category: 'Test', stock: 10 }
      ];

      for (const product of products) {
        await request(app)
          .post('/api/products')
          .send(product)
          .expect(201);
      }

      const response = await request(app)
        .get('/api/products?inStock=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
      expect(response.body.data.products.every((p: any) => p.stock > 0)).toBe(true);
    });
  });

  describe('PATCH /api/products/:productId/stock', () => {
    it('should increase product stock', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Test',
        stock: 10
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      const productId = createResponse.body.data.productId;

      const response = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .send({ quantity: 5, operation: 'increase' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stock).toBe(15);
    });

    it('should decrease product stock', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Test',
        stock: 10
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      const productId = createResponse.body.data.productId;

      const response = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .send({ quantity: 3, operation: 'decrease' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stock).toBe(7);
    });

    it('should return 400 for insufficient stock', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'Test',
        stock: 5
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(201);

      const productId = createResponse.body.data.productId;

      const response = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .send({ quantity: 10, operation: 'decrease' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient stock');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.service).toBe('product-service');
    });
  });
});

