/**
 * Test setup for Payment Service
 */

import { connectDatabase } from '../config/database';

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await connectDatabase();
});

// Global test teardown
afterAll(async () => {
  // Cleanup handled in individual test files
});

// Increase timeout for database operations
jest.setTimeout(10000);
