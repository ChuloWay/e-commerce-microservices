/**
 * Order routes definition
 */

import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getOrdersByCustomer,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController';

const router = Router();

// Order routes
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/customer/:customerId', getOrdersByCustomer);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/status', updateOrderStatus);
router.patch('/:orderId/cancel', cancelOrder);

export default router;

