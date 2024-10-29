const request = require('supertest');
const app = require('../app'); 
const prisma = require('../models/prismaClients');

describe('Account API Endpoints', () => {
  let testUser;
  let testAccount;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      },
    });
  });

  afterAll(async () => {
    await prisma.bankAccount.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/accounts', () => {
    it('should create a new bank account', async () => {
      const response = await request(app)
        .post('/api/v1/accounts')
        .send({
          userId: testUser.id,
          bank_name: 'Test Bank',
          bank_account_number: '123456789',
          balance: 1000,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.bank_name).toBe('Test Bank');
      expect(response.body.bank_account_number).toBe('123456789');
      expect(response.body.balance).toBe(1000);

      testAccount = response.body;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/accounts')
        .send({
          userId: testUser.id,
          bank_name: 'Test Bank',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/accounts', () => {
    it('should return all bank accounts', async () => {
      const response = await request(app).get('/api/v1/accounts');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/accounts/:accountId', () => {
    it('should return a specific bank account', async () => {
      const response = await request(app).get(`/api/v1/accounts/${testAccount.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testAccount.id);
      expect(response.body.bank_name).toBe(testAccount.bank_name);
      expect(response.body.bank_account_number).toBe(testAccount.bank_account_number);
    });

    it('should return 404 if account is not found', async () => {
      const response = await request(app).get('/api/v1/accounts/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});