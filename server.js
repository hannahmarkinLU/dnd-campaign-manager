const express = require('express');
const { db, Campaign, User, Character, Session } = require('./database/setup');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARE ===

// Basic middleware
app.use(express.json());
app.use(cors());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

// Test database connection
async function testConnection() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

// === ROUTES === (NOTE: requireAuth to be added to all endpoints except root and /health)

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'D&D Campaign Organizer API is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the D&D Campaign Organizer API',
    version: '1.0.0',
    description: 'A RESTful API for managing Dungeons & Dragons campaigns, characters, and sessions.',
    endpoints: {
      health: 'GET /health',

      // Campaign endpoints
      getAllCampaigns: 'GET /api/campaigns',
      getCampaignById: 'GET /api/campaigns/:id',
      createCampaign: 'POST /api/campaigns',
      updateCampaign: 'PUT /api/campaigns/:id',
      deleteCampaign: 'DELETE /api/campaigns/:id',

      // Character endpoints
      getAllCharacters: 'GET /api/characters',
      getCharacterById: 'GET /api/characters/:id',
      createCharacter: 'POST /api/characters',
      updateCharacter: 'PUT /api/characters/:id',
      deleteCharacter: 'DELETE /api/characters/:id',

      // Session endpoints
      getAllSessions: 'GET /api/sessions',
      getSessionById: 'GET /api/sessions/:id',
      createSession: 'POST /api/sessions',
      updateSession: 'PUT /api/sessions/:id',
      deleteSession: 'DELETE /api/sessions/:id'
    }
  });
});

// === AUTHENTICATION ROUTES ===

// POST /api/register - Register new user

// POST /api/login - User login

// === CAMPAIGN ROUTES ===

// GET /api/campaigns - Get all campaigns
app.get('/api/campaigns', async (req, res) => {
    try {
        const campaigns = await Campaign.findAll();
        res.json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});

// GET /api/campaigns/:id - Get campaign by ID
app.get('/api/campaigns/:id', async (req, res) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id, {
            include: ['characters', 'sessions', { model: User, as: 'dm' }]
        });
        
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        
        res.json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
});

// POST /api/campaigns - Create new campaign (NOTE: requireDM to be added)
app.post('/api/campaigns', async (req, res) => {
    try {
        const { title, description } = req.body;
        const dmId = req.session?.userId || req.body.dmId;

        if (!title || !description || !dmId) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const newCampaign = await Campaign.create({
            title,
            description,
            dmId
        });
        
        res.status(201).json(newCampaign);
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

// PUT /api/campaigns/:id - Update existing campaign (NOTE: requireDM to be added)
app.put('/api/campaigns/:id', async (req, res) => {
    try {
        const { title, description } = req.body;
        
        const [updatedRowsCount] = await Campaign.update(
            { title, description },
            { where: { id: req.params.id } }
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const updatedCampaign = await Campaign.findByPk(req.params.id);
        res.json(updatedCampaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Failed to update campaign' });
    }
});

// DELETE /api/campaigns/:id - Delete campaign (NOTE: requireDM to be added)
app.delete('/api/campaigns/:id', async (req, res) => {
    try {
        const deletedRowsCount = await Campaign.destroy({
            where: { id: req.params.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        
        res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Failed to delete campaign' });
    }
});

// === CHARACTER ROUTES ===

// GET /api/characters - Get all characters
app.get('/api/characters', async (req, res) => {
    try {
        const characters = await Character.findAll();
        res.json(characters);
    } catch (error) {
        console.error('Error fetching characters:', error);
        res.status(500).json({ error: 'Failed to fetch characters' });
    }
});

// GET /api/characters/:id - Get character by ID
app.get('/api/characters/:id', async (req, res) => {
    try {
        const character = await Character.findByPk(req.params.id);
        
        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }
        
        res.json(character);
    } catch (error) {
        console.error('Error fetching character:', error);
        res.status(500).json({ error: 'Failed to fetch character' });
    }
});

// POST /api/characters - Create new character
app.post('/api/characters', async (req, res) => {
    try {
        const { name, characterClass, level, race, campaignId } = req.body;
        const userId = req.session.userId;
        
        if (!name || !characterClass || !level || !race || !campaignId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newCharacter = await Character.create({
            name,
            characterClass,
            level: level || 1,
            race,
            userId,
            campaignId
        });
        
        res.status(201).json(newCharacter);
    } catch (error) {
        console.error('Error creating character:', error);
        res.status(500).json({ error: 'Failed to create character' });
    }
});

// PUT /api/characters/:id - Update existing character (NOTE: requireDM and function to only allow User who created the character to update it to be added)
app.put('/api/characters/:id', async (req, res) => {
    try {
        const { name, characterClass, level, race } = req.body;
        const userId = req.session.userId;
        
        const [updatedRowsCount] = await Character.update(
            { name, characterClass, level, race, userId },
            { where: { id: req.params.id } }
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }
        
        const updatedCharacter = await Character.findByPk(req.params.id);
        res.json(updatedCharacter);
    } catch (error) {
        console.error('Error updating character:', error);
        res.status(500).json({ error: 'Failed to update character' });
    }
});

// DELETE /api/characters/:id - Delete character (NOTE: requireDM and function to allow User who created the character to delete it to be added)
app.delete('/api/characters/:id', async (req, res) => {
    try {
        const deletedRowsCount = await Character.destroy({
        where: { id: req.params.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }
        
        res.json({ message: 'Character deleted successfully' });
    } catch (error) {
        console.error('Error deleting character:', error);
        res.status(500).json({ error: 'Failed to delete character' });
    }
});

// === SESSION ROUTES ===

// GET /api/sessions - Get all sessions
app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await Session.findAll();
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// GET /api/sessions/:id - Get session by ID
app.get('/api/sessions/:id', async (req, res) => {
    try {
        const session = await Session.findByPk(req.params.id);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json(session);
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

// POST /api/sessions - Create new session (NOTE: requireDM to be added)
app.post('/api/sessions', async (req, res) => {
    try {
        const { date, summary, campaignId } = req.body;
        
        if (!date || !summary || !campaignId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newSession = await Session.create({
            date,
            summary,
            campaignId,
        });
        
        res.status(201).json(newSession);
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// PUT /api/sessions/:id - Update existing session (NOTE: requireDM to be added)
app.put('/api/sessions/:id', async (req, res) => {
    try {
        const { date, summary } = req.body;
        
        const [updatedRowsCount] = await Session.update(
            { date, summary },
            { where: { id: req.params.id } }
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        const updatedSession = await Session.findByPk(req.params.id);
        res.json(updatedSession);
    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({ error: 'Failed to update session' });
    }
});

// DELETE /api/sessions/:id - Delete session (NOTE: requireDM to be added)
app.delete('/api/sessions/:id', async (req, res) => {
    try {
        const deletedRowsCount = await Session.destroy({
        where: { id: req.params.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        message: `${req.method} ${req.path} is not a valid endpoint`
    });
});

// === START SERVER ===

// Only start the server if not in test mode
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Menu API server running at http://localhost:${PORT}`);
  });
}

// Export for testing
module.exports = app;