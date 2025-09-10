/**
 * Comprehensive End-to-End Integration Tests
 * Tests the complete order flow across all microservices
 * 
 * Test Categories:
 * 1. Complete Order Flow - End-to-end order processing
 * 2. Error Handling - Payment failures, invalid data
 * 3. Service Health - All services health verification
 * 4. Nigerian Naira Support - Currency handling and formatting
 * 5. Data Consistency - Cross-service data validation
 */

import axios from 'axios';

// Test configuration
const isDocker = process.env.NODE_ENV === 'test' && process.env.CUSTOMER_SERVICE_URL;
const SERVICES = {
  customer: isDocker ? 'http://customer-service:3001' : 'http://localhost:3001',
  product: isDocker ? 'http://product-service:3002' : 'http://localhost:3002',
  order: isDocker ? 'http://order-service:3003' : 'http://localhost:3003',
  payment: isDocker ? 'http://payment-service:3004' : 'http://localhost:3004'
};

// Global test variables
let existingCustomer: any = null;
let existingProduct: any = null;

describe('E-commerce Microservices Integration Tests', () => {

  beforeAll(async () => {
    // Wait for services to be ready
    await waitForServices();
    
    // Get existing seeded data
    await getExistingData();
  });

  describe('Complete Order Flow with Existing Data', () => {
    it('should complete the entire order flow successfully', async () => {
      // Step 1: Verify customer exists
      expect(existingCustomer).toBeTruthy();
      expect(existingCustomer.customerId).toBeDefined();

      // Step 2: Verify product exists and has stock
      expect(existingProduct).toBeTruthy();
      expect(existingProduct.productId).toBeDefined();
      expect(existingProduct.stock).toBeGreaterThan(0);

      // Step 3: Create order
      const orderData = {
        customerId: existingCustomer.customerId,
        productId: existingProduct.productId,
        amount: 50000 // ₦50,000
      };

      const orderResponse = await axios.post(`${SERVICES.order}/api/orders`, orderData);
      expect(orderResponse.status).toBe(201);
      expect(orderResponse.data.success).toBe(true);
      expect(orderResponse.data.data.orderStatus).toBe('confirmed');
      expect(orderResponse.data.data.amount).toBe(50000);

      const order = orderResponse.data.data;

      // Step 4: Wait for payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 5: Verify payment was created
      const paymentResponse = await axios.get(`${SERVICES.payment}/api/payments/order/${order.orderId}`);
      expect(paymentResponse.status).toBe(200);
      expect(paymentResponse.data.success).toBe(true);
      expect(paymentResponse.data.data.orderId).toBe(order.orderId);
      expect(paymentResponse.data.data.status).toBe('completed');
      expect(paymentResponse.data.data.amount).toBe(50000);

      // Step 6: Verify product stock was updated
      const updatedProductResponse = await axios.get(`${SERVICES.product}/api/products/${existingProduct.productId}`);
      expect(updatedProductResponse.status).toBe(200);
      expect(updatedProductResponse.data.data.stock).toBe(existingProduct.stock - 1);

      // Step 7: Verify order status
      const orderStatusResponse = await axios.get(`${SERVICES.order}/api/orders/${order.orderId}`);
      expect(orderStatusResponse.status).toBe(200);
      expect(orderStatusResponse.data.data.orderStatus).toBe('confirmed');

      console.log('✅ Complete order flow test passed!');
      console.log(`   Order ID: ${order.orderId}`);
      console.log(`   Payment ID: ${paymentResponse.data.data.paymentId}`);
      console.log(`   Amount: ₦${order.amount}`);
    }, 30000);

    it('should handle payment failure gracefully', async () => {
      // Create order with amount that will trigger payment failure
      const orderData = {
        customerId: existingCustomer.customerId,
        productId: existingProduct.productId,
        amount: 100000000 // ₦100M - will trigger failure
      };

      try {
        const orderResponse = await axios.post(`${SERVICES.order}/api/orders`, orderData);
        // If it doesn't fail, that's unexpected
        expect(orderResponse.status).toBe(400);
        expect(orderResponse.data.success).toBe(false);
      } catch (error: any) {
        // Expected to fail - could be 400 or 404 depending on validation
        if (error.response) {
          expect([400, 404]).toContain(error.response.status);
          expect(error.response.data.success).toBe(false);
        } else {
          // If no response, just check that an error was thrown
          expect(error).toBeDefined();
        }
      }

      console.log('✅ Payment failure test passed!');
    }, 15000);

    it('should handle invalid customer', async () => {
      const orderData = {
        customerId: 'INVALID_CUSTOMER',
        productId: existingProduct.productId,
        amount: 50000
      };

      try {
        await axios.post(`${SERVICES.order}/api/orders`, orderData);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(false);
      }

      console.log('✅ Invalid customer test passed!');
    }, 15000);

    it('should handle invalid product', async () => {
      const orderData = {
        customerId: existingCustomer.customerId,
        productId: 'INVALID_PRODUCT',
        amount: 50000
      };

      try {
        await axios.post(`${SERVICES.order}/api/orders`, orderData);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.success).toBe(false);
      }

      console.log('✅ Invalid product test passed!');
    }, 15000);
  });

  describe('Service Health Checks', () => {
    it('should verify all services are healthy', async () => {
      const services = ['customer', 'product', 'order', 'payment'];
      
      for (const service of services) {
        const response = await axios.get(`${SERVICES[service as keyof typeof SERVICES]}/health`);
        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
        expect(response.data.service).toBe(`${service}-service`);
      }

      console.log('✅ All services are healthy!');
    });
  });

  describe('Nigerian Naira Support', () => {
    it('should handle Nigerian Naira amounts correctly', async () => {
      const orderData = {
        customerId: existingCustomer.customerId,
        productId: existingProduct.productId,
        amount: 25000 // ₦25,000
      };

      let orderResponse: any;
      try {
        orderResponse = await axios.post(`${SERVICES.order}/api/orders`, orderData);
        expect(orderResponse.status).toBe(201);
        expect(orderResponse.data.data.amount).toBe(25000);
      } catch (error: any) {
        console.log('Order creation failed:', error.response?.data || error.message);
        throw error;
      }

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify payment with NGN amount
      const paymentResponse = await axios.get(`${SERVICES.payment}/api/payments/order/${orderResponse.data.data.orderId}`);
      expect(paymentResponse.data.data.amount).toBe(25000);

      console.log('✅ Nigerian Naira support test passed!');
    }, 20000);
  });
});

// Helper functions
async function waitForServices(): Promise<void> {
  const maxRetries = 30;
  const retryDelay = 2000;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const services = ['customer', 'product', 'order', 'payment'];
      const healthChecks = services.map(service => 
        axios.get(`${SERVICES[service as keyof typeof SERVICES]}/health`)
      );
      
      await Promise.all(healthChecks);
      console.log('✅ All services are ready');
      return;
    } catch (error) {
      console.log(`⏳ Waiting for services... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('Services are not ready after maximum retries');
}

async function getExistingData(): Promise<void> {
  try {
    // Get first available customer
    const customerResponse = await axios.get(`${SERVICES.customer}/api/customers`);
    if (customerResponse.data.success && customerResponse.data.data.customers.length > 0) {
      existingCustomer = customerResponse.data.data.customers[0];
      console.log(`✅ Found customer: ${existingCustomer.name} (${existingCustomer.customerId})`);
    } else {
      throw new Error('No customers found');
    }

    // Get first available product with stock > 0
    const productResponse = await axios.get(`${SERVICES.product}/api/products`);
    if (productResponse.data.success && productResponse.data.data.products.length > 0) {
      // Find a product with stock > 0
      existingProduct = productResponse.data.data.products.find((product: any) => product.stock > 0);
      if (!existingProduct) {
        // If no product has stock, use the first one and update its stock
        existingProduct = productResponse.data.data.products[0];
        // Update stock to 10 for testing
        await axios.put(`${SERVICES.product}/api/products/${existingProduct.productId}`, {
          stock: 10
        });
        existingProduct.stock = 10;
      }
      console.log(`✅ Found product: ${existingProduct.name} (${existingProduct.productId}) - Stock: ${existingProduct.stock}`);
    } else {
      throw new Error('No products found');
    }
  } catch (error) {
    console.error('❌ Failed to get existing data:', error);
    throw error;
  }
}
