/**
 * Main seeding script
 */

import dotenv from 'dotenv';
import { seedCustomers } from './seedCustomers';
import { seedProducts } from './seedProducts';
import { createLogger } from './utils';

// Load environment variables
dotenv.config();

const logger = createLogger('DatabaseSeeder');

/**
 * Wait for service to be ready
 */
const waitForService = async (url: string, serviceName: string, maxRetries: number = 30): Promise<void> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) {
        logger.info(`${serviceName} is ready`);
        return;
      }
    } catch (error) {
      // Service not ready yet
    }
    
    logger.info(`Waiting for ${serviceName}... (${i + 1}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error(`${serviceName} is not ready after ${maxRetries} attempts`);
};

/**
 * Main seeding function
 */
const main = async (): Promise<void> => {
  try {
    logger.info('Starting database seeding process...');

    const customerServiceUrl = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3001';
    const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

    // Wait for services to be ready
    await waitForService(customerServiceUrl, 'Customer Service');
    await waitForService(productServiceUrl, 'Product Service');

    // Seed customers
    await seedCustomers();

    // Wait a bit between seeding operations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Seed products
    await seedProducts();

    logger.info('Database seeding completed successfully!');

  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding script
main();

