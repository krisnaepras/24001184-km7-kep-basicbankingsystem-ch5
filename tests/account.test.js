const request = require("supertest");
const app = require("../app");
const prisma = require("../models/prismaClients");

let testUser;

beforeEach(async () => {
    await prisma.profile.deleteMany();
    await prisma.bankAccount.deleteMany();
    await prisma.user.deleteMany();

    testUser = await prisma.user.create({
        data: {
            name: "Test User",
            email: "testuser@mail.com",
            password: "password",
            profile: {
                create: {
                    identity_type: "KTP",
                    identity_number: "1234567890",
                    address: "Jakarta",
                },
            },
        },
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Account API", () => {
    describe("POST /api/v1/accounts", () => {
        it("should create a new bank account", async () => {
            const newAccount = {
                userId: testUser.id,
                bank_name: "Bank A",
                bank_account_number: "101101",
                balance: 500000,
            };

            const response = await request(app)
                .post("/api/v1/accounts")
                .send(newAccount);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("userId", newAccount.userId);
            expect(response.body).toHaveProperty(
                "bank_name",
                newAccount.bank_name
            );
            expect(response.body).toHaveProperty(
                "bank_account_number",
                newAccount.bank_account_number
            );
            expect(response.body).toHaveProperty("balance", newAccount.balance);
        });

        it("should return 400 if required fields are missing", async () => {
            const incompleteAccount = {
                userId: testUser.id,
                bank_name: "Bank A",
                balance: 500000,
            };

            const response = await request(app)
                .post("/api/v1/accounts")
                .send(incompleteAccount);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "error",
                "Missing required fields"
            );
        });

        it("should return 400 if balance is not a valid number", async () => {
            const invalidAccount = {
                userId: testUser.id,
                bank_name: "Bank A",
                bank_account_number: "101101",
                balance: "invalid_balance",
            };

            const response = await request(app)
                .post("/api/v1/accounts")
                .send(invalidAccount);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "error",
                "Invalid input for balance"
            );
        });

        it("should return 404 if user is not found", async () => {
            const accountWithInvalidUser = {
                userId: 99999,
                bank_name: "Bank A",
                bank_account_number: "101101",
                balance: 500000,
            };

            const response = await request(app)
                .post("/api/v1/accounts")
                .send(accountWithInvalidUser);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "User not found");
        });

        it("should return 400 if bank account number already exists", async () => {
            const existingAccount = {
                userId: testUser.id,
                bank_name: "Bank A",
                bank_account_number: "101101",
                balance: 500000,
            };

            await prisma.bankAccount.create({
                data: existingAccount,
            });

            const response = await request(app)
                .post("/api/v1/accounts")
                .send(existingAccount);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "error",
                "Bank account number already exists"
            );
        });
    });

    describe("GET /api/v1/accounts", () => {
        it("should retrieve a list of bank accounts", async () => {
            await prisma.bankAccount.create({
                data: {
                    userId: testUser.id,
                    bank_name: "Bank A",
                    bank_account_number: "101101",
                    balance: 500000,
                },
            });

            const response = await request(app).get("/api/v1/accounts");

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it("should return an empty array if no accounts exist", async () => {
            const response = await request(app).get("/api/v1/accounts");

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it("should return 400 if there's an error fetching accounts", async () => {
            jest.spyOn(prisma.bankAccount, "findMany").mockRejectedValue(
                new Error("Database error")
            );

            const response = await request(app).get("/api/v1/accounts");

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "error",
                "Error fetching accounts"
            );
        });
    });

    describe("GET /api/v1/accounts/:accountId", () => {
        it("should retrieve a bank account by ID", async () => {
            const account = await prisma.bankAccount.create({
                data: {
                    userId: testUser.id,
                    bank_name: "Bank B",
                    bank_account_number: "102102",
                    balance: 1000000,
                },
            });

            const response = await request(app).get(
                `/api/v1/accounts/${account.id}`
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id", account.id);
            expect(response.body).toHaveProperty(
                "bank_name",
                account.bank_name
            );
            expect(response.body).toHaveProperty(
                "bank_account_number",
                account.bank_account_number
            );
            expect(response.body).toHaveProperty("balance", account.balance);
        });

        it("should return 404 if account is not found", async () => {
            const response = await request(app).get("/api/v1/accounts/99999");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "Account not found");
        });

        it("should return 400 if accountId is not a valid number", async () => {
            const response = await request(app).get(
                "/api/v1/accounts/invalid_id"
            );

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Invalid account ID");
        });

        it("should return 400 if there's an error fetching account details", async () => {
            jest.spyOn(prisma.bankAccount, "findUnique").mockRejectedValue(
                new Error("Database error")
            );

            const response = await request(app).get("/api/v1/accounts/1");

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "error",
                "Error fetching account detail"
            );
        });
    });
});
