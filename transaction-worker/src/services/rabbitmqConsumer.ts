/**
 * RabbitMQ Consumer Service for Transaction Worker
 */

import amqp from 'amqplib';
import { TransactionHistoryModel } from '../models/TransactionHistory';
import { TransactionMessage } from '../types';
import { createLogger } from '../utils';

const logger = createLogger('TransactionWorker');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const TRANSACTION_QUEUE = 'transaction_queue';

class RabbitMQConsumer {
  private connection: any = null;
  private channel: any = null;
  private isConsuming = false;

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<void> {
    try {
      logger.info('Connecting to RabbitMQ...');
      
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      await this.setupQueue();
      this.connection.on('error', (error: any) => {
        logger.error('RabbitMQ connection error:', error);
        this.isConsuming = false;
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        this.isConsuming = false;
      });

      logger.info('Connected to RabbitMQ successfully');

    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Set up queue
   */
  private async setupQueue(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    await this.channel.assertQueue(TRANSACTION_QUEUE, {
      durable: true,
      exclusive: false,
      autoDelete: false
    });

    await this.channel.prefetch(1);

    logger.info('RabbitMQ queue set up successfully');
  }

  /**
   * Start consuming messages
   */
  async startConsuming(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    if (this.isConsuming) {
      logger.warn('Already consuming messages');
      return;
    }

    try {
      logger.info('Starting to consume transaction messages...');

      await this.channel.consume(TRANSACTION_QUEUE, async (msg: any) => {
        if (msg) {
          await this.processMessage(msg);
        }
      }, {
        noAck: false // Manual acknowledgment
      });

      this.isConsuming = true;
      logger.info('Started consuming transaction messages');

    } catch (error) {
      logger.error('Error starting message consumption:', error);
      throw error;
    }
  }

  /**
   * Process a single transaction message
   * @param msg - RabbitMQ message
   */
  private async processMessage(msg: any): Promise<void> {
    try {
      const messageContent = msg.content.toString();
      const rawData = JSON.parse(messageContent);

      logger.info(`Processing transaction message: ${rawData.transactionId}`);

      const transactionData: TransactionMessage = {
        ...rawData,
        timestamp: new Date(rawData.timestamp)
      };

      if (!this.validateTransactionMessage(transactionData)) {
        logger.error(`Invalid transaction message: ${(transactionData as any).transactionId}`);
        this.channel?.ack(msg);
        return;
      }
      const existingTransaction = await TransactionHistoryModel.findOne({ transactionId: transactionData.transactionId });
      if (existingTransaction) {
        logger.warn(`Transaction already exists: ${transactionData.transactionId}`);
        this.channel?.ack(msg);
        return;
      }

      const transactionHistory = new TransactionHistoryModel({
        transactionId: transactionData.transactionId,
        customerId: transactionData.customerId,
        orderId: transactionData.orderId,
        productId: transactionData.productId,
        amount: transactionData.amount,
        timestamp: new Date(transactionData.timestamp),
        status: 'completed'
      });

      await transactionHistory.save();

      logger.info(`Transaction history saved successfully: ${transactionData.transactionId}`);

      this.channel?.ack(msg);

    } catch (error) {
      logger.error('Error processing transaction message:', error);
      
      if (error instanceof Error && error.message.includes('productId: Path `productId` is required')) {
        logger.warn(`Skipping invalid message with empty productId`);
        this.channel?.ack(msg);
        return;
      }
      logger.error(`Rejecting message without requeue due to error: ${error}`);
      this.channel?.nack(msg, false, false);
    }
  }
  /**
   * Validate transaction message
   * @param data - Message data to validate
   * @returns True if valid, false otherwise
   */
  private validateTransactionMessage(data: any): data is TransactionMessage {
    if (data?.productId === '') {
      logger.warn(`Invalid message detected: productId is empty string`);
      return false;
    }

    return (
      data &&
      typeof data.transactionId === 'string' &&
      typeof data.customerId === 'string' &&
      typeof data.orderId === 'string' &&
      typeof data.productId === 'string' &&
      typeof data.amount === 'number' &&
      data.amount >= 0 &&
      data.transactionId.length > 0 &&
      data.customerId.length > 0 &&
      data.orderId.length > 0 &&
      data.productId.length > 0
    );
  }

  /**
   * Stop consuming messages
   */
  async stopConsuming(): Promise<void> {
    if (this.channel && this.isConsuming) {
      await this.channel.cancel(TRANSACTION_QUEUE);
      this.isConsuming = false;
      logger.info('Stopped consuming messages');
    }
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    try {
      await this.stopConsuming();
      
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
   * Check if connected and consuming
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null && this.isConsuming;
  }
}

export const rabbitMQConsumer = new RabbitMQConsumer();

