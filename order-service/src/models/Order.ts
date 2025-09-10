/**
 * Order model for MongoDB using Mongoose
 */

import mongoose, { Document, Schema } from 'mongoose';
import { Order, OrderStatus } from '../types';

// Order document interface extending Mongoose Document
export interface OrderDocument extends Omit<Order, '_id'>, Document {}

// Order schema definition
const orderSchema = new Schema<OrderDocument>({
  orderId: {
    type: String,
    unique: true
  },
  customerId: {
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
  orderStatus: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
    required: true
  },
  shippingAddress: {
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
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ productId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });

// Pre-save middleware to generate orderId if not provided
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Transform function to remove sensitive data and format response
orderSchema.methods.toJSON = function() {
  const order = this.toObject();
  delete order.__v;
  return order;
};


// Create and export the Order model
export const OrderModel = mongoose.model<OrderDocument>('Order', orderSchema);
