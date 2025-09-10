/**
 * Payment Service Types
 * Only types and interfaces used by the Payment Service
 */

// Base entity interface
export interface BaseEntity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

// Payment related types
export interface Payment extends BaseEntity {
  paymentId: string;
  customerId: string;
  orderId: string;
  productId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  transactionId?: string;
  gatewayResponse?: any;
  failureReason?: string;
}

export interface PaymentRequest {
  customerId: string;
  orderId: string;
  productId: string;
  amount: number;
  paymentMethod?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
  paymentId?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Service communication types (for internal use)
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
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

// Validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
