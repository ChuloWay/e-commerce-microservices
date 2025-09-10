/**
 * Payment Service Integration
 * Handles communication with the Payment microservice
 */

import axios from 'axios';
import { PaymentResponse, ServiceResponse } from '../types';
import { createServiceResponse, createLogger } from '../utils';

const logger = createLogger('OrderService');

// Payment service configuration
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';

/**
 * Process payment for an order
 */
export const processPayment = async (
  customerId: string,
  orderId: string,
  productId: string,
  amount: number
): Promise<ServiceResponse<any>> => {
  try {
    logger.info(`Processing payment for order: ${orderId} (amount: ₦${amount})`);
    
    const paymentData = {
      customerId,
      orderId,
      productId,
      amount,
      paymentMethod: 'bank_transfer'
    };

    const response = await axios.post(`${PAYMENT_SERVICE_URL}/api/payments`, paymentData, {
      timeout: 10000, // Longer timeout for payment processing
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success && response.data.data) {
      logger.info(`Payment processed successfully for order: ${orderId}`);
      return createServiceResponse(
        true,
        response.data.data,
        undefined,
        200
      );
    } else {
      logger.warn(`Payment processing failed for order: ${orderId}`);
      return createServiceResponse(
        false,
        undefined,
        response.data.message || 'Payment processing failed',
        400
      );
    }

  } catch (error: any) {
    logger.error(`Error processing payment for order ${orderId}:`, error.message);
    
    if (error.response) {
      // Payment service returned an error
      return createServiceResponse(
        false,
        undefined,
        error.response.data?.message || 'Payment service error',
        error.response.status
      );
    } else if (error.code === 'ECONNREFUSED') {
      // Payment service is not available
      return createServiceResponse(
        false,
        undefined,
        'Payment service unavailable',
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
 * Get payment status for an order
 */
export const getPaymentStatus = async (orderId: string): Promise<ServiceResponse<any>> => {
  try {
    logger.info(`Fetching payment status for order: ${orderId}`);
    
    const response = await axios.get(`${PAYMENT_SERVICE_URL}/api/payments/order/${orderId}`, {
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
        'Payment not found',
        404
      );
    }

  } catch (error: any) {
    logger.error(`Error fetching payment status for order ${orderId}:`, error.message);
    
    if (error.response) {
      return createServiceResponse(
        false,
        undefined,
        error.response.data?.message || 'Payment service error',
        error.response.status
      );
    } else {
      return createServiceResponse(
        false,
        undefined,
        'Payment service unavailable',
        503
      );
    }
  }
};
