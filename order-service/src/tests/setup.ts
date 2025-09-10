/**
 * Test setup file
 */

import { connectDatabase, disconnectDatabase } from '../config/database';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Use environment variable if available (Docker), otherwise localhost
  if (!process.env.MONGO_URI) {
    process.env.MONGO_URI = 'mongodb://localhost:27017/ecommerce_orders_test';
  } else {
    // For Docker environment, use the admin database with authentication but test collection
    if (process.env.MONGO_URI.includes('authSource=admin')) {
      process.env.MONGO_URI = process.env.MONGO_URI.replace('?authSource=admin', '/ecommerce_orders_test?authSource=admin');
    } else {
      process.env.MONGO_URI = process.env.MONGO_URI.replace('ecommerce_orders', 'ecommerce_orders_test');
    }
  }
  
  // Connect to test database
  await connectDatabase();
});

// Global test teardown
afterAll(async () => {
  // Disconnect from test database
  await disconnectDatabase();
});

// Increase timeout for database operations
jest.setTimeout(10000);

