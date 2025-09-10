# GitHub Actions CI/CD

This directory contains GitHub Actions workflows for automated testing and CI/CD.

## Workflows

### 1. `ci.yml` - Full CI/CD Pipeline
- **Triggers**: Push to `main`/`develop`, Pull Requests to `main`
- **Services**: MongoDB, RabbitMQ
- **Steps**:
  1. Setup Node.js 18
  2. Install all dependencies
  3. Build all services
  4. Start services with Docker Compose
  5. Wait for health checks
  6. Run comprehensive test suite
  7. Upload test coverage reports
  8. Cleanup services

### 2. `test-only.yml` - Quick Tests
- **Triggers**: Push to `main`, Pull Requests to `main`
- **Services**: None (unit tests only)
- **Steps**:
  1. Setup Node.js 18
  2. Install dependencies
  3. Run unit tests for all services
  4. Fast feedback for development

## Local Simulation

```bash
# Simulate full CI/CD pipeline
npm run test:ci

# Simulate quick tests
npm run test:quick
```

## Features

- ✅ **Automated Testing**: Runs on every push and PR
- ✅ **Service Health Checks**: Ensures all services are ready
- ✅ **Test Coverage**: Uploads coverage reports as artifacts
- ✅ **Fast Feedback**: Quick tests for rapid development
- ✅ **Cleanup**: Always stops services after tests
- ✅ **Nigerian Naira Support**: Tests currency formatting
