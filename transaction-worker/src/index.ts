/**
 * Transaction Worker Entry Point
 * 
 * This is the main entry point for the Transaction Worker.
 * It handles transaction history operations including:
 * - Consuming transaction messages from RabbitMQ
 * - Storing transaction history in MongoDB
 * - Processing payment events asynchronously
 */

import { connectDatabase } from './config/database';
import { rabbitMQConsumer } from './services/rabbitmqConsumer';
import { createLogger } from './utils';

const logger = createLogger('TransactionWorker');

/**
 * Start the transaction worker
 */
const startWorker = async (): Promise<void> => {
  try {
    logger.info('Starting Transaction Worker...');

    // Connect to database
    await connectDatabase();
    
    // Connect to RabbitMQ
    await rabbitMQConsumer.connect();
    
    // Start consuming messages
    await rabbitMQConsumer.startConsuming();
    
    logger.info('Transaction Worker started successfully');
    logger.info(`RabbitMQ URL: ${process.env.RABBITMQ_URL || 'amqp://localhost:5672'}`);
    logger.info(`MongoDB URI: ${process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce_transactions'}`);

  } catch (error) {
    logger.error('Failed to start Transaction Worker:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await rabbitMQConsumer.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await rabbitMQConsumer.close();
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

// Start the worker
startWorker();

