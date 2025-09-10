/**
 * Order Service Entry Point
 * 
 * This is the main entry point for the Order microservice.
 * It handles order management operations including:
 * - Order creation and processing
 * - Integration with Customer, Product, and Payment services
 * - Order status management
 * - Order history and tracking
 */

import app from './app';
import { connectDatabase } from './config/database';
import { createLogger } from './utils';

const logger = createLogger('OrderService');

// Get port from environment or use default
const PORT = process.env.PORT || 3003;

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Order service is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API endpoints: http://localhost:${PORT}/api/orders`);
      logger.info(`Customer service URL: ${process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3001'}`);
      logger.info(`Product service URL: ${process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002'}`);
      logger.info(`Payment service URL: ${process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004'}`);
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
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();
