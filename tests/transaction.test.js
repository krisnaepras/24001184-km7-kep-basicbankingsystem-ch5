const request = require('supertest');
const app = require('../app');
const prisma = require('../models/prismaClients');

describe('Transaction API Endpoints', () => {
  let testUser1;
  let testUser2;
  let sourceAccount;
  let destinationAccount;
  let testTransaction;

  beforeAll(async () => {
    testUser1 = await prisma.user.create({
      data: {
        name: 'Test User 1',
        email: 'test1@example.com',
        password: 'password123',
      },
    });

    testUser2 = await prisma.user.create({
      data: {
        name: 'Test User 2',
        email: 'test2@example.com',
        password: 'password123',
      },
    });

    sourceAccount = await prisma.bankAccount.create({
      data: {
        bank_name: 'Test Bank',
        bank_account_number: '111222333',
        balance: 1000,
        userId: testUser1.id,
      },
    });

    destinationAccount = await prisma.bankAccount.create({
      data: {
        bank_name: 'Test Bank',
        bank_account_number: '444555666',
        balance: 500,
        userId: testUser2.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.bankAccount.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/transactions', () => {
    it('should create a new transaction', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .send({
          sourceAccountNumber: sourceAccount.bank_account_number,
          destinationAccountNumber: destinationAccount.bank_account_number,
          amount: 100,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.amount).toBe(100);

      testTransaction = response.body;

      const updatedSourceAccount = await prisma.bankAccount.findUnique({
        where: { id: sourceAccount.id },
      });
      const updatedDestinationAccount = await prisma.bankAccount.findUnique({
        where: { id: destinationAccount.id },
      });

      expect(updatedSourceAccount.balance).toBe(900); 
      expect(updatedDestinationAccount.balance).toBe(600); 
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .send({
          sourceAccountNumber: sourceAccount.bank_account_number,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if insufficient funds', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .send({
          sourceAccountNumber: sourceAccount.bank_account_number,
          destinationAccountNumber: destinationAccount.bank_account_number,
          amount: 10000,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Insufficient funds or source account not found');
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('should return all transactions', async () => {
      const response = await request(app).get('/api/v1/transactions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/transactions/:transactionId', () => {
    it('should return a specific transaction', async () => {
      const response = await request(app)
        .get(`/api/v1/transactions/${testTransaction.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testTransaction.id);
      expect(response.body.amount).toBe(testTransaction.amount);
      expect(response.body).toHaveProperty('sourceAccount');
      expect(response.body).toHaveProperty('destinationAccount');
    });

    it('should return 404 if transaction is not found', async () => {
      const response = await request(app)
        .get('/api/v1/transactions/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/transactions/:transactionId', () => {
    it('should delete a transaction', async () => {
      const response = await request(app)
        .delete(`/api/v1/transactions/${testTransaction.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Transaction deleted successfully');
      expect(response.body).toHaveProperty('deletedTransaction');

      const deletedTransaction = await prisma.transaction.findUnique({
        where: { id: testTransaction.id },
      });
      expect(deletedTransaction).toBeNull();
    });

    it('should return 400 if transaction does not exist', async () => {
      const response = await request(app)
        .delete(`/api/v1/transactions/${testTransaction.id}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});