/**
 * Customer controller handling HTTP requests and responses
 */

import { Request, Response } from 'express';
import { CustomerModel } from '../models/Customer';
import { 
  Customer, 
  CreateCustomerRequest, 
  ApiResponse, 
  ServiceResponse,
  ValidationResult 
} from '../types';
import { 
  createApiResponse, 
  createServiceResponse, 
  validateRequiredFields,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  createLogger 
} from '../utils';

const logger = createLogger('CustomerService');

/**
 * Create a new customer
 */
export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerData: CreateCustomerRequest = req.body;
    
    // Validate required fields
    const validation = validateRequiredFields(customerData, ['name', 'email']);
    if (!validation.isValid) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Validation failed',
        validation.errors.map((e: any) => e.message).join(', ')
      );
      res.status(400).json(response);
      return;
    }

    // Validate email format
    if (!isValidEmail(customerData.email)) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Invalid email format'
      );
      res.status(400).json(response);
      return;
    }

    // Validate phone if provided
    if (customerData.phone && !isValidPhone(customerData.phone)) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Invalid phone number format'
      );
      res.status(400).json(response);
      return;
    }

    // Sanitize input data
    const sanitizedData = {
      ...customerData,
      name: sanitizeString(customerData.name),
      email: customerData.email.toLowerCase().trim(),
      phone: customerData.phone ? sanitizeString(customerData.phone) : undefined
    };

    // Check if customer already exists
    const existingCustomer = await CustomerModel.findOne({ email: sanitizedData.email, isActive: true });
    if (existingCustomer) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Customer with this email already exists'
      );
      res.status(409).json(response);
      return;
    }

    // Create new customer
    const customer = new CustomerModel(sanitizedData);
    const savedCustomer = await customer.save();

    logger.info(`Customer created successfully: ${savedCustomer.customerId}`);

    const response: ApiResponse<any> = createApiResponse(
      true,
      savedCustomer.toJSON(),
      'Customer created successfully'
    );
    res.status(201).json(response);

  } catch (error) {
    logger.error('Error creating customer:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to create customer'
    );
    res.status(500).json(response);
  }
};

/**
 * Get customer by ID
 */
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;

    const customer = await CustomerModel.findOne({ customerId, isActive: true });
    if (!customer) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Customer not found'
      );
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<any> = createApiResponse(
      true,
      customer.toJSON(),
      'Customer retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving customer:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve customer'
    );
    res.status(500).json(response);
  }
};

/**
 * Get customer by email
 */
export const getCustomerByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    if (!isValidEmail(email)) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Invalid email format'
      );
      res.status(400).json(response);
      return;
    }

    const customer = await CustomerModel.findOne({ email: email.toLowerCase(), isActive: true });
    if (!customer) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Customer not found'
      );
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<any> = createApiResponse(
      true,
      customer.toJSON(),
      'Customer retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving customer by email:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve customer'
    );
    res.status(500).json(response);
  }
};

/**
 * Get all customers with pagination
 */
export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      CustomerModel.find({ isActive: true }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      CustomerModel.countDocuments({ isActive: true })
    ]);

    const response: ApiResponse = createApiResponse(
      true,
      {
        customers: customers.map((customer: any) => customer.toJSON()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      'Customers retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving customers:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve customers'
    );
    res.status(500).json(response);
  }
};

/**
 * Update customer
 */
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const updateData = req.body;

    // Validate email format if provided
    if (updateData.email && !isValidEmail(updateData.email)) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Invalid email format'
      );
      res.status(400).json(response);
      return;
    }

    // Validate phone if provided
    if (updateData.phone && !isValidPhone(updateData.phone)) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Invalid phone number format'
      );
      res.status(400).json(response);
      return;
    }

    // Sanitize input data
    const sanitizedData = { ...updateData };
    if (sanitizedData.name) sanitizedData.name = sanitizeString(sanitizedData.name);
    if (sanitizedData.email) sanitizedData.email = sanitizedData.email.toLowerCase().trim();
    if (sanitizedData.phone) sanitizedData.phone = sanitizeString(sanitizedData.phone);

    const customer = await CustomerModel.findOneAndUpdate(
      { customerId, isActive: true },
      sanitizedData,
      { new: true, runValidators: true }
    );

    if (!customer) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Customer not found'
      );
      res.status(404).json(response);
      return;
    }

    logger.info(`Customer updated successfully: ${customer.customerId}`);

    const response: ApiResponse<any> = createApiResponse(
      true,
      customer.toJSON(),
      'Customer updated successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error updating customer:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to update customer'
    );
    res.status(500).json(response);
  }
};

/**
 * Delete customer (soft delete)
 */
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;

    const customer = await CustomerModel.findOneAndUpdate(
      { customerId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Customer not found'
      );
      res.status(404).json(response);
      return;
    }

    logger.info(`Customer deleted successfully: ${customer.customerId}`);

    const response: ApiResponse = createApiResponse(
      true,
      null,
      'Customer deleted successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error deleting customer:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to delete customer'
    );
    res.status(500).json(response);
  }
};

/**
 * Validate customer exists (for internal service communication)
 */
export const validateCustomer = async (customerId: string): Promise<ServiceResponse<Customer | null>> => {
  try {
    const customer = await CustomerModel.findOne({ customerId, isActive: true });
    
    if (!customer) {
      return createServiceResponse(
        false,
        null,
        'Customer not found',
        404
      );
    }

    return createServiceResponse(
      true,
      customer.toJSON() as any,
      undefined,
      200
    );

  } catch (error) {
    logger.error('Error validating customer:', error);
    return createServiceResponse(
      false,
      null,
      'Internal server error',
      500
    );
  }
};
