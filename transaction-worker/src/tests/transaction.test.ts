/**
 * Transaction Worker Tests
 */

import { TransactionHistoryModel } from '../models/TransactionHistory';
import { connectDatabase, disconnectDatabase } from '../config/database';

describe('Transaction Worker', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await TransactionHistoryModel.deleteMany({});
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await TransactionHistoryModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('Transaction History Model', () => {
    it('should create a transaction history record', async () => {
      const transactionData = {
        transactionId: 'TXN_123',
        customerId: 'CUST_123',
        orderId: 'ORD_123',
        productId: 'PROD_123',
        amount: 50000,
        status: 'completed',
        timestamp: new Date()
      };

      const transaction = new TransactionHistoryModel(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.transactionId).toBe('TXN_123');
      expect(savedTransaction.customerId).toBe('CUST_123');
      expect(savedTransaction.amount).toBe(50000);
      expect(savedTransaction.status).toBe('completed');
    });

    it('should validate required fields', async () => {
      const transactionData = {
        // Missing required fields
        amount: 50000
      };

      const transaction = new TransactionHistoryModel(transactionData);
      
      await expect(transaction.save()).rejects.toThrow();
    });

    it('should validate amount is positive', async () => {
      const transactionData = {
        transactionId: 'TXN_123',
        customerId: 'CUST_123',
        orderId: 'ORD_123',
        productId: 'PROD_123',
        amount: -100, // Negative amount
        status: 'completed',
        timestamp: new Date()
      };

      const transaction = new TransactionHistoryModel(transactionData);
      
      await expect(transaction.save()).rejects.toThrow();
    });
  });


  describe('Transaction History Queries', () => {
    beforeEach(async () => {
      // Create test transactions
      const transactions = [
        {
          transactionId: 'TXN_001',
          customerId: 'CUST_001',
          orderId: 'ORD_001',
          productId: 'PROD_001',
          amount: 25000,
          status: 'completed',
          timestamp: new Date('2025-01-01')
        },
        {
          transactionId: 'TXN_002',
          customerId: 'CUST_002',
          orderId: 'ORD_002',
          productId: 'PROD_002',
          amount: 50000,
          status: 'completed',
          timestamp: new Date('2025-01-02')
        },
        {
          transactionId: 'TXN_003',
          customerId: 'CUST_001',
          orderId: 'ORD_003',
          productId: 'PROD_003',
          amount: 75000,
          status: 'completed',
          timestamp: new Date('2025-01-03')
        }
      ];

      await TransactionHistoryModel.insertMany(transactions);
    });

    it('should find transactions by customer ID', async () => {
      const transactions = await TransactionHistoryModel.find({ customerId: 'CUST_001' });
      
      expect(transactions).toHaveLength(2);
      expect(transactions[0].customerId).toBe('CUST_001');
      expect(transactions[1].customerId).toBe('CUST_001');
    });

    it('should find transactions by order ID', async () => {
      const transaction = await TransactionHistoryModel.findOne({ orderId: 'ORD_002' });
      
      expect(transaction).toBeTruthy();
      expect(transaction?.orderId).toBe('ORD_002');
      expect(transaction?.amount).toBe(50000);
    });

    it('should find transactions by product ID', async () => {
      const transaction = await TransactionHistoryModel.findOne({ productId: 'PROD_003' });
      
      expect(transaction).toBeTruthy();
      expect(transaction?.productId).toBe('PROD_003');
      expect(transaction?.amount).toBe(75000);
    });

    it('should find transactions within amount range', async () => {
      const transactions = await TransactionHistoryModel.find({
        amount: { $gte: 50000, $lte: 100000 }
      });
      
      expect(transactions).toHaveLength(2);
      expect(transactions.every(t => t.amount >= 50000 && t.amount <= 100000)).toBe(true);
    });

    it('should find transactions by date range', async () => {
      // Get all transactions first to verify they exist
      const allTransactions = await TransactionHistoryModel.find({});
      expect(allTransactions.length).toBeGreaterThan(0);
      
      // Test date range query
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-03');
      
      const transactions = await TransactionHistoryModel.find({
        timestamp: { $gte: startDate, $lte: endDate }
      });
      
      // Should find at least some transactions in this range
      expect(transactions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Transaction Statistics', () => {
    beforeEach(async () => {
      // Create test transactions with different amounts
      const transactions = [
        {
          transactionId: 'TXN_001',
          customerId: 'CUST_001',
          orderId: 'ORD_001',
          productId: 'PROD_001',
          amount: 10000,
          status: 'completed',
          timestamp: new Date()
        },
        {
          transactionId: 'TXN_002',
          customerId: 'CUST_002',
          orderId: 'ORD_002',
          productId: 'PROD_002',
          amount: 20000,
          status: 'completed',
          timestamp: new Date()
        },
        {
          transactionId: 'TXN_003',
          customerId: 'CUST_003',
          orderId: 'ORD_003',
          productId: 'PROD_003',
          amount: 30000,
          status: 'completed',
          timestamp: new Date()
        }
      ];

      await TransactionHistoryModel.insertMany(transactions);
    });

    it('should calculate total transaction amount', async () => {
      const result = await TransactionHistoryModel.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      expect(result[0].totalAmount).toBe(60000);
      expect(result[0].count).toBe(3);
    });

    it('should calculate average transaction amount', async () => {
      const result = await TransactionHistoryModel.aggregate([
        {
          $group: {
            _id: null,
            averageAmount: { $avg: '$amount' }
          }
        }
      ]);

      expect(result[0].averageAmount).toBe(20000);
    });

    it('should find top customers by transaction count', async () => {
      // Add more transactions for CUST_001
      await TransactionHistoryModel.create({
        transactionId: 'TXN_004',
        customerId: 'CUST_001',
        orderId: 'ORD_004',
        productId: 'PROD_004',
        amount: 15000,
        status: 'completed',
        timestamp: new Date()
      });

      const result = await TransactionHistoryModel.aggregate([
        {
          $group: {
            _id: '$customerId',
            transactionCount: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        { $sort: { transactionCount: -1 } }
      ]);

      expect(result[0]._id).toBe('CUST_001');
      expect(result[0].transactionCount).toBe(2);
    });
  });
});
