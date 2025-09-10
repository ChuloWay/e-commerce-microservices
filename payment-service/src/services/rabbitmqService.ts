/**
 * RabbitMQ Service for message publishing
 */

import amqp, { Connection, Channel } from 'amqplib';
import { TransactionMessage } from '../types';
import { createLogger } from '../utils';

const logger = createLogger('PaymentService');

// RabbitMQ configuration
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const TRANSACTION_QUEUE = 'transaction_queue';

class RabbitMQService {
  private connection: any = null;
  private channel: any = null;

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<void> {
    try {
      logger.info('Connecting to RabbitMQ...');
      
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Set up queues
      await this.setupQueues();

      // Handle connection events
      this.connection.on('error', (error: any) => {
        logger.error('RabbitMQ connection error:', error);
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
      });

      logger.info('Connected to RabbitMQ successfully');

    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Set up queues
   */
  private async setupQueues(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    // Transaction queue for transaction history
    await this.channel.assertQueue(TRANSACTION_QUEUE, {
      durable: true, // Queue survives broker restarts
      exclusive: false,
      autoDelete: false
    });

    logger.info('RabbitMQ queues set up successfully');
  }

  /**
   * Publish transaction message to queue
   */
  async publishTransaction(transactionData: TransactionMessage): Promise<boolean> {
    try {
      if (!this.channel) {
        throw new Error('Channel not initialized');
      }

      const message = JSON.stringify({
        ...transactionData,
        timestamp: new Date().toISOString()
      });

      logger.info(`DEBUG: Publishing transaction message: ${message}`);

      const published = this.channel.sendToQueue(
        TRANSACTION_QUEUE,
        Buffer.from(message),
        {
          persistent: true, // Message survives broker restarts
          messageId: transactionData.transactionId,
          correlationId: transactionData.orderId
        }
      );

      if (published) {
        logger.info(`Transaction message published: ${transactionData.transactionId}`);
        return true;
      } else {
        logger.warn(`Failed to publish transaction message: ${transactionData.transactionId}`);
        return false;
      }

    } catch (error) {
      logger.error('Error publishing transaction message:', error);
      return false;
    }
  }


  /**
   * Close connection
   */
  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection:', error);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

// Export singleton instance
export const rabbitMQService = new RabbitMQService();

