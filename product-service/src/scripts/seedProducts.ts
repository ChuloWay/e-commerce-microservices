/**
 * Database seeding script for Product Service
 * This script creates sample product data for testing and development
 */

import mongoose from 'mongoose';
import { ProductModel } from '../models/Product';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { createLogger } from '../utils';

const logger = createLogger('ProductSeeder');

// Sample product data
const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
    price: 199.99,
    category: 'Electronics',
    stock: 50,
    imageUrl: 'https://example.com/images/headphones.jpg'
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking watch with heart rate monitor, GPS, and water resistance. Track your workouts and health metrics.',
    price: 299.99,
    category: 'Electronics',
    stock: 30,
    imageUrl: 'https://example.com/images/smartwatch.jpg'
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt. Available in multiple colors and sizes. Made from 100% organic cotton.',
    price: 29.99,
    category: 'Clothing',
    stock: 100,
    imageUrl: 'https://example.com/images/tshirt.jpg'
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and eco-friendly.',
    price: 24.99,
    category: 'Home & Kitchen',
    stock: 75,
    imageUrl: 'https://example.com/images/waterbottle.jpg'
  },
  {
    name: 'Professional Camera Lens',
    description: 'High-quality 50mm f/1.8 prime lens for professional photography. Sharp images with beautiful bokeh effect.',
    price: 449.99,
    category: 'Electronics',
    stock: 15,
    imageUrl: 'https://example.com/images/camera-lens.jpg'
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip premium yoga mat with excellent grip and cushioning. Perfect for yoga, pilates, and other fitness activities.',
    price: 59.99,
    category: 'Sports & Fitness',
    stock: 40,
    imageUrl: 'https://example.com/images/yoga-mat.jpg'
  },
  {
    name: 'Coffee Maker Deluxe',
    description: 'Programmable coffee maker with built-in grinder and thermal carafe. Makes up to 12 cups of perfect coffee.',
    price: 129.99,
    category: 'Home & Kitchen',
    stock: 25,
    imageUrl: 'https://example.com/images/coffee-maker.jpg'
  },
  {
    name: 'Running Shoes Pro',
    description: 'Lightweight running shoes with advanced cushioning technology. Designed for long-distance running and comfort.',
    price: 149.99,
    category: 'Sports & Fitness',
    stock: 60,
    imageUrl: 'https://example.com/images/running-shoes.jpg'
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.',
    price: 39.99,
    category: 'Electronics',
    stock: 80,
    imageUrl: 'https://example.com/images/wireless-charger.jpg'
  },
  {
    name: 'Bamboo Cutting Board Set',
    description: 'Set of 3 bamboo cutting boards in different sizes. Eco-friendly, antimicrobial, and easy to clean.',
    price: 49.99,
    category: 'Home & Kitchen',
    stock: 35,
    imageUrl: 'https://example.com/images/cutting-boards.jpg'
  },
  {
    name: 'Denim Jacket Classic',
    description: 'Classic denim jacket made from premium cotton denim. Timeless style that never goes out of fashion.',
    price: 79.99,
    category: 'Clothing',
    stock: 45,
    imageUrl: 'https://example.com/images/denim-jacket.jpg'
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Compact and powerful Bluetooth speaker with 360-degree sound. Waterproof and perfect for outdoor adventures.',
    price: 89.99,
    category: 'Electronics',
    stock: 55,
    imageUrl: 'https://example.com/images/bluetooth-speaker.jpg'
  }
];

/**
 * Seed the database with sample products
 */
const seedProducts = async (): Promise<void> => {
  try {
    logger.info('Starting product seeding process...');

    // Connect to database
    await connectDatabase();

    // Clear existing products (optional - remove this line to keep existing data)
    await ProductModel.deleteMany({});
    logger.info('Cleared existing product data');

    // Insert sample products
    const createdProducts = await ProductModel.insertMany(sampleProducts);
    logger.info(`Successfully created ${createdProducts.length} products`);

    // Log created products
    createdProducts.forEach(product => {
      logger.info(`Created product: ${product.name} (${product.productId}) - $${product.price}`);
    });

    // Log category summary
    const categories = [...new Set(createdProducts.map(p => p.category))];
    logger.info(`Products created in categories: ${categories.join(', ')}`);

    logger.info('Product seeding completed successfully');

  } catch (error) {
    logger.error('Error seeding products:', error);
    throw error;
  } finally {
    // Disconnect from database
    await disconnectDatabase();
  }
};

/**
 * Main execution function
 */
const main = async (): Promise<void> => {
  try {
    await seedProducts();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding script if this file is executed directly
if (require.main === module) {
  main();
}

export { seedProducts };
