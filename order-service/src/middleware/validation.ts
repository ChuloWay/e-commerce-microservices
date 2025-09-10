/**
 * Validation middleware for order service
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createApiResponse } from '../utils';

// Order validation schemas
const createOrderSchema = Joi.object({
  customerId: Joi.string().required(),
  productId: Joi.string().required(),
  amount: Joi.number().min(0.01).required(),
  shippingAddress: Joi.object({
    street: Joi.string().max(200).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    zipCode: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional()
  }).optional()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').required()
});

// Validation middleware factory
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const response = createApiResponse(
        false,
        null,
        'Validation failed',
        error.details.map(detail => detail.message).join(', ')
      );
      return res.status(400).json(response);
    }
    
    next();
  };
};

// Export validation middlewares
export const validateCreateOrder = validate(createOrderSchema);
export const validateUpdateOrderStatus = validate(updateOrderStatusSchema);
