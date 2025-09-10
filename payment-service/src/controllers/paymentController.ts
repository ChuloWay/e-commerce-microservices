/**
 * Payment controller handling HTTP requests and responses
 */

import { Request, Response } from 'express';
import { PaymentModel } from '../models/Payment';
import { rabbitMQService } from '../services/rabbitmqService';
import { 
  Payment, 
  PaymentRequest, 
  PaymentResponse, 
  ApiResponse, 
  TransactionMessage,
  ValidationResult,
  PaymentStatus
} from '../types';
import { 
  createApiResponse, 
  validateRequiredFields,
  generateId,
  createLogger 
} from '../utils';

const logger = createLogger('PaymentService');

/**
 * Process payment for an order
 */
export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const paymentData: PaymentRequest = req.body;

    logger.info(`Processing payment for order: ${paymentData.orderId} (amount: ₦${paymentData.amount})`);

    // Create payment record
    const payment = new PaymentModel({
      ...paymentData,
      status: PaymentStatus.PENDING,
      paymentDate: new Date()
    });

    const savedPayment = await payment.save();
    logger.info(`Payment record created: ${savedPayment.paymentId}`);

    // Simulate payment processing (in a real system, this would integrate with payment gateways)
    const processingResult = await simulatePaymentProcessing(savedPayment);

    if (processingResult.success) {
      // Update payment status to completed
      savedPayment.status = PaymentStatus.COMPLETED;
      savedPayment.transactionId = processingResult.transactionId;
      await savedPayment.save();

      logger.info(`Payment completed successfully: ${savedPayment.paymentId}`);

      // Publish transaction message to RabbitMQ
      const transactionMessage: TransactionMessage = {
        customerId: savedPayment.customerId,
        orderId: savedPayment.orderId,
        productId: paymentData.productId,
        amount: savedPayment.amount,
        transactionId: processingResult.transactionId!,
        timestamp: new Date()
      };

      const messagePublished = await rabbitMQService.publishTransaction(transactionMessage);
      if (!messagePublished) {
        logger.warn(`Failed to publish transaction message for payment: ${savedPayment.paymentId}`);
      }


      // Prepare response
      const paymentResponse: PaymentResponse = {
        success: true,
        paymentId: savedPayment.paymentId,
        transactionId: savedPayment.transactionId,
        message: 'Payment processed successfully'
      };

      const response: ApiResponse<PaymentResponse> = createApiResponse(
        true,
        paymentResponse,
        'Payment processed successfully'
      );
      res.status(201).json(response);

    } else {
      // Payment failed
      savedPayment.status = PaymentStatus.FAILED;
      await savedPayment.save();

      logger.error(`Payment failed: ${savedPayment.paymentId} - ${processingResult.error}`);

      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Payment processing failed',
        processingResult.error
      );
      res.status(400).json(response);
    }

  } catch (error) {
    logger.error('Error processing payment:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to process payment'
    );
    res.status(500).json(response);
  }
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;

    const payment = await PaymentModel.findOne({ paymentId });
    if (!payment) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Payment not found'
      );
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<any> = createApiResponse(
      true,
      payment.toJSON(),
      'Payment retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving payment:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve payment'
    );
    res.status(500).json(response);
  }
};

/**
 * Get payment by order ID
 */
export const getPaymentByOrderId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const payment = await PaymentModel.findOne({ orderId });
    if (!payment) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Payment not found for this order'
      );
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<any> = createApiResponse(
      true,
      payment.toJSON(),
      'Payment retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving payment by order ID:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve payment'
    );
    res.status(500).json(response);
  }
};

/**
 * Get payments by customer ID
 */
export const getPaymentsByCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      PaymentModel.find({ customerId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      PaymentModel.countDocuments({ customerId })
    ]);

    const response: ApiResponse = createApiResponse(
      true,
      {
        payments: payments.map((payment: any) => payment.toJSON()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      'Payments retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving payments by customer:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve payments'
    );
    res.status(500).json(response);
  }
};

/**
 * Get all payments with pagination and filtering
 */
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};
    if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      query.paymentStatus = status;
    }

    const [payments, total] = await Promise.all([
      PaymentModel.find(query).skip(skip).limit(limit).sort({ paymentDate: -1 }),
      PaymentModel.countDocuments(query)
    ]);

    const response: ApiResponse = createApiResponse(
      true,
      {
        payments: payments.map((payment: any) => payment.toJSON()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      'Payments retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving payments:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve payments'
    );
    res.status(500).json(response);
  }
};

/**
 * Simulate payment processing (for demonstration purposes)
 * 
 * This simulates real-world payment gateway behavior:
 * - 95% success rate (more realistic than 90%)
 * - Different failure reasons based on amount
 * - Processing delays that vary
 */
const simulatePaymentProcessing = async (payment: any): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  // Simulate processing delay (500ms - 2s)
  const delay = Math.random() * 1500 + 500;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Simulate random success/failure (95% success rate for demo)
  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    const transactionId = `TXN_${Date.now()}_${generateId()}`;
    return {
      success: true,
      transactionId
    };
  } else {
    // Simulate different failure reasons based on amount
    let errorMessage = 'Payment gateway declined the transaction';
    
    if (payment.amount > 100000000) {
      errorMessage = 'Transaction amount exceeds limit';
    } else if (payment.amount < 1) {
      errorMessage = 'Minimum transaction amount not met';
    } else if (Math.random() > 0.5) {
      errorMessage = 'Insufficient funds';
    } else {
      errorMessage = 'Card declined by issuer';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

