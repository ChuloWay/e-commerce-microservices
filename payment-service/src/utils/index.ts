/**
 * Payment Service Utilities
 * Only utilities used by the Payment Service
 */

import { ApiResponse, ServiceResponse, ValidationResult, ValidationError } from '../types';
import winston from 'winston';

/**
 * Generate a unique ID for entities
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

/**
 * Generate a transaction ID
 */
export const generateTransactionId = (): string => {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a standardized API response
 */
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> => {
  return {
    success,
    data,
    message,
    error
  };
};

/**
 * Create a standardized service response
 */
export const createServiceResponse = <T>(
  success: boolean,
  data?: T,
  error?: string,
  statusCode?: number
): ServiceResponse<T> => {
  return {
    success,
    data,
    error,
    statusCode
  };
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): ValidationResult => {
  const errors: ValidationError[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push({
        field,
        message: `${field} is required`
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate payment amount
 */
export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 100000000; // Max ₦100M per payment
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Simulate payment gateway processing
 */
export const simulatePaymentGateway = async (
  amount: number,
  paymentMethod: string = 'bank_transfer'
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulate 90% success rate
  const success = Math.random() > 0.1;
  
  if (success) {
    return {
      success: true,
      transactionId: generateTransactionId()
    };
  } else {
    return {
      success: false,
      error: 'Payment gateway declined the transaction'
    };
  }
};

/**
 * Create a Winston logger with service context
 * @param serviceName - Name of the service for logging context
 * @returns Configured Winston logger instance
 */
export const createLogger = (serviceName: string): winston.Logger => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ]
  });
};
