const request = require("supertest");
const app = require("../app");
const prisma = require("../models/prismaClients");

let sourceAccount;
let destinationAccount;

beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.bankAccount.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();

    const user1 = await prisma.user.create({
        data: {
            name: "User One",
            email: "userone@mail.com",
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

    const user2 = await prisma.user.create({
        data: {
            name: "User Two",
            email: "usertwo@mail.com",
            password: "password",
            profile: {
                create: {
                    identity_type: "SIM",
                    identity_number: "0987654321",
                    address: "Bandung",
                },
            },
        },
    });

    sourceAccount = await prisma.bankAccount.create({
        data: {
            userId: user1.id,
            bank_name: "Bank A",
            bank_account_number: "102102",
            balance: 100000,
        },
    });

    destinationAccount = await prisma.bankAccount.create({
        data: {
            userId: user2.id,
            bank_name: "Bank B",
            bank_account_number: "101101",
            balance: 50000,
        },
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Transaction API", () => {
    describe("POST /api/v1/transactions", () => {
        it("should create a new transaction", async () => {
            const newTransaction = {
                sourceAccountNumber: sourceAccount.bank_account_number,
                destinationAccountNumber:
                    destinationAccount.bank_account_number,
                amount: 50000,
            };

            const response = await request(app)
                .post("/api/v1/transactions")
                .send(newTransaction);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty(
                "amount",
                newTransaction.amount
            );
            expect(response.body).toHaveProperty(
                "sourceAccountNumber",
                newTransaction.sourceAccountNumber
            );
            expect(response.body).toHaveProperty(
                "destinationAccountNumber",
                newTransaction.destinationAccountNumber
            );

            const updatedSourceAccount = await prisma.bankAccount.findUnique({
                where: { id: sourceAccount.id },
            });
            const updatedDestinationAccount =
                await prisma.bankAccount.findUnique({
                    where: { id: destinationAccount.id },
                });

            expect(updatedSourceAccount.balance).toBe(
                sourceAccount.balance - newTransaction.amount
            );
            expect(updatedDestinationAccount.balance).toBe(
                destinationAccount.balance + newTransaction.amount
            );
        });

        it("should return 400 if required fields are missing", async () => {
            const incompleteTransaction = {
                sourceAccountNumber: sourceAccount.bank_account_number,
                amount: 50000,
            };

            const response = await request(app)
                .post("/api/v1/transactions")
                .send(incompleteTransaction);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "error",
                "Missing required fields"
            );
        });

        it("should return 400 if source account has insufficient funds", async () => {
            const transaction = {
                sourceAccountNumber: sourceAccount.bank_account_number,
                destinationAccountNumber:
                    destinationAccount.bank_account_number,
                amount: 200000,
            };

            const response = await request(app)
                .post("/api/v1/transactions")
                .send(transaction);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "error",
                "Insufficient funds or source account not found"
            );
        });
    });

    describe("GET /api/v1/transactions", () => {
        it("should retrieve a list of transactions", async () => {
            await prisma.transaction.create({
                data: {
                    amount: 50000,
                    sourceAccount: { connect: { id: sourceAccount.id } },
                    destinationAccount: {
                        connect: { id: destinationAccount.id },
                    },
                },
            });

            const response = await request(app).get("/api/v1/transactions");

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it("should return an empty array if no transactions exist", async () => {
            const response = await request(app).get("/api/v1/transactions");

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        it("should return 400 if there's a server error", async () => {
            jest.spyOn(prisma.transaction, "findMany").mockRejectedValue(
                new Error("Database error")
            );

            const response = await request(app).get("/api/v1/transactions");

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "error",
                "Error fetching transaction"
            );
        });
    });

    describe("GET /api/v1/transactions/:transactionId", () => {
        it("should retrieve a transaction by ID", async () => {
            const transaction = await prisma.transaction.create({
                data: {
                    amount: 50000,
                    sourceAccount: { connect: { id: sourceAccount.id } },
                    destinationAccount: {
                        connect: { id: destinationAccount.id },
                    },
                },
            });

            const response = await request(app).get(
                `/api/v1/transactions/${transaction.id}`
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id", transaction.id);
            expect(response.body).toHaveProperty("amount", transaction.amount);
        });

        it("should return 404 if transaction is not found", async () => {
            const response = await request(app).get(
                "/api/v1/transactions/99999"
            );

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty(
                "error",
                "Transaction not found"
            );
        });

        it("should return 400 if transactionId is invalid", async () => {
            const response = await request(app).get(
                "/api/v1/transactions/invalid-id"
            );

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty(
                "error",
                "Error fetching transaction details"
            );
        });
    });
});
