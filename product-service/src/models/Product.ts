/**
 * Product model for MongoDB using Mongoose
 */

import mongoose, { Document, Schema } from 'mongoose';
import { Product } from '../types';

// Product document interface extending Mongoose Document
export interface ProductDocument extends Omit<Product, '_id'>, Document {}

// Product schema definition
const productSchema = new Schema<ProductDocument>({
  productId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v: number) {
        return v >= 0;
      },
      message: 'Price must be a positive number'
    }
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    validate: {
      validator: function(v: number) {
        return v >= 0;
      },
      message: 'Stock must be a non-negative number'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Image URL must be a valid HTTP/HTTPS URL with image extension'
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
productSchema.index({ productId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Text search index

// Pre-save middleware to generate productId if not provided
productSchema.pre('save', function(next) {
  if (!this.productId) {
    this.productId = `PROD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Transform function to remove sensitive data and format response
productSchema.methods.toJSON = function() {
  const product = this.toObject();
  delete product.__v;
  return product;
};

// Static method to find active products
productSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find product by productId
productSchema.statics.findByProductId = function(productId: string) {
  return this.findOne({ productId, isActive: true });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isActive: true });
};

// Static method to find products in stock
productSchema.statics.findInStock = function() {
  return this.find({ isActive: true, stock: { $gt: 0 } });
};

// Static method to search products by text
productSchema.statics.searchProducts = function(searchTerm: string) {
  return this.find({
    isActive: true,
    $text: { $search: searchTerm }
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance method to check if product is available
productSchema.methods.isAvailable = function(quantity: number = 1): boolean {
  return this.stock >= quantity && this.isActive;
};

// Instance method to reduce stock
productSchema.methods.reduceStock = function(quantity: number): boolean {
  if (this.stock >= quantity) {
    this.stock -= quantity;
    return true;
  }
  return false;
};

// Instance method to increase stock
productSchema.methods.increaseStock = function(quantity: number): void {
  this.stock += quantity;
};

// Create and export the Product model
export const ProductModel = mongoose.model<ProductDocument>('Product', productSchema);
