// tests/user.test.js
const request = require("supertest");
const app = require("../app"); 
const prisma = require("../models/prismaClients");
require("dotenv").config();

describe("User API Integration Tests", () => {
    let userId;

    beforeAll(async () => {
        await prisma.user.deleteMany();
        await prisma.profile.deleteMany();
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await prisma.profile.deleteMany();
        await prisma.$disconnect();
    });

    describe("POST /api/v1/users", () => {
        it("should create a new user with profile data", async () => {
            const response = await request(app)
                .post("/api/v1/users")
                .send({
                    name: "John Doe",
                    email: "johndoe@example.com",
                    password: "password123",
                    profile: {
                        identity_type: "KTP",
                        identity_number: "123456789",
                        address: "123 Main St",
                    },
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("email", "johndoe@example.com");
            expect(response.body).toHaveProperty("profile");

            userId = response.body.id;
        });

        it("should return an error if required fields are missing", async () => {
            const response = await request(app)
                .post("/api/v1/users")
                .send({
                    email: "janedoe@example.com",
                    password: "password123",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Error creating user");
        });
    });

    describe("GET /api/v1/users", () => {
        it("should retrieve a list of users with their profiles", async () => {
            const response = await request(app).get("/api/v1/users");

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body[0]).toHaveProperty("id");
            expect(response.body[0]).toHaveProperty("profile");
        });
    });

    describe("GET /api/v1/users/:userId", () => {
        it("should retrieve a user by ID", async () => {
            const response = await request(app).get(`/api/v1/users/${userId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id", userId);
            expect(response.body).toHaveProperty("profile");
        });

        it("should return a 404 if user is not found", async () => {
            const response = await request(app).get("/api/v1/users/9999");

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "User not found");
        });
    });

    describe("PUT /api/v1/users/:userId", () => {
        it("should update a user's email and password", async () => {
            const response = await request(app)
                .put(`/api/v1/users/${userId}`)
                .send({
                    email: "johnnew@example.com",
                    password: "newpassword123",
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "User updated successfully");
            expect(response.body.updateUser).toHaveProperty("email", "johnnew@example.com");
        });

        it("should return an error if the user is not found", async () => {
            const response = await request(app)
                .put("/api/v1/users/9999")
                .send({
                    email: "nonexistent@example.com",
                    password: "newpassword123",
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Error updating user or user not found");
        });
    });
});
