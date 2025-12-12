const request = require('supertest');
const app = require('../server');
const { db, User } = require('../database/setup');

let dmToken, playerToken, campaignId;

// Clear database before tests
beforeAll(async () => {
    await db.sync({ force: true });

    // Register DM
    const dmRes = await request(app)
        .post("/api/auth/register")
        .send({ username: "dm_campaigns", password: "password123", role: "dm" });

    console.log('DM Registration Response:', dmRes.body)
    dmToken = dmRes.body.token;

    // Register Player
    const playerRes = await request(app)
        .post("/api/auth/register")
        .send({ username: "player_campaigns", password: "password123", role: "player" });

    console.log('Player Registration Response:', playerRes.body);
    playerToken = playerRes.body.token;
});

// Tests
describe("CAMPAIGN ROUTES", () => {
    // Test DM can create campaigns
    test("DM can create a campaign", async () => {
        console.log('Using DM Token:', dmToken);

        const res = await request(app)
            .post("/api/campaigns")
            .set("Authorization", `Bearer ${dmToken}`)
            .send({ title: "Test Campaign", description: "A test campaign" });

        console.log('Create Campaign Response:', res.statusCode, res.body);    
        campaignId = res.body.id;

        expect(res.statusCode).toBe(201);
    });
    
    // Test players cannot create campaigns
    test("Player cannot create a campaign", async () => {
        console.log('Using Player Token:', playerToken);

        const res = await request(app)
            .post("/api/campaigns")
            .set("Authorization", `Bearer ${playerToken}`)
            .send({ title: "Forbidden Campaign" });

        console.log('Player Create Campaign Response:', res.statusCode, res.body);

        expect(res.statusCode).toBe(403);
    });
    
    // Test GET all campaigns from authorized user
    test("GET all campaigns", async () => {
        const res = await request(app)
            .get("/api/campaigns")
            .set("Authorization", `Bearer ${playerToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
    });
    
    // Test that GET /api/campaigns/:id returns 404 for nonexistent ID
    test('should return 404 for nonexistent ID', async () => {
        const response = await request(app)
            .get('/api/campaigns/9999')
            .set("Authorization", `Bearer ${playerToken}`);
        expect(response.statusCode).toBe(404);
    });
    
    // Test DM can delete campaigns
    test("DM can delete campaign", async () => {
        const res = await request(app)
            .delete(`/api/campaigns/${campaignId}`)
            .set("Authorization", `Bearer ${dmToken}`);

        expect(res.statusCode).toBe(200);
    });
});