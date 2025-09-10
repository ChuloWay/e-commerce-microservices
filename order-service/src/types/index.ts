/**
 * Order Service Types
 * Only types and interfaces used by the Order Service
 */

// Base entity interface
export interface BaseEntity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Order related types
export interface Order extends BaseEntity {
  orderId: string;
  customerId: string;
  productId: string;
  amount: number;
  orderStatus: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderDate?: Date;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Order response type
export interface OrderResponse {
  orderId: string;
  customerId: string;
  productId: string;
  amount: number;
  orderStatus: OrderStatus;
  paymentStatus: string;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  customerId: string;
  productId: string;
  amount: number;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Customer and Product types for service communication
export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isActive: boolean;
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
  imageUrl?: string;
}

// Payment related types
export interface PaymentRequest {
  customerId: string;
  orderId: string;
  amount: number;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

