/**
 * Integration Test Setup
 */

// Increase timeout for integration tests
jest.setTimeout(60000);

// Global test setup
beforeAll(async () => {
  console.log('Starting integration tests...');
});

// Global test teardown
afterAll(async () => {
  console.log('Integration tests completed.');
});
