/**
 * Product seeding script
 */

import axios from 'axios';
import { createLogger } from './utils';

const logger = createLogger('ProductSeeder');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

// Sample product data with Nigerian market relevance
const sampleProducts = [
  {
    name: 'Tecno Spark 10 Pro',
    description: 'Latest smartphone with 6.8" HD display, 50MP camera, and 5000mAh battery. Perfect for staying connected in Nigeria.',
    price: 85000,
    category: 'Electronics',
    stock: 50,
    imageUrl: 'https://example.com/images/tecno-spark.jpg'
  },
  {
    name: 'Infinix Hot 12 Play',
    description: 'Gaming smartphone with MediaTek Helio G88 processor, 6GB RAM, and 6000mAh battery. Great for mobile gaming.',
    price: 75000,
    category: 'Electronics',
    stock: 30,
    imageUrl: 'https://example.com/images/infinix-hot.jpg'
  },
  {
    name: 'Ankara Print Dress',
    description: 'Beautiful traditional Nigerian Ankara fabric dress. Available in various sizes and vibrant African patterns.',
    price: 15000,
    category: 'Clothing',
    stock: 100,
    imageUrl: 'https://example.com/images/ankara-dress.jpg'
  },
  {
    name: 'Thermal Flask',
    description: 'Insulated stainless steel flask that keeps drinks hot for 12 hours or cold for 24 hours. Perfect for Nigerian weather.',
    price: 12000,
    category: 'Home & Kitchen',
    stock: 75,
    imageUrl: 'https://example.com/images/thermal-flask.jpg'
  },
  {
    name: 'Canon EOS M50 Mark II',
    description: 'Professional mirrorless camera with 24.1MP sensor and 4K video recording. Ideal for Nigerian photographers.',
    price: 280000,
    category: 'Electronics',
    stock: 15,
    imageUrl: 'https://example.com/images/canon-m50.jpg'
  },
  {
    name: 'Exercise Mat',
    description: 'Non-slip exercise mat perfect for home workouts. Great for Nigerian fitness enthusiasts.',
    price: 25000,
    category: 'Sports & Fitness',
    stock: 40,
    imageUrl: 'https://example.com/images/exercise-mat.jpg'
  },
  {
    name: 'Coffee Maker',
    description: 'Automatic coffee maker perfect for Nigerian coffee lovers. Makes delicious coffee for the whole family.',
    price: 45000,
    category: 'Home & Kitchen',
    stock: 25,
    imageUrl: 'https://example.com/images/coffee-maker.jpg'
  },
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Air Max cushioning. Perfect for Nigerian runners and athletes.',
    price: 65000,
    category: 'Sports & Fitness',
    stock: 60,
    imageUrl: 'https://example.com/images/nike-airmax.jpg'
  },
  {
    name: 'Wireless Charger',
    description: 'Fast wireless charging pad compatible with all smartphones. Convenient charging solution.',
    price: 18000,
    category: 'Electronics',
    stock: 80,
    imageUrl: 'https://example.com/images/wireless-charger.jpg'
  },
  {
    name: 'Wooden Chopping Board Set',
    description: 'Set of 3 wooden chopping boards in different sizes. Perfect for Nigerian kitchens.',
    price: 22000,
    category: 'Home & Kitchen',
    stock: 35,
    imageUrl: 'https://example.com/images/chopping-boards.jpg'
  },
  {
    name: 'Denim Jeans',
    description: 'Classic denim jeans made from premium cotton. Available in various sizes and washes.',
    price: 35000,
    category: 'Clothing',
    stock: 45,
    imageUrl: 'https://example.com/images/denim-jeans.jpg'
  },
  {
    name: 'JBL Portable Speaker',
    description: 'Compact Bluetooth speaker with powerful sound. Perfect for Nigerian parties and outdoor events.',
    price: 42000,
    category: 'Electronics',
    stock: 55,
    imageUrl: 'https://example.com/images/jbl-speaker.jpg'
  },
  {
    name: 'Traditional Kaftan',
    description: 'Elegant traditional Nigerian kaftan made from premium cotton. Perfect for special occasions.',
    price: 28000,
    category: 'Clothing',
    stock: 30,
    imageUrl: 'https://example.com/images/kaftan.jpg'
  },
  {
    name: 'Rice Cooker',
    description: 'Automatic rice cooker perfect for Nigerian households. Cooks perfect rice every time.',
    price: 35000,
    category: 'Home & Kitchen',
    stock: 40,
    imageUrl: 'https://example.com/images/rice-cooker.jpg'
  },
  {
    name: 'Samsung Galaxy Buds',
    description: 'True wireless earbuds with active noise cancellation. Great for Nigerian music lovers.',
    price: 55000,
    category: 'Electronics',
    stock: 25,
    imageUrl: 'https://example.com/images/galaxy-buds.jpg'
  }
];

/**
 * Create or skip product
 */
const createOrSkipProduct = async (productData: any): Promise<any> => {
  try {
    const response = await axios.post(`${PRODUCT_SERVICE_URL}/api/products`, productData, {
      timeout: 5000
    });

    if (response.data.success) {
      logger.info(`Product created: ${productData.name} (${response.data.data.productId}) - ₦${productData.price}`);
      return response.data.data;
    } else {
      logger.warn(`Failed to create product: ${productData.name} - ${response.data.message}`);
      return null;
    }
  } catch (error: any) {
    if (error.response?.status === 409) {
      logger.info(`Product already exists: ${productData.name}`);
      return null; // Skip existing product
    } else if (error.response?.status === 400) {
      logger.warn(`Validation error for product ${productData.name}: ${error.response.data.message}`);
      return null;
    } else {
      logger.error(`Error creating product ${productData.name}:`, error.message);
      return null;
    }
  }
};

/**
 * Seed products
 */
export const seedProducts = async (): Promise<void> => {
  try {
    logger.info('Starting product seeding...');

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of sampleProducts) {
      const result = await createOrSkipProduct(product);
      
      if (result) {
        createdCount++;
      } else {
        // Check if it was skipped due to existing product or error
        skippedCount++;
      }
    }

    logger.info(`Product seeding completed - Created: ${createdCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);

  } catch (error) {
    logger.error('Error seeding products:', error);
    throw error;
  }
};

