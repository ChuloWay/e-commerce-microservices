/**
 * Transaction Worker Utilities
 * Only utilities used by the Transaction Worker
 */

import { ServiceResponse, ValidationResult, ValidationError } from '../types';
import winston from 'winston';

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
 * Validate transaction amount
 */
export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 100000000; // Max ₦100M per transaction
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
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
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
