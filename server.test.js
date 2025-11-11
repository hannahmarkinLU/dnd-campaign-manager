const request = require('supertest');
const { db, Campaign, User, Character, Session } = require('./database/setup');

// Import the app without starting the server
const app = require('./server');

// Mock session for all tests
const mockSession = { userId: 1 };

// Add session middleware to app for testing
app.use((req, res, next) => {
  req.session = mockSession;
  next();
});

// Setup & teardown
beforeAll(async () => {
  await db.sync({ force: true });
  await User.create({ 
    id: 1,
    username: 'testdm', 
    password: 'password', 
    role: 'dm' 
  });
});

afterAll(async () => {
  await db.close();
});

// Tests
describe('D&D Campaign Organizer API', () => {
    // Test GET /health to return API health status
    test('should return API health status', async () => {
        const response = await request(app).get('/health');
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('OK');
    });
    
    // Test GET /api/campaigns to return an array
    test('should return an array', async () => {
        const response = await request(app).get('/api/campaigns');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
    
    // Test that POST /api/campaigns fails without required field
    test('should fail without required field', async () => {
        const response = await request(app)
          .post('/api/campaigns')
          .send({ 
            title: '', 
            description: 'test', 
            dmId: 1
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBeDefined();
    });
    
    // Test that GET /api/campaigns/:id returns 404 for nonexistent ID
    test('should return 404 for nonexistent ID', async () => {
        const response = await request(app).get('/api/campaigns/9999');
        expect(response.statusCode).toBe(404);
    });
    
    // Test POST /api/campaigns to successfully create a campaign
    test('should successfully create a campaign', async () => {
        const newCampaign = { 
            title: 'Test Campaign', 
            description: 'A test campaign',
            dmId: 1
        };
        const response = await request(app)
            .post('/api/campaigns')
            .send(newCampaign);

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newCampaign.title);
        expect(response.body.description).toBe(newCampaign.description);
    });
    
    // Test PUT /api/campaigns/[campaign id] to successfully update a campaign
    test('should successfully update a campaign', async () => {
        const campaign = await Campaign.create({ 
            title: 'Old', 
            description: 'Old desc', 
            dmId: 1 
        });
        const response = await request(app)
            .put(`/api/campaigns/${campaign.id}`)
            .send({ title: 'Updated', description: 'Updated desc' });

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('Updated');
    });
    
    // Test DELETE /api/campaigns/[campaign id] to successfully delete a campaign
    test('should successfully delete a campaign', async () => {
        const campaign = await Campaign.create({ 
            title: 'To Delete', 
            description: 'Delete me', 
            dmId: 1 
        });
        const response = await request(app).delete(`/api/campaigns/${campaign.id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Campaign deleted successfully');
    });
});