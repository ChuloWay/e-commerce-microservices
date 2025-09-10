/**
 * Database Seeding Utilities
 */

import winston from 'winston';

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
