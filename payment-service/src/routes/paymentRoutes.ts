/**
 * Payment routes definition
 */

import { Router } from 'express';
import {
  processPayment,
  getPaymentById,
  getPaymentByOrderId,
  getPaymentsByCustomer,
  getAllPayments
} from '../controllers/paymentController';
import { validateCreatePayment } from '../middleware/validation';

const router = Router();

// Payment routes
router.post('/', validateCreatePayment, processPayment);
router.get('/', getAllPayments);
router.get('/customer/:customerId', getPaymentsByCustomer);
router.get('/order/:orderId', getPaymentByOrderId);
router.get('/:paymentId', getPaymentById);

export default router;

