/**
 * Validation middleware for payment service
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createApiResponse } from '../utils';

const createPaymentSchema = Joi.object({
  customerId: Joi.string().required(),
  orderId: Joi.string().required(),
  productId: Joi.string().required(),
  amount: Joi.number().min(0.01).required(),
  paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery').default('bank_transfer')
});

/**
 * Validation middleware factory
 * @param schema - Joi validation schema
 * @returns Express middleware function
 */
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

export const validateCreatePayment = validate(createPaymentSchema);

