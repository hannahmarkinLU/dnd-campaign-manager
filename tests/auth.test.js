const request = require('supertest');
const app = require("../server");
const { db, User } = require('../database/setup');

// Setup & teardown
beforeAll(async () => {
    await db.sync({ force: true });
});

describe("AUTH ROUTES", () => {
    // Test registering a new user
    test("Register a new user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "testuser", password: "password123" });

        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeDefined();
    });

    // Test correct login
    test("Login with correct credentials", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "testuser", password: "password123" });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    // Test incorrect login
    test("Fail login with incorrect password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "testuser", password: "wrongpass" });

        expect(res.statusCode).toBe(401);
    });
});