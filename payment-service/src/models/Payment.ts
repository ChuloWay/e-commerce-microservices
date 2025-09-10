/**
 * Payment model for MongoDB using Mongoose
 */

import mongoose, { Document, Schema } from 'mongoose';
import { Payment, PaymentStatus } from '../types';

// Payment document interface extending Mongoose Document
export interface PaymentDocument extends Omit<Payment, '_id'>, Document {}

// Payment schema definition
const paymentSchema = new Schema<PaymentDocument>({
  paymentId: {
    type: String,
    unique: true
  },
  customerId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v: number) {
        return v >= 0;
      },
      message: 'Amount must be a positive number'
    }
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
    default: 'bank_transfer'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ productId: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ paymentDate: -1 });

// Pre-save middleware to generate paymentId if not provided
paymentSchema.pre('save', function(next) {
  if (!this.paymentId) {
    this.paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Transform function to remove sensitive data and format response
paymentSchema.methods.toJSON = function() {
  const payment = this.toObject();
  delete payment.__v;
  return payment;
};


// Create and export the Payment model
export const PaymentModel = mongoose.model<PaymentDocument>('Payment', paymentSchema);

