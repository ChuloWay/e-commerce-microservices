/**
 * Transaction History model for MongoDB using Mongoose
 */

import mongoose, { Document, Schema } from 'mongoose';
import { TransactionHistory } from '../types';

// Transaction History document interface extending Mongoose Document
export interface TransactionHistoryDocument extends Omit<TransactionHistory, '_id'>, Document {}

// Transaction History schema definition
const transactionHistorySchema = new Schema<TransactionHistoryDocument>({
  transactionId: {
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
    required: true,
    enum: ['completed', 'failed', 'pending', 'refunded'],
    default: 'completed'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
transactionHistorySchema.index({ customerId: 1 });
transactionHistorySchema.index({ orderId: 1 });
transactionHistorySchema.index({ productId: 1 });
transactionHistorySchema.index({ paymentId: 1 });
transactionHistorySchema.index({ transactionDate: -1 });
transactionHistorySchema.index({ status: 1 });

// Transform function to remove sensitive data and format response
transactionHistorySchema.methods.toJSON = function() {
  const transaction = this.toObject();
  delete transaction.__v;
  return transaction;
};

// Static method to find transactions by customer
transactionHistorySchema.statics.findByCustomer = function(customerId: string) {
  return this.find({ customerId }).sort({ transactionDate: -1 });
};

// Static method to find transaction by transactionId
transactionHistorySchema.statics.findByTransactionId = function(transactionId: string) {
  return this.findOne({ transactionId });
};

// Static method to find transactions by orderId
transactionHistorySchema.statics.findByOrderId = function(orderId: string) {
  return this.find({ orderId }).sort({ transactionDate: -1 });
};

// Static method to find transactions by status
transactionHistorySchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ transactionDate: -1 });
};

// Create and export the TransactionHistory model
export const TransactionHistoryModel = mongoose.model<TransactionHistoryDocument>('TransactionHistory', transactionHistorySchema);

