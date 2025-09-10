/**
 * Product controller handling HTTP requests and responses
 */

import { Request, Response } from 'express';
import { ProductModel } from '../models/Product';
import { 
  Product, 
  CreateProductRequest, 
  ApiResponse, 
  ServiceResponse,
  ValidationResult 
} from '../types';
import { 
  createApiResponse, 
  createServiceResponse, 
  validateRequiredFields,
  sanitizeString,
  createLogger 
} from '../utils';

const logger = createLogger('ProductService');

/**
 * Create a new product
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData: CreateProductRequest = req.body;
    
    // Validate required fields
    const validation = validateRequiredFields(productData, ['name', 'description', 'price', 'category']);
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

    // Validate price
    if (productData.price < 0) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Price must be a positive number'
      );
      res.status(400).json(response);
      return;
    }

    // Validate stock
    if (productData.stock < 0) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Stock must be a non-negative number'
      );
      res.status(400).json(response);
      return;
    }

    // Sanitize input data
    const sanitizedData = {
      ...productData,
      name: sanitizeString(productData.name),
      description: sanitizeString(productData.description),
      category: sanitizeString(productData.category)
    };

    // Create new product
    const product = new ProductModel(sanitizedData);
    const savedProduct = await product.save();

    logger.info(`Product created successfully: ${savedProduct.productId}`);

    const response: ApiResponse<any> = createApiResponse(
      true,
      savedProduct.toJSON(),
      'Product created successfully'
    );
    res.status(201).json(response);

  } catch (error) {
    logger.error('Error creating product:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to create product'
    );
    res.status(500).json(response);
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findOne({ productId, isActive: true });
    if (!product) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Product not found'
      );
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<any> = createApiResponse(
      true,
      product.toJSON(),
      'Product retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving product:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve product'
    );
    res.status(500).json(response);
  }
};

/**
 * Get all products with pagination and filtering
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const inStock = req.query.inStock === 'true';
    const skip = (page - 1) * limit;

    // Build query
    let query: any = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (inStock) {
      query.stock = { $gt: 0 };
    }

    let products;
    let total;

    if (search) {
      // Text search
      products = await ProductModel.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { category: { $regex: search, $options: 'i' } }
            ]
          }
        ]
      }).skip(skip).limit(limit).sort({ createdAt: -1 });
      total = await ProductModel.countDocuments({
        isActive: true,
        $text: { $search: search }
      });
    } else {
      // Regular query
      [products, total] = await Promise.all([
        ProductModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
        ProductModel.countDocuments(query)
      ]);
    }

    const response: ApiResponse = createApiResponse(
      true,
      {
        products: products.map((product: any) => product.toJSON()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      'Products retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving products:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve products'
    );
    res.status(500).json(response);
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      ProductModel.find({ category, isActive: true }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      ProductModel.countDocuments({ category, isActive: true })
    ]);

    const response: ApiResponse = createApiResponse(
      true,
      {
        products: products.map((product: any) => product.toJSON()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      },
      'Products retrieved successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error retrieving products by category:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to retrieve products'
    );
    res.status(500).json(response);
  }
};

/**
 * Update product
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    // Validate price if provided
    if (updateData.price !== undefined && updateData.price < 0) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Price must be a positive number'
      );
      res.status(400).json(response);
      return;
    }

    // Validate stock if provided
    if (updateData.stock !== undefined && updateData.stock < 0) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Stock must be a non-negative number'
      );
      res.status(400).json(response);
      return;
    }

    // Sanitize input data
    const sanitizedData = { ...updateData };
    if (sanitizedData.name) sanitizedData.name = sanitizeString(sanitizedData.name);
    if (sanitizedData.description) sanitizedData.description = sanitizeString(sanitizedData.description);
    if (sanitizedData.category) sanitizedData.category = sanitizeString(sanitizedData.category);

    const product = await ProductModel.findOneAndUpdate(
      { productId, isActive: true },
      sanitizedData,
      { new: true, runValidators: true }
    );

    if (!product) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Product not found'
      );
      res.status(404).json(response);
      return;
    }

    logger.info(`Product updated successfully: ${product.productId}`);

    const response: ApiResponse<any> = createApiResponse(
      true,
      product.toJSON(),
      'Product updated successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error updating product:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to update product'
    );
    res.status(500).json(response);
  }
};

/**
 * Delete product (soft delete)
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await ProductModel.findOneAndUpdate(
      { productId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Product not found'
      );
      res.status(404).json(response);
      return;
    }

    logger.info(`Product deleted successfully: ${product.productId}`);

    const response: ApiResponse = createApiResponse(
      true,
      null,
      'Product deleted successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error deleting product:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to delete product'
    );
    res.status(500).json(response);
  }
};

/**
 * Update product stock
 */
export const updateProductStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity, operation } = req.body; // operation: 'increase' or 'decrease'

    if (!quantity || quantity <= 0) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Quantity must be a positive number'
      );
      res.status(400).json(response);
      return;
    }

    const product = await ProductModel.findOne({ productId, isActive: true });
    if (!product) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Product not found'
      );
      res.status(404).json(response);
      return;
    }

    if (operation === 'decrease' && product.stock < quantity) {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Insufficient stock'
      );
      res.status(400).json(response);
      return;
    }

    if (operation === 'decrease') {
      product.stock -= quantity;
    } else if (operation === 'increase') {
      product.stock += quantity;
    } else {
      const response: ApiResponse = createApiResponse(
        false,
        null,
        'Invalid operation. Use "increase" or "decrease"'
      );
      res.status(400).json(response);
      return;
    }

    await product.save();

    logger.info(`Product stock updated: ${product.productId} - ${operation} ${quantity}`);

    const response: ApiResponse<any> = createApiResponse(
      true,
      product.toJSON(),
      'Product stock updated successfully'
    );
    res.json(response);

  } catch (error) {
    logger.error('Error updating product stock:', error);
    const response: ApiResponse = createApiResponse(
      false,
      null,
      'Internal server error',
      'Failed to update product stock'
    );
    res.status(500).json(response);
  }
};

/**
 * Validate product exists and is available (for internal service communication)
 */
export const validateProduct = async (productId: string, quantity: number = 1): Promise<ServiceResponse<any>> => {
  try {
    const product = await ProductModel.findOne({ productId, isActive: true });
    
    if (!product) {
      return createServiceResponse(
        false,
        undefined,
        'Product not found',
        404
      );
    }

    if (product.stock < quantity) {
      return createServiceResponse(
        false,
        undefined,
        'Product not available or insufficient stock',
        400
      );
    }

    return createServiceResponse(
      true,
      product.toJSON() as any,
      undefined,
      200
    );

  } catch (error) {
    logger.error('Error validating product:', error);
    return createServiceResponse(
      false,
      undefined,
      'Internal server error',
      500
    );
  }
};
