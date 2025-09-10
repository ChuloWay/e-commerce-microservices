/**
 * Validation middleware for product service
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createApiResponse } from '../utils';

// Product validation schemas
const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(10).max(1000).required(),
  price: Joi.number().min(0).required(),
  category: Joi.string().min(2).max(100).required(),
  stock: Joi.number().min(0).default(0),
  imageUrl: Joi.string().uri().optional()
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().min(2).max(100).optional(),
  stock: Joi.number().min(0).optional(),
  imageUrl: Joi.string().uri().optional()
});

const updateStockSchema = Joi.object({
  quantity: Joi.number().min(1).required(),
  operation: Joi.string().valid('increase', 'decrease').required()
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
export const validateCreateProduct = validate(createProductSchema);
export const validateUpdateProduct = validate(updateProductSchema);
export const validateUpdateStock = validate(updateStockSchema);
