const request = require("supertest");
const app = require("../app"); 
const prisma = require("../models/prismaClients");
const jwt = require("jsonwebtoken");
require("dotenv").config();

let token;

describe("Auth API Integration Tests", () => {
    beforeAll(async () => {
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    describe("POST /api/v1/auth/register", () => {
        it("should register a new user", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    name: "Test User",
                    email: "testuser@example.com",
                    password: "password123",
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("User created successfully");
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data).toHaveProperty("email", "testuser@example.com");
        });

        it("should return error if email already exists", async () => {
            const response = await request(app)
                .post("/api/v1/auth/register")
                .send({
                    name: "Test User",
                    email: "testuser@example.com",
                    password: "password123",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Email already exists");
        });
    });

    describe("POST /api/v1/auth/login", () => {
        it("should login an existing user and return a JWT token", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "testuser@example.com",
                    password: "password123",
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            token = response.body.token;
        });

        it("should return error for invalid credentials", async () => {
            const response = await request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: "testuser@example.com",
                    password: "wrongpassword",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "User or Password not found");
        });
    });

    describe("GET /api/v1/auth/authenticate", () => {
        it("should return success for authenticated user", async () => {
            const response = await request(app)
                .get("/api/v1/auth/authenticate")
                .set("Authorization", token);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Berhasil masuk");
        });

        it("should return 401 if no token is provided", async () => {
            const response = await request(app)
                .get("/api/v1/auth/authenticate");

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "You must be logged in to access this route");
        });

        it("should return 403 if an invalid token is provided", async () => {
            const response = await request(app)
                .get("/api/v1/auth/authenticate")
                .set("Authorization", "invalidtoken");

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty("error", "You are not authoried");
        });
    });
});
