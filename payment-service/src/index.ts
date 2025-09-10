/**
 * Payment Service Entry Point
 * 
 * This is the main entry point for the Payment microservice.
 * It handles payment processing operations including:
 * - Payment processing and validation
 * - Transaction publishing to RabbitMQ
 * - Payment status management
 * - Integration with external payment gateways (simulated)
 */

import app from './app';
import { connectDatabase } from './config/database';
import { rabbitMQService } from './services/rabbitmqService';
import { createLogger } from './utils';

const logger = createLogger('PaymentService');

// Get port from environment or use default
const PORT = process.env.PORT || 3004;

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Connect to RabbitMQ
    await rabbitMQService.connect();
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Payment service is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API endpoints: http://localhost:${PORT}/api/payments`);
      logger.info(`RabbitMQ URL: ${process.env.RABBITMQ_URL || 'amqp://localhost:5672'}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await rabbitMQService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await rabbitMQService.close();
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

