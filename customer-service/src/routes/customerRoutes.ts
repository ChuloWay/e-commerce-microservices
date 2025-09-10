/**
 * Customer routes definition
 */

import { Router } from 'express';
import {
  createCustomer,
  getCustomerById,
  getCustomerByEmail,
  getAllCustomers,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController';

const router = Router();

// Customer routes
router.post('/', createCustomer);
router.get('/', getAllCustomers);
router.get('/:customerId', getCustomerById);
router.get('/email/:email', getCustomerByEmail);
router.put('/:customerId', updateCustomer);
router.delete('/:customerId', deleteCustomer);

export default router;

