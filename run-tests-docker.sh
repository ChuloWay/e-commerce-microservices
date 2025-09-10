#!/bin/bash

# Docker-only Test Runner for E-commerce Microservices
# This script runs all tests inside Docker containers without requiring local Node.js installation

echo "🐳 Starting Docker-only test suite..."
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Build and start all services
echo "🔨 Building and starting all services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 60

# Check if services are healthy
echo "🏥 Checking service health..."
docker-compose ps

# Run tests using the test profile
echo "🧪 Running comprehensive test suite..."
docker-compose --profile test run --rm test-runner

# Capture exit code
TEST_EXIT_CODE=$?

# Clean up
echo "🧹 Cleaning up..."
docker-compose down

# Report results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "❌ Some tests failed!"
    exit $TEST_EXIT_CODE
fi
