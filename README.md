# E-commerce Microservices Architecture

A comprehensive e-commerce microservices system built with Node.js, TypeScript, MongoDB, and RabbitMQ. This project demonstrates a clean, scalable architecture with proper separation of concerns and asynchronous communication patterns.

## 🏗️ Architecture Overview


### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │    │   Product       │    │   Order         │    │   Payment       │
│   Service       │    │   Service       │    │   Service       │    │   Service       │
│   (Port 3001)   │    │   (Port 3002)   │    │   (Port 3003)   │    │   (Port 3004)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   MongoDB       │    │   RabbitMQ      │
                    │   Database      │    │   Message Queue │
                    └─────────────────┘    └─────────────────┘
                                                       │
                                            ┌─────────────────┐
                                            │   Transaction   │
                                            │   Worker        │
                                            │   (Background)  │
                                            └─────────────────┘
```

### Service Responsibilities

#### 1. **Customer Service** (Port 3001)
- Customer registration and authentication
- Customer profile management
- Customer validation for orders
- Database: `ecommerce_customers`

#### 2. **Product Service** (Port 3002)
- Product catalog management
- Product availability checking
- Product pricing information
- Inventory management
- Database: `ecommerce_products`

#### 3. **Order Service** (Port 3003)
- Order creation and management
- Order status tracking
- Integration with Customer, Product, and Payment services
- Orchestrates the order flow
- Database: `ecommerce_orders`

#### 4. **Payment Service** (Port 3004)
- Payment processing (simplified for demo)
- Transaction publishing to RabbitMQ
- Payment status management
- Nigerian Naira (NGN) currency support
- Database: `ecommerce_payments`

#### 5. **Transaction Worker** (Background Service)
- Consumes messages from RabbitMQ
- Stores transaction history
- Handles payment events asynchronously
- Database: `ecommerce_transactions`

## 🧪 Testing

### 🚀 **3 Simple Test Commands**

```bash
# 1. Run tests locally (requires Node.js + services running)
npm test

# 2. Run tests in Docker (containerized environment)
npm run test:docker

# 3. Run CI tests (simulate GitHub Actions locally)
npm run test:ci
```

### Test Types Covered

- **Unit Tests**: Test individual services (Customer, Product, Order, Payment, Transaction Worker)
- **Integration Tests**: Test complete order flow across all services
- **End-to-End Tests**: Verify real order processing with actual API calls

### Prerequisites

**For Local Testing (`npm test`):**
```bash
# Start all services first
docker-compose up -d
```

**For Docker Testing (`npm run test:docker`):**
- No prerequisites needed! Everything runs in containers.

**For CI Testing (`npm run test:ci`):**
- No prerequisites needed! Simulates full CI/CD pipeline.

### What Tests Verify

✅ **Complete Order Flow**: Customer → Product → Order → Payment → Transaction  
✅ **Error Handling**: Payment failures, invalid data  
✅ **Nigerian Naira**: Currency formatting and validation  
✅ **Service Communication**: All services working together  
✅ **Database Updates**: Orders, payments, and transactions saved correctly

## 🚀 CI/CD Pipeline

### GitHub Actions
The project includes two GitHub Actions workflows:

#### 1. **Full CI/CD Pipeline** (`.github/workflows/ci.yml`)
- Runs on push to `main`/`develop` branches and pull requests
- Sets up MongoDB and RabbitMQ services
- Builds all microservices
- Starts services with Docker Compose
- Runs comprehensive test suite (unit + integration + e2e)
- Uploads test coverage reports

#### 2. **Quick Tests** (`.github/workflows/test-only.yml`)
- Runs on push to `main` branch and pull requests
- Fast unit tests only (no Docker services)
- Tests Payment Service and Transaction Worker (services with working tests)
- Perfect for quick feedback during development

### Local CI/CD Simulation
```bash
# Simulate full CI/CD pipeline locally
npm run test:ci
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (if running locally)
- RabbitMQ (if running locally)

### Environment Variables

**🎉 `.env` file is optional!** The application works out of the box with sensible defaults.

**For Docker Setup:** All environment variables are automatically configured in `docker-compose.yml`

**For Local Setup:** Services use fallback values:
- **MongoDB**: `mongodb://localhost:27017/ecommerce_[service]`
- **RabbitMQ**: `amqp://localhost:5672`
- **Ports**: 3001 (Customer), 3002 (Product), 3003 (Order), 3004 (Payment)
- **Currency**: Nigerian Naira (NGN) with Nigerian locale (en-NG)

**Optional:** Copy `.env.example` to `.env` only if you want to override defaults:
```bash
cp .env.example .env  # Only needed for custom configuration
```

### 🐳 **Option 1: Docker-Only Setup (Recommended)**

**Perfect for testing and development - no local Node.js installation required!**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-microservices
   ```

2. **Start all services with database seeding**
   ```bash
   # Start all services and seed the database automatically
   docker-compose --profile seeding up -d
   ```

3. **Wait for services to be ready**
   ```bash
   # Wait about 60 seconds for all services to start and seed
   sleep 60
   ```

4. **Verify everything is working**
   ```bash
   # Check service health
   curl http://localhost:3001/health  # Customer Service
   curl http://localhost:3002/health  # Product Service
   curl http://localhost:3003/health  # Order Service
   curl http://localhost:3004/health  # Payment Service
   
   # Check seeded data
   curl http://localhost:3001/api/customers  # Should return customers
   curl http://localhost:3002/api/products  # Should return products
   ```

5. **Run tests to verify everything works**
   ```bash
   npm run test:docker
   ```

### 🖥️ **Option 2: Local Development Setup**

**For developers who want to run services locally**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-microservices
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install service dependencies
   cd customer-service && npm install
   cd ../product-service && npm install
   cd ../order-service && npm install
   cd ../payment-service && npm install
   cd ../transaction-worker && npm install
   cd ../scripts && npm install
   cd ../integration-tests && npm install
   ```

3. **Start external services**
   ```bash
   # Start MongoDB and RabbitMQ
   docker-compose up -d mongodb rabbitmq
   ```

4. **Seed the database**
   ```bash
   # Wait for services to be ready
   sleep 30
   
   # Run database seeding
   cd scripts
   npm run seed
   cd ..
   ```

5. **Start microservices**
   ```bash
   # Start each service in a separate terminal
   cd customer-service && npm start
   cd product-service && npm start
   cd order-service && npm start
   cd payment-service && npm start
   cd transaction-worker && npm start
   ```

6. **Verify everything is working**
   ```bash
   # Run tests
   npm test
   ```

### 🔧 **Database Seeding**

The system requires initial data to function properly:

- **Customers**: Sample customer data for testing
- **Products**: Sample product catalog with pricing

**Automatic Seeding (Docker):**
- Seeding happens automatically when using `docker-compose --profile seeding up -d`
- The `seed-databases` service waits for all services to be ready, then seeds the database

**Manual Seeding (Local Development):**
```bash
cd scripts
npm run seed
```

**What gets seeded:**
- 10 sample customers with phone numbers
- 20 sample products with pricing
- All data is properly formatted for testing

## 📋 API Endpoints

### Customer Service (Port 3001)
- `POST /api/customers` - Create customer
- `GET /api/customers` - Get all customers
- `GET /api/customers/:customerId` - Get customer by ID
- `GET /api/customers/email/:email` - Get customer by email
- `PUT /api/customers/:customerId` - Update customer
- `DELETE /api/customers/:customerId` - Delete customer

### Product Service (Port 3002)
- `POST /api/products` - Create product
- `GET /api/products` - Get all products
- `GET /api/products/:productId` - Get product by ID
- `GET /api/products/category/:category` - Get products by category
- `PUT /api/products/:productId` - Update product
- `PATCH /api/products/:productId/stock` - Update product stock
- `DELETE /api/products/:productId` - Delete product

### Order Service (Port 3003)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId` - Get order by ID
- `GET /api/orders/customer/:customerId` - Get orders by customer
- `PATCH /api/orders/:orderId/status` - Update order status
- `PATCH /api/orders/:orderId/cancel` - Cancel order

### Payment Service (Port 3004)
- `POST /api/payments` - Process payment
- `GET /api/payments` - Get all payments
- `GET /api/payments/:paymentId` - Get payment by ID
- `GET /api/payments/order/:orderId` - Get payment by order ID
- `GET /api/payments/customer/:customerId` - Get payments by customer

## 🔄 Order Flow Example

Here's how the system processes an order:

1. **Customer places order** → Order Service
2. **Order Service validates customer** → Customer Service
3. **Order Service validates product** → Product Service
4. **Order Service processes payment** → Payment Service
5. **Payment Service publishes transaction** → RabbitMQ
6. **Transaction Worker consumes message** → Stores in database

### Example Order Request

```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST_1234567890_abc123",
    "productId": "PROD_1234567890_def456",
    "amount": 199.99,
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Message Queue**: RabbitMQ
- **Containerization**: Docker & Docker Compose
- **Validation**: Joi
- **HTTP Client**: Axios
- **Logging**: Winston logger utility



## 🔧 Configuration

### Environment Variables

Each service uses the following environment variables:

```bash
# Common
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/ecommerce_customers

# Message Queue
RABBITMQ_URL=amqp://localhost:5672

# Service URLs (for inter-service communication)
CUSTOMER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3004
```

## 🧪 Testing

### Manual Testing with cURL

1. **Create a customer**
   ```bash
   curl -X POST http://localhost:3001/api/customers \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john@example.com",
       "phone": "+1-555-0123"
     }'
   ```

2. **Create a product**
   ```bash
   curl -X POST http://localhost:3002/api/products \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Wireless Headphones",
       "description": "High-quality wireless headphones",
       "price": 199.99,
       "category": "Electronics",
       "stock": 50
     }'
   ```

3. **Create an order**
   ```bash
   curl -X POST http://localhost:3003/api/orders \
     -H "Content-Type: application/json" \
     -d '{
       "customerId": "CUST_1234567890_abc123",
       "productId": "PROD_1234567890_def456",
       "amount": 199.99
     }'
   ```

## 📊 Monitoring

### Health Checks

All services provide health check endpoints:
- Customer Service: `http://localhost:3001/health`
- Product Service: `http://localhost:3002/health`
- Order Service: `http://localhost:3003/health`
- Payment Service: `http://localhost:3004/health`

### RabbitMQ Management UI

Access the RabbitMQ management interface at:
- URL: `http://localhost:15672`
- Username: `admin`
- Password: `password123`

### MongoDB Access

Connect to MongoDB using:
- Host: `localhost:27017`
- Username: `admin`
- Password: `password123`

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set production environment variables
2. **SSL/TLS**: Configure HTTPS for all services
3. **Load Balancing**: Use a load balancer for high availability
4. **Monitoring**: Implement proper logging and monitoring
5. **Security**: Configure proper authentication and authorization
6. **Backup**: Set up database backups
7. **Scaling**: Configure horizontal scaling for services

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Services not starting**: Check if MongoDB and RabbitMQ are running
2. **Connection errors**: Verify environment variables and network connectivity
3. **Database connection issues**: Ensure MongoDB is accessible and credentials are correct
4. **RabbitMQ connection issues**: Check RabbitMQ is running and credentials are correct

### Logs

View service logs:
```bash
# Docker Compose
docker-compose logs -f [service-name]

# Individual service
docker-compose logs -f customer-service
docker-compose logs -f product-service
docker-compose logs -f order-service
docker-compose logs -f payment-service
docker-compose logs -f transaction-worker
```

## 🚀 CI/CD Pipeline

The project includes **2 streamlined GitHub Actions workflows**:

### **Quick Tests** (`.github/workflows/quick-tests.yml`)
- **Triggers**: Every push and pull request
- **Scope**: Unit tests only
- **Infrastructure**: GitHub services (MongoDB + RabbitMQ)
- **Duration**: ~2-3 minutes
- **Purpose**: Fast feedback for developers

### **Full CI/CD Pipeline** (`.github/workflows/ci.yml`)
- **Triggers**: Main branch pushes and PRs to main
- **Scope**: Complete integration testing
- **Infrastructure**: Full Docker Compose setup
- **Duration**: ~5-8 minutes
- **Purpose**: Comprehensive validation before merge

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

