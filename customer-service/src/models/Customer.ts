/**
 * Customer model for MongoDB using Mongoose
 */

import mongoose, { Document, Schema } from 'mongoose';
import { Customer } from '../types';

// Customer document interface extending Mongoose Document
export interface CustomerDocument extends Omit<Customer, '_id'>, Document {}

// Customer schema definition
const customerSchema = new Schema<CustomerDocument>({
  customerId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: 200
    },
    city: {
      type: String,
      trim: true,
      maxlength: 100
    },
    state: {
      type: String,
      trim: true,
      maxlength: 100
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: 20
    },
    country: {
      type: String,
      trim: true,
      maxlength: 100
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
customerSchema.index({ customerId: 1 });
customerSchema.index({ isActive: 1 });

// Pre-save middleware to generate customerId if not provided
customerSchema.pre('save', function(next) {
  if (!this.customerId) {
    this.customerId = `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Transform function to remove sensitive data and format response
customerSchema.methods.toJSON = function() {
  const customer = this.toObject();
  delete customer.__v;
  return customer;
};

// Static method to find active customers
customerSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find customer by email
customerSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

// Static method to find customer by customerId
customerSchema.statics.findByCustomerId = function(customerId: string) {
  return this.findOne({ customerId, isActive: true });
};

// Create and export the Customer model
export const CustomerModel = mongoose.model<CustomerDocument>('Customer', customerSchema);
