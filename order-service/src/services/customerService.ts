/**
 * Customer Service Integration
 * Handles communication with the Customer microservice
 */

import axios from 'axios';
import { Customer, ServiceResponse } from '../types';
import { createServiceResponse, createLogger } from '../utils';

const logger = createLogger('OrderService');

// Customer service configuration
const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3001';

/**
 * Validate customer exists and is active
 */
export const validateCustomer = async (customerId: string): Promise<ServiceResponse<any>> => {
  try {
    logger.info(`Validating customer: ${customerId}`);
    
    const response = await axios.get(`${CUSTOMER_SERVICE_URL}/api/customers/${customerId}`, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success && response.data.data) {
      logger.info(`Customer validation successful: ${customerId}`);
      return createServiceResponse(
        true,
        response.data.data,
        undefined,
        200
      );
    } else {
      logger.warn(`Customer validation failed: ${customerId}`);
      return createServiceResponse(
        false,
        undefined,
        'Customer not found or inactive',
        404
      );
    }

  } catch (error: any) {
    logger.error(`Error validating customer ${customerId}:`, error.message);
    
    if (error.response) {
      // Customer service returned an error
      return createServiceResponse(
        false,
        undefined,
        error.response.data?.message || 'Customer service error',
        error.response.status
      );
    } else if (error.code === 'ECONNREFUSED') {
      // Customer service is not available
      return createServiceResponse(
        false,
        undefined,
        'Customer service unavailable',
        503
      );
    } else {
      // Other errors
      return createServiceResponse(
        false,
        undefined,
        'Internal server error',
        500
      );
    }
  }
};

/**
 * Get customer details
 */
export const getCustomer = async (customerId: string): Promise<ServiceResponse<any>> => {
  try {
    logger.info(`Fetching customer details: ${customerId}`);
    
    const response = await axios.get(`${CUSTOMER_SERVICE_URL}/api/customers/${customerId}`, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success && response.data.data) {
      return createServiceResponse(
        true,
        response.data.data,
        undefined,
        200
      );
    } else {
      return createServiceResponse(
        false,
        undefined,
        'Customer not found',
        404
      );
    }

  } catch (error: any) {
    logger.error(`Error fetching customer ${customerId}:`, error.message);
    
    if (error.response) {
      return createServiceResponse(
        false,
        undefined,
        error.response.data?.message || 'Customer service error',
        error.response.status
      );
    } else {
      return createServiceResponse(
        false,
        undefined,
        'Customer service unavailable',
        503
      );
    }
  }
};
