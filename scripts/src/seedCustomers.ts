/**
 * Customer seeding script
 */

import axios from 'axios';
import { createLogger } from './utils';

const logger = createLogger('CustomerSeeder');

const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3001';

// Sample customer data with authentic Nigerian names
const sampleCustomers = [
  {
    name: 'Adebayo Ogunlesi',
    email: 'adebayo.ogunlesi@example.com',
    phone: '+234-801-234-5678',
    address: {
      street: '123 Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '101241',
      country: 'Nigeria'
    }
  },
  {
    name: 'Fatima Ibrahim',
    email: 'fatima.ibrahim@example.com',
    phone: '+234-802-345-6789',
    address: {
      street: '456 Ikoyi Road',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '101233',
      country: 'Nigeria'
    }
  },
  {
    name: 'Chinedu Okonkwo',
    email: 'chinedu.okonkwo@example.com',
    phone: '+234-803-456-7890',
    address: {
      street: '789 Abuja Central',
      city: 'Abuja',
      state: 'FCT',
      zipCode: '900001',
      country: 'Nigeria'
    }
  },
  {
    name: 'Aisha Mohammed',
    email: 'aisha.mohammed@example.com',
    phone: '+234-804-567-8901',
    address: {
      street: '321 Port Harcourt',
      city: 'Port Harcourt',
      state: 'Rivers',
      zipCode: '500001',
      country: 'Nigeria'
    }
  },
  {
    name: 'Emeka Nwosu',
    email: 'emeka.nwosu@example.com',
    phone: '+234-805-678-9012',
    address: {
      street: '654 Kano Central',
      city: 'Kano',
      state: 'Kano',
      zipCode: '700001',
      country: 'Nigeria'
    }
  },
  {
    name: 'Zainab Abdullahi',
    email: 'zainab.abdullahi@example.com',
    phone: '+234-806-789-0123',
    address: {
      street: '987 Ibadan Express',
      city: 'Ibadan',
      state: 'Oyo',
      zipCode: '200001',
      country: 'Nigeria'
    }
  },
  {
    name: 'Olumide Adebayo',
    email: 'olumide.adebayo@example.com',
    phone: '+234-807-890-1234',
    address: {
      street: '456 Benin City',
      city: 'Benin',
      state: 'Edo',
      zipCode: '300001',
      country: 'Nigeria'
    }
  },
  {
    name: 'Hauwa Usman',
    email: 'hauwa.usman@example.com',
    phone: '+234-808-901-2345',
    address: {
      street: '321 Kaduna North',
      city: 'Kaduna',
      state: 'Kaduna',
      zipCode: '800001',
      country: 'Nigeria'
    }
  },
  {
    name: 'Tunde Ojo',
    email: 'tunde.ojo@example.com',
    phone: '+234-809-012-3456',
    address: {
      street: '654 Jos Plateau',
      city: 'Jos',
      state: 'Plateau',
      zipCode: '930001',
      country: 'Nigeria'
    }
  },
  {
    name: 'Amina Hassan',
    email: 'amina.hassan@example.com',
    phone: '+234-810-123-4567',
    address: {
      street: '789 Maiduguri',
      city: 'Maiduguri',
      state: 'Borno',
      zipCode: '600001',
      country: 'Nigeria'
    }
  }
];

/**
 * Check if customer exists by email
 */
const checkCustomerExists = async (email: string): Promise<any> => {
  try {
    const response = await axios.get(`${CUSTOMER_SERVICE_URL}/api/customers/email/${email}`, {
      timeout: 5000
    });
    return response.data.success ? response.data.data : null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Customer doesn't exist
    }
    throw error;
  }
};

/**
 * Create or update customer
 */
const createOrUpdateCustomer = async (customerData: any): Promise<any> => {
  try {
    // First, check if customer exists
    const existingCustomer = await checkCustomerExists(customerData.email);
    
    if (existingCustomer) {
      logger.info(`Customer already exists: ${customerData.name} (${existingCustomer.customerId})`);
      return existingCustomer;
    }

    // Create new customer
    const response = await axios.post(`${CUSTOMER_SERVICE_URL}/api/customers`, customerData, {
      timeout: 5000
    });

    if (response.data.success) {
      logger.info(`Customer created: ${customerData.name} (${response.data.data.customerId})`);
      return response.data.data;
    } else {
      logger.warn(`Failed to create customer: ${customerData.name} - ${response.data.message}`);
      return null;
    }
  } catch (error: any) {
    if (error.response?.status === 409) {
      logger.info(`Customer already exists: ${customerData.name}`);
      // Try to get the existing customer
      return await checkCustomerExists(customerData.email);
    } else if (error.response?.status === 400) {
      logger.warn(`Validation error for customer ${customerData.name}: ${error.response.data.message}`);
      return null;
    } else {
      logger.error(`Error creating customer ${customerData.name}:`, error.message);
      return null;
    }
  }
};

/**
 * Seed customers
 */
export const seedCustomers = async (): Promise<void> => {
  try {
    logger.info('Starting customer seeding...');

    let createdCount = 0;
    let existingCount = 0;
    let errorCount = 0;

    for (const customer of sampleCustomers) {
      const result = await createOrUpdateCustomer(customer);
      
      if (result) {
        if (result.customerId && result.customerId.includes('CUST_')) {
          // This is a newly created customer
          createdCount++;
        } else {
          // This is an existing customer
          existingCount++;
        }
      } else {
        errorCount++;
      }
    }

    logger.info(`Customer seeding completed - Created: ${createdCount}, Existing: ${existingCount}, Errors: ${errorCount}`);

  } catch (error) {
    logger.error('Error seeding customers:', error);
    throw error;
  }
};

