/**
 * Customer Service Entry Point
 * 
 * This is the main entry point for the Customer microservice.
 * It handles customer management operations including:
 * - Customer registration and authentication
 * - Customer profile management
 * - Customer validation for orders
 */

import app from './app';
import { connectDatabase } from './config/database';
import { createLogger } from './utils';

const logger = createLogger('CustomerService');

// Get port from environment or use default
const PORT = process.env.PORT || 3001;

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Customer service is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API endpoints: http://localhost:${PORT}/api/customers`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise);
  logger.error('Reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
