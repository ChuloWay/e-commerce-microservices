/**
 * Product Service Integration
 * Handles communication with the Product microservice
 */

import axios from 'axios';
import { Product, ServiceResponse } from '../types';
import { createServiceResponse, createLogger } from '../utils';

const logger = createLogger('OrderService');

// Product service configuration
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

/**
 * Validate product exists and is available
 */
export const validateProduct = async (productId: string, quantity: number = 1): Promise<ServiceResponse<any>> => {
  try {
    logger.info(`Validating product: ${productId} (quantity: ${quantity})`);
    
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success && response.data.data) {
      const product = response.data.data;
      
      // Check if product is available and has sufficient stock
      if (product.isActive && product.stock >= quantity) {
        logger.info(`Product validation successful: ${productId}`);
        return createServiceResponse(
          true,
          product,
          undefined,
          200
        );
      } else {
        logger.warn(`Product validation failed: ${productId} - insufficient stock or inactive`);
        return createServiceResponse(
          false,
          undefined,
          'Product not available or insufficient stock',
          400
        );
      }
    } else {
      logger.warn(`Product validation failed: ${productId} - not found`);
      return createServiceResponse(
        false,
        undefined,
        'Product not found',
        404
      );
    }

  } catch (error: any) {
    logger.error(`Error validating product ${productId}:`, error.message);
    
    if (error.response) {
      // Product service returned an error
      return createServiceResponse(
        false,
        undefined,
        error.response.data?.message || 'Product service error',
        error.response.status
      );
    } else if (error.code === 'ECONNREFUSED') {
      // Product service is not available
      return createServiceResponse(
        false,
        undefined,
        'Product service unavailable',
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
 * Get product details
 */
export const getProduct = async (productId: string): Promise<ServiceResponse<any>> => {
  try {
    logger.info(`Fetching product details: ${productId}`);
    
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`, {
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
        'Product not found',
        404
      );
    }

  } catch (error: any) {
    logger.error(`Error fetching product ${productId}:`, error.message);
    
    if (error.response) {
      return createServiceResponse(
        false,
        undefined,
        error.response.data?.message || 'Product service error',
        error.response.status
      );
    } else {
      return createServiceResponse(
        false,
        undefined,
        'Product service unavailable',
        503
      );
    }
  }
};

/**
 * Update product stock (decrease stock when order is placed)
 */
export const updateProductStock = async (productId: string, quantity: number): Promise<ServiceResponse<any>> => {
  try {
    logger.info(`Updating product stock: ${productId} (decrease by ${quantity})`);
    
    const response = await axios.patch(`${PRODUCT_SERVICE_URL}/api/products/${productId}/stock`, {
      quantity,
      operation: 'decrease'
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      logger.info(`Product stock updated successfully: ${productId}`);
      return createServiceResponse(
        true,
        true,
        undefined,
        200
      );
    } else {
      return createServiceResponse(
        false,
        false,
        response.data.message || 'Failed to update product stock',
        400
      );
    }

  } catch (error: any) {
    logger.error(`Error updating product stock ${productId}:`, error.message);
    
    if (error.response) {
      return createServiceResponse(
        false,
        false,
        error.response.data?.message || 'Product service error',
        error.response.status
      );
    } else {
      return createServiceResponse(
        false,
        false,
        'Product service unavailable',
        503
      );
    }
  }
};
