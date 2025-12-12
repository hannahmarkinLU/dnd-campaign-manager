require('dotenv').config();
const express = require('express');
const { db } = require('./database/setup');
const cors = require('cors');
const { requireAuth, requireRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARE ===

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Basic middleware
app.use(express.json());
app.use(cors());

// Test database connection and sync
async function initializeDatabase() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
        
        // Sync database without forcing (to preserve data)
        const forceSync = process.env.FORCE_SYNC === 'true';
        if (process.env.NODE_ENV !== "test") {
          await db.sync({ force: false });
          console.log("Database synchronized. Force sync: false");
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); // Exit if database connection fails
    }
}
initializeDatabase();

// === ROUTES ===

// Import route modules
const authRoutes = require("./routes/auth");
const campaignRoutes = require("./routes/campaigns");
const characterRoutes = require("./routes/characters");
const sessionRoutes = require("./routes/sessions");

// Mount route modules
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/sessions", sessionRoutes);

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
        register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',

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

// === ERROR HANDLING ===

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        message: `${req.method} ${req.path} is not a valid endpoint`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// === START SERVER ===

// Only start the server if not in test mode
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`D&D Campaign API server running at http://localhost:${PORT}`);
  });
}

// Export for testing
module.exports = app;