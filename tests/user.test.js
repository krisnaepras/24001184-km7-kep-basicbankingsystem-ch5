const request = require("supertest");
const app = require("../app");
const prisma = require("../models/prismaClients");

beforeEach(async () => {
    await prisma.profile.deleteMany();
    await prisma.bankAccount.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe("User API", () => {
    describe("POST /api/v1/users", () => {
        it("should create a new user", async () => {
            const newUser = {
                name: "John Doe",
                email: "john@mail.com",
                password: "password",
                profile: {
                    identity_type: "KTP",
                    identity_number: "1234567890",
                    address: "Surabaya",
                },
            };

            const response = await request(app)
                .post("/api/v1/users")
                .send(newUser);


            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("email", newUser.email);

            expect(response.body).toHaveProperty("profile");
            expect(response.body.profile).toHaveProperty(
                "identity_type",
                newUser.profile.identity_type
            );
            expect(response.body.profile).toHaveProperty(
                "identity_number",
                newUser.profile.identity_number
            );
            expect(response.body.profile).toHaveProperty(
                "address",
                newUser.profile.address
            );
        });

        it("should return 400 if required fields are missing", async () => {
            const incompleteUser = {
                name: "John Doe",
                profile: {
                    identity_type: "KTP",
                    identity_number: "1234567890",
                    address: "Surabaya",
                },
            };

            const response = await request(app)
                .post("/api/v1/users")
                .send(incompleteUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });

        it("should return 400 if email is already in use", async () => {
            const existingUser = {
                name: "Existing User",
                email: "existing@mail.com",
                password: "password",
                profile: {
                    identity_type: "KTP",
                    identity_number: "9876543210",
                    address: "Jakarta",
                },
            };

            await prisma.user.create({
                data: {
                    ...existingUser,
                    profile: { create: existingUser.profile },
                },
            });

            const response = await request(app)
                .post("/api/v1/users")
                .send(existingUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });

    describe("GET /api/v1/users", () => {
        it("should retrieve a list of users", async () => {
            const response = await request(app).get("/api/v1/users");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it("should return an empty array if no users exist", async () => {
            await prisma.user.deleteMany();

            const response = await request(app).get("/api/v1/users");
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it("should return 500 if there's a server error", async () => {
            jest.spyOn(prisma.user, "findMany").mockRejectedValue(
                new Error("Database error")
            );

            const response = await request(app).get("/api/v1/users");
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });

    describe("GET /api/v1/users/:userId", () => {
        it("should retrieve a user by ID", async () => {
            const newUser = await prisma.user.create({
                data: {
                    name: "Jane Doe",
                    email: "jane@mail.com",
                    password: "password",
                    profile: {
                        create: {
                            identity_type: "KTP",
                            identity_number: "1234567890",
                            address: "Surabaya",
                        },
                    },
                },
            });

            const response = await request(app).get(
                `/api/v1/users/${newUser.id}`
            );
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id", newUser.id);
            expect(response.body).toHaveProperty("email", newUser.email);
        });

        it("should return 404 if user is not found", async () => {
            const response = await request(app).get("/api/v1/users/99999");
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error", "User not found");
        });

        it("should return 400 if userId is not a valid number", async () => {
            const response = await request(app).get("/api/v1/users/invalidId");
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });
});
