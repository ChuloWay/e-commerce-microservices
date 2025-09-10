/**
 * Database seeding script for Customer Service
 * This script creates sample customer data for testing and development
 */

import mongoose from 'mongoose';
import { CustomerModel } from '../models/Customer';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { createLogger } from '../utils';

const logger = createLogger('CustomerSeeder');

// Sample customer data
const sampleCustomers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0456',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    }
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    phone: '+1-555-0789',
    address: {
      street: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    }
  },
  {
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    phone: '+1-555-0321',
    address: {
      street: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'USA'
    }
  },
  {
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    phone: '+1-555-0654',
    address: {
      street: '654 Maple Drive',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'USA'
    }
  }
];

/**
 * Seed the database with sample customers
 */
const seedCustomers = async (): Promise<void> => {
  try {
    logger.info('Starting customer seeding process...');

    // Connect to database
    await connectDatabase();

    // Clear existing customers (optional - remove this line to keep existing data)
    await CustomerModel.deleteMany({});
    logger.info('Cleared existing customer data');

    // Insert sample customers
    const createdCustomers = await CustomerModel.insertMany(sampleCustomers);
    logger.info(`Successfully created ${createdCustomers.length} customers`);

    // Log created customers
    createdCustomers.forEach(customer => {
      logger.info(`Created customer: ${customer.name} (${customer.customerId}) - ${customer.email}`);
    });

    logger.info('Customer seeding completed successfully');

  } catch (error) {
    logger.error('Error seeding customers:', error);
    throw error;
  } finally {
    // Disconnect from database
    await disconnectDatabase();
  }
};

/**
 * Main execution function
 */
const main = async (): Promise<void> => {
  try {
    await seedCustomers();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding script if this file is executed directly
if (require.main === module) {
  main();
}

export { seedCustomers };
