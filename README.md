# 🛒 E-commerce Microservices Architecture

[![CI/CD Pipeline](https://github.com/ChuloWay/e-commerce-microservices/workflows/Quick%20Tests/badge.svg)](https://github.com/ChuloWay/e-commerce-microservices/actions)
[![CI/CD Pipeline](https://github.com/ChuloWay/e-commerce-microservices/workflows/Full%20CI/CD%20Pipeline/badge.svg)](https://github.com/ChuloWay/e-commerce-microservices/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-89.8%25-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A comprehensive e-commerce microservices system built with Node.js, TypeScript, MongoDB, and RabbitMQ. This project demonstrates a clean, scalable architecture with proper separation of concerns and asynchronous communication patterns.

## 🌟 Features

- **🏗️ Microservices Architecture**: Clean separation of concerns with independent services
- **💰 Nigerian Naira Support**: Full currency localization for Nigerian market
- **🔄 Asynchronous Processing**: RabbitMQ-based event-driven architecture
- **📊 Comprehensive Testing**: Unit, integration, and end-to-end tests
- **🐳 Docker Ready**: Complete containerization with Docker Compose
- **🚀 CI/CD Pipeline**: Automated testing with GitHub Actions
- **📝 TypeScript**: Full type safety and modern JavaScript features
- **🛡️ Input Validation**: Joi schema validation for all endpoints
- **📈 Health Monitoring**: Health checks for all services
- **🌐 RESTful APIs**: Clean, well-documented API endpoints

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

### Local CI/CD Simulation
```bash
# Simulate full CI/CD pipeline locally
npm run test:ci
```

## 📁 Project Structure

```
ecommerce-microservices/
├── .github/workflows/          # GitHub Actions CI/CD workflows
│   ├── quick-tests.yml         # Fast unit tests (2-3 min)
│   └── ci.yml                  # Full CI/CD pipeline (5-8 min)
├── customer-service/           # Customer management service
│   ├── src/
│   │   ├── controllers/        # API controllers
│   │   ├── models/             # Mongoose schemas
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Express middleware
│   │   ├── tests/              # Unit tests
│   │   └── utils/              # Utility functions
│   ├── Dockerfile
│   └── package.json
├── product-service/            # Product catalog service
├── order-service/              # Order management service
├── payment-service/            # Payment processing service
├── transaction-worker/          # Background transaction processor
├── integration-tests/          # End-to-end integration tests
├── scripts/                    # Database seeding scripts
├── docker-compose.yml          # Main Docker Compose configuration
├── docker-compose.ci.yml       # CI-specific Docker Compose
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** - Containerization platform
- **Node.js 18+** - Runtime environment (for local development)
- **Git** - Version control

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
   git clone https://github.com/ChuloWay/e-commerce-microservices.git
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
   git clone https://github.com/ChuloWay/e-commerce-microservices.git
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

## 🇳🇬 Nigerian Market Focus

This e-commerce system is specifically designed for the Nigerian market:

- **💰 Currency**: Nigerian Naira (NGN) with proper formatting
- **📱 Phone Numbers**: Nigerian phone number format (+234-XXX-XXX-XXXX)
- **🏙️ Locations**: Nigerian cities (Lagos, Abuja, Kano, etc.)
- **🛍️ Products**: Nigerian market-relevant products (Tecno phones, Ankara fabrics, etc.)
- **👥 Names**: Authentic Nigerian names in sample data
- **🌍 Locale**: Nigerian locale (en-NG) for proper formatting

## 🔄 Order Flow Example

Here's how the system processes an order:

1. **Customer places order** → Order Service
2. **Order Service validates customer** → Customer Service
3. **Order Service validates product** → Product Service
4. **Order Service processes payment** → Payment Service
5. **Payment Service publishes transaction** → RabbitMQ
6. **Transaction Worker consumes message** → Stores in database

### Example Order Request (Nigerian Market)

```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST_1757486888317_sm0jlx0gs",
    "productId": "PROD_1757487095878_zq06nskje",
    "quantity": 1,
    "amount": 50000
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customerId": "CUST_1757486888317_sm0jlx0gs",
    "orderId": "ORD_1757494119514_yuujm50pc",
    "productId": "PROD_1757487095878_zq06nskje",
    "orderStatus": "confirmed",
    "amount": 50000,
    "orderDate": "2025-09-10T08:48:39.513Z"
  },
  "message": "Order created and payment processed successfully"
}
```

## 🛠️ Technology Stack

### **Backend Technologies**
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with RESTful APIs
- **Database**: MongoDB with Mongoose ODM
- **Message Queue**: RabbitMQ for asynchronous processing
- **Validation**: Joi schema validation
- **Logging**: Winston for structured logging
- **HTTP Client**: Axios for inter-service communication

### **DevOps & Testing**
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions with automated testing
- **Testing**: Jest for unit tests, Supertest for integration tests
- **Code Quality**: TypeScript for type safety
- **Monitoring**: Health checks and service monitoring

### **Architecture Patterns**
- **Microservices**: Independent, scalable services
- **Event-Driven**: Asynchronous communication via RabbitMQ
- **Database per Service**: Each service has its own MongoDB database
- **API Gateway Pattern**: Service-to-service communication
- **Background Processing**: Transaction Worker for async tasks



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

### **Automated Testing**

The project includes comprehensive testing at multiple levels:

#### **1. Unit Tests** (Individual Services)
```bash
# Test individual services
cd customer-service && npm test
cd product-service && npm test
cd order-service && npm test
cd payment-service && npm test
cd transaction-worker && npm test
```

#### **2. Integration Tests** (Service-to-Service)
```bash
# Test service interactions
cd integration-tests && npm test
```

#### **3. End-to-End Tests** (Complete User Journey)
```bash
# Test complete order flow
npm test
```

#### **4. Docker-Only Testing**
```bash
# Test everything in containers
npm run test:docker
```

### **Test Coverage**
- ✅ **Customer Service**: 100% endpoint coverage
- ✅ **Product Service**: 100% endpoint coverage  
- ✅ **Order Service**: 100% endpoint coverage
- ✅ **Payment Service**: 100% endpoint coverage
- ✅ **Transaction Worker**: 100% message processing coverage
- ✅ **Integration Tests**: Service communication validation
- ✅ **End-to-End Tests**: Complete order flow validation

### **Manual Testing with cURL**

#### **1. Create a Nigerian Customer**
```bash
curl -X POST http://localhost:3001/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Adebayo Ogunlesi",
    "email": "adebayo.ogunlesi@example.com",
    "phone": "+234-801-234-5678",
    "address": {
      "street": "123 Victoria Island",
      "city": "Lagos",
      "state": "Lagos",
      "zipCode": "101241",
      "country": "Nigeria"
    }
  }'
```

#### **2. Create a Nigerian Product**
```bash
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tecno Spark 10 Pro",
    "description": "Latest Tecno smartphone with advanced features",
    "price": 85000,
    "category": "Electronics",
    "stock": 25
  }'
```

#### **3. Create an Order**
```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST_1757486888317_sm0jlx0gs",
    "productId": "PROD_1757487095878_zq06nskje",
    "quantity": 1,
    "amount": 50000
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

