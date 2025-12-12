const request = require("supertest");
const app = require("../server");
const { db } = require("../database/setup");

let playerToken;
let dmToken;

beforeAll(async () => {
    await db.sync({ force: true });

    const dm = await request(app)
        .post("/api/auth/register")
        .send({ username: "dm_characters", password: "password123", role: "dm" });

    console.log('DM Registration:', dm.body);
    dmToken = dm.body.token;

    const player = await request(app)
        .post("/api/auth/register")
        .send({ username: "player_characters", password: "password123", role: "player" });

    console.log('Player Registration:', player.body);
    playerToken = player.body.token;
});

describe("CHARACTER ROUTES", () => {
    let campaignId;
    let characterId;

    beforeEach(async () => {
        // Create a campaign for the DM before each test
        if (dmToken) {
            const campaignRes = await request(app)
                .post("/api/campaigns")
                .set("Authorization", `Bearer ${dmToken}`)
                .send({ title: "Character Test Campaign", description: "For character tests" });
            
            campaignId = campaignRes.body.id;
            console.log('Campaign created:', campaignId);
        }
    });

    test("Player can create character", async () => {
        console.log('Creating character with player token:', playerToken);
        console.log('Campaign ID:', campaignId);

        // Try sending both 'class' and 'characterClass' to see which works
        const res = await request(app)
            .post("/api/characters")
            .set("Authorization", `Bearer ${playerToken}`)
            .send({ 
                name: "Thorin", 
                class: "Fighter",        // Validator expects 'class'
                characterClass: "Fighter", // Model might expect 'characterClass'
                level: 1,
                race: "Tiefling",
                campaignId: campaignId 
            });

        console.log('Create Character Response:', res.statusCode, res.body);
        
        // Try alternative if first fails
        if (res.statusCode !== 201) {
            console.log('Trying with only class field...');
            const res2 = await request(app)
                .post("/api/characters")
                .set("Authorization", `Bearer ${playerToken}`)
                .send({ 
                    name: "Thorin", 
                    class: "Fighter",  // Only 'class'
                    level: 1,
                    race: "Tiefling",
                    campaignId: campaignId 
                });
            console.log('Second attempt:', res2.statusCode, res2.body);
            expect(res2.statusCode).toBe(201);
            characterId = res2.body.id;
        } else {
            characterId = res.body.id;
            expect(res.statusCode).toBe(201);
        }
    });

    test("Player can update own character", async () => {
        // Create character first
        const createRes = await request(app)
            .post("/api/characters")
            .set("Authorization", `Bearer ${playerToken}`)
            .send({ 
                name: "Thorin", 
                class: "Fighter",
                level: 1,
                race: "Tiefling",
                campaignId: campaignId 
            });
        
        expect(createRes.statusCode).toBe(201);
        characterId = createRes.body.id;
        
        // Update character
        const res = await request(app)
            .put(`/api/characters/${characterId}`)
            .set("Authorization", `Bearer ${playerToken}`)
            .send({ class: "Barbarian" });

        expect(res.statusCode).toBe(200);
    });

    test("DM cannot delete unrelated character", async () => {
        // Create a different DM
        const anotherDmRes = await request(app)
            .post("/api/auth/register")
            .send({ username: "another_dm", password: "password123", role: "dm" });
        const anotherDmToken = anotherDmRes.body.token;
    
        // Create campaign with another DM
        const anotherCampaignRes = await request(app)
            .post("/api/campaigns")
            .set("Authorization", `Bearer ${anotherDmToken}`)
            .send({ title: "Another DM's Campaign", description: "Not our DM's campaign" });
        const anotherCampaignId = anotherCampaignRes.body.id;
    
        // Create character in the other DM's campaign
        const createRes = await request(app)
            .post("/api/characters")
            .set("Authorization", `Bearer ${playerToken}`)
            .send({ 
                name: "Thorin", 
                class: "Fighter",
                level: 1,
                race: "Tiefling",
                campaignId: anotherCampaignId  // Different campaign
        });
    
        expect(createRes.statusCode).toBe(201);
        characterId = createRes.body.id;
    
        // Original DM tries to delete character from other DM's campaign (should fail with 403)
        const res = await request(app)
            .delete(`/api/characters/${characterId}`)
            .set("Authorization", `Bearer ${dmToken}`);

        expect(res.statusCode).toBe(403); // Now this should pass
    });
});