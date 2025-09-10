/**
 * Transaction Worker Types
 * Only types and interfaces used by the Transaction Worker
 */

// Base entity interface
export interface BaseEntity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Transaction History related types
export interface TransactionHistory extends BaseEntity {
  transactionId: string;
  customerId: string;
  orderId: string;
  productId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  paymentMethod?: string;
  gatewayResponse?: any;
  failureReason?: string;
}

// RabbitMQ message types
export interface TransactionMessage {
  customerId: string;
  orderId: string;
  productId: string;
  amount: number;
  transactionId: string;
  timestamp: Date;
}

// Service communication types (for internal use)
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
