/**
 * Product routes definition
 */

import { Router } from 'express';
import {
  createProduct,
  getProductById,
  getAllProducts,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  updateProductStock
} from '../controllers/productController';

const router = Router();

// Product routes
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:productId', getProductById);
router.put('/:productId', updateProduct);
router.patch('/:productId/stock', updateProductStock);
router.delete('/:productId', deleteProduct);

export default router;

