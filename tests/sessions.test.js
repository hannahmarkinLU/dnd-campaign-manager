const request = require("supertest");
const app = require("../server");
const { db } = require("../database/setup");

let dmToken;
let playerToken;
let sessionId;
let campaignId;

beforeAll(async () => {
    await db.sync({ force: true });

    const dm = await request(app)
        .post("/api/auth/register")
        .send({ username: "dm_sessions", password: "password123", role: "dm" });

    console.log('DM Registration:', dm.body);
    dmToken = dm.body.token;

    const player = await request(app)
        .post("/api/auth/register")
        .send({ username: "player_sessions", password: "password123", role: "player" });

    console.log('Player Registration:', player.body);
    playerToken = player.body.token;
});

beforeEach(async () => {
    if (dmToken) {
        const campaignRes = await request(app)
            .post("/api/campaigns")
            .set("Authorization", `Bearer ${dmToken}`)
            .send({ title: "Session Test Campaign", description: "For session tests" });
        
        campaignId = campaignRes.body.id;
        console.log('Campaign created:', campaignId);
    }
});

describe("SESSION ROUTES", () => {
    test("Player cannot create session", async () => {
        const res = await request(app)
            .post("/api/sessions")
            .set("Authorization", `Bearer ${playerToken}`)
            .send({ 
                summary: "Session 1",
                date: "2023-12-01",
                campaignId: campaignId
            });

        expect(res.statusCode).toBe(403);
    });

    test("DM can create session", async () => {
        const res = await request(app)
            .post("/api/sessions")
            .set("Authorization", `Bearer ${dmToken}`)
            .send({ 
                summary: "Epic Session",
                date: "2023-12-01",
                campaignId: campaignId
            });

        sessionId = res.body.id;

        expect(res.statusCode).toBe(201);
    });

    test("DM can update session", async () => {
        // First create a session
        const createRes = await request(app)
            .post("/api/sessions")
            .set("Authorization", `Bearer ${dmToken}`)
            .send({ 
                summary: "Epic Session",
                date: "2023-12-01",
                campaignId: campaignId
            });
        
        sessionId = createRes.body.id;
        
        const res = await request(app)
            .put(`/api/sessions/${sessionId}`)
            .set("Authorization", `Bearer ${dmToken}`)
            .send({ summary: "Updated Session" });

        expect(res.statusCode).toBe(200);
    });

    test("DM can delete session", async () => {
        // First create a session
        const createRes = await request(app)
            .post("/api/sessions")
            .set("Authorization", `Bearer ${dmToken}`)
            .send({ 
                summary: "Epic Session",
                date: "2023-12-01",
                campaignId: campaignId
            });
        
        sessionId = createRes.body.id;
        
        const res = await request(app)
            .delete(`/api/sessions/${sessionId}`)
            .set("Authorization", `Bearer ${dmToken}`);

        expect(res.statusCode).toBe(200);
    });
});