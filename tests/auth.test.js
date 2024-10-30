const request = require("supertest");
const app = require("../app");
const prisma = require("../models/prismaClients");

beforeAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.bankAccount.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("Authentication Tests", () => {
    const userCredentials = {
        name: "Test User",
        email: "test@example.com",
        password: "TestPassword123",
    };

    describe("POST /api/v1/auth/register", () => {
        test("Successful Registration", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userCredentials);

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe("User created successfully");
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data.email).toBe(userCredentials.email);
        });

        test("Email Already Exists", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send(userCredentials);

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe("Email already exists");
        });

        test("Invalid Input - Missing Fields", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({ name: "Incomplete User" });

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe("Error creating user");
        });
    });

    describe("POST /api/v1/auth/login", () => {
        test("Successful Login", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: userCredentials.email,
                    password: userCredentials.password,
                });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("token");
        });

        test("Incorrect Password", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: userCredentials.email,
                    password: "WrongPassword",
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe("User or Password not found");
        });

        test("User Not Found", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "AnyPassword",
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.error).toBe("Error logging in");
        });
    });

    describe("GET /api/v1/auth/authenticate", () => {
        test("Authentication Successful", async () => {
            const loginResponse = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: userCredentials.email,
                    password: userCredentials.password,
                });

            const token = loginResponse.body.token;

            const authResponse = await request(app)
                .get("/api/v1/auth/authenticate")
                .set("Authorization", `Bearer ${token}`);

            expect(authResponse.statusCode).toBe(200);
            expect(authResponse.body.message).toBe("Berhasil masuk");
        });

        test("Missing Token", async () => {
            const response = await request(app).get(
                "/api/v1/auth/authenticate"
            );

            expect(response.statusCode).toBe(401);
            expect(response.body.error).toBe(
                "You must be logged in to access this route"
            );
        });

        test("Invalid Token", async () => {
            const response = await request(app)
                .get("/api/v1/auth/authenticate")
                .set("Authorization", "Bearer invalidtoken");

            expect(response.statusCode).toBe(403);
            expect(response.body.error).toBe("You are not authoried");
        });
    });
});
