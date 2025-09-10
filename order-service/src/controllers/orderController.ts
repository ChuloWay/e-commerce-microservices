/**
 * Order controller handling HTTP requests and responses
 */

import { Request, Response } from 'express';
import { OrderModel } from '../models/Order';
import { validateCustomer } from '../services/customerService';
import { validateProduct, updateProductStock } from '../services/productService';
import { processPayment } from '../services/paymentService';
import { 
  Order, 
  CreateOrderRequest, 
  ApiResponse, 
  ValidationResult,
  OrderStatus,
  OrderResponse
} from '../types';
import { 
  createApiResponse, 
  validateRequiredFields,
  sanitizeString,
  createLogger 
} from '../utils';

const logger = createLogger('OrderService');

/**
 * Create a new order
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData: CreateOrderRequest = req.body;
    
    // Validate required fields
    const validation = validateRequiredFields(orderData, ['customerId', 'productId', 'amount']);
    if (!validation.isValid) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Validation failed',
        validation.errors.map(e => e.message).join(', ')
      );
      res.status(400).json(response);
      return;
    }

    // Validate amount
    if (orderData.amount <= 0) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Amount must be a positive number'
      );
      res.status(400).json(response);
      return;
    }

    logger.info(`Creating order for customer: ${orderData.customerId}, product: ${orderData.productId}`);

    // Step 1: Validate customer exists and is active
    const customerValidation = await validateCustomer(orderData.customerId);
    if (!customerValidation.success) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Customer validation failed',
        customerValidation.error
      );
      res.status(customerValidation.statusCode || 400).json(response);
      return;
    }

    // Step 2: Validate product exists and is available
    const productValidation = await validateProduct(orderData.productId, 1);
    if (!productValidation.success) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Product validation failed',
        productValidation.error
      );
      res.status(productValidation.statusCode || 400).json(response);
      return;
    }

    // Step 3: Create order with pending status
    const sanitizedData = {
      ...orderData,
      orderStatus: OrderStatus.PENDING,
      orderDate: new Date()
    };

    const order = new OrderModel(sanitizedData);
    const savedOrder = await order.save();

    logger.info(`Order created successfully: ${savedOrder.orderId}`);

    // Step 4: Process payment
    const paymentResult = await processPayment(
      orderData.customerId,
      savedOrder.orderId,
      orderData.productId,
      orderData.amount
    );

    if (!paymentResult.success) {
      // Payment failed - update order status to cancelled
      savedOrder.orderStatus = OrderStatus.CANCELLED;
      await savedOrder.save();
      
      logger.error(`Payment failed for order: ${savedOrder.orderId}`);
      
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Payment processing failed',
        paymentResult.error
      );
      res.status(paymentResult.statusCode || 400).json(response);
      return;
    }

    // Step 5: Payment successful - update order status to confirmed
    savedOrder.orderStatus = OrderStatus.CONFIRMED;
    await savedOrder.save();

    // Step 6: Update product stock
    const stockUpdateResult = await updateProductStock(orderData.productId, 1);
    if (!stockUpdateResult.success) {
      logger.warn(`Failed to update product stock for order: ${savedOrder.orderId}`);
      // Note: In a real system, you might want to implement compensation logic here
    }

    // Step 7: Prepare response
    const orderResponse: OrderResponse = {
      customerId: savedOrder.customerId,
      orderId: savedOrder.orderId,
      productId: savedOrder.productId,
      orderStatus: savedOrder.orderStatus,
      amount: savedOrder.amount,
      paymentStatus: savedOrder.paymentStatus,
      orderDate: savedOrder.createdAt || new Date(),
      createdAt: savedOrder.createdAt || new Date(),
      updatedAt: savedOrder.updatedAt || new Date()
    };

    logger.info(`Order processing completed successfully: ${savedOrder.orderId}`);

    const response: ApiResponse<OrderResponse> = createApiResponse(
      true,
      orderResponse,
      'Order created and payment processed successfully'
    );
    res.status(201).json(response);

  } catch (error) {
    logger.error('Error creating order:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to create order'
    );
    res.status(500).json(response);
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Order not found'
      );
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<any> = createApiResponse(
      true,
      order.toJSON(),
      'Order retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving order:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve order'
    );
    res.status(500).json(response);
  }
};

/**
 * Get orders by customer ID
 */
export const getOrdersByCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      OrderModel.find({ customerId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      OrderModel.countDocuments({ customerId })
    ]);

    const response: ApiResponse = createApiResponse(
      true,
      {
        orders: orders.map((order: any) => order.toJSON()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      'Orders retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving orders by customer:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve orders'
    );
    res.status(500).json(response);
  }
};

/**
 * Get all orders with pagination and filtering
 */
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    // Build query
    let query: any = {};
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      query.orderStatus = status;
    }

    const [orders, total] = await Promise.all([
      OrderModel.find(query).skip(skip).limit(limit).sort({ orderDate: -1 }),
      OrderModel.countDocuments(query)
    ]);

    const response: ApiResponse = createApiResponse(
      true,
      {
        orders: orders.map((order: any) => order.toJSON()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      'Orders retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving orders:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve orders'
    );
    res.status(500).json(response);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Invalid order status'
      );
      res.status(400).json(response);
      return;
    }

    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Order not found'
      );
      res.status(404).json(response);
      return;
    }

    // Update order status directly
    order.orderStatus = status;
    const statusUpdated = true;
    if (!statusUpdated) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Invalid status transition'
      );
      res.status(400).json(response);
      return;
    }

    await order.save();

    logger.info(`Order status updated: ${orderId} -> ${status}`);

    const response: ApiResponse<any> = createApiResponse(
      true,
      order.toJSON(),
      'Order status updated successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error updating order status:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to update order status'
    );
    res.status(500).json(response);
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await OrderModel.findOne({ orderId });
    if (!order) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Order not found'
      );
      res.status(404).json(response);
      return;
    }

    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.orderStatus)) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Order cannot be cancelled at this stage'
      );
      res.status(400).json(response);
      return;
    }

    order.orderStatus = OrderStatus.CANCELLED;
    await order.save();

    logger.info(`Order cancelled: ${orderId}`);

    const response: ApiResponse<any> = createApiResponse(
      true,
      order.toJSON(),
      'Order cancelled successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error cancelling order:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to cancel order'
    );
    res.status(500).json(response);
  }
};
