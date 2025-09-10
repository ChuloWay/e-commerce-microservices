// MongoDB initialization script
// This script creates the necessary databases and users for the e-commerce microservices

// Switch to admin database
db = db.getSiblingDB('admin');

// Create databases
db.runCommand({ create: 'ecommerce_customers' });
db.runCommand({ create: 'ecommerce_products' });
db.runCommand({ create: 'ecommerce_orders' });
db.runCommand({ create: 'ecommerce_payments' });
db.runCommand({ create: 'ecommerce_transactions' });

print('MongoDB databases created successfully');

// Create application user with read/write access to all databases
db.createUser({
  user: 'ecommerce_user',
  pwd: 'ecommerce_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ecommerce_customers'
    },
    {
      role: 'readWrite',
      db: 'ecommerce_products'
    },
    {
      role: 'readWrite',
      db: 'ecommerce_orders'
    },
    {
      role: 'readWrite',
      db: 'ecommerce_payments'
    },
    {
      role: 'readWrite',
      db: 'ecommerce_transactions'
    }
  ]
});

print('MongoDB user created successfully');

