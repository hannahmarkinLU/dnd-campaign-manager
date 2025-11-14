const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const path = require('path');
const dbName = process.env.DB_NAME || 'campaign_management.db';
const storagePath = path.resolve(__dirname, dbName); // Absolute path

const db = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
});

console.log(`Using SQLite database at: ${storagePath}`);

// Define Campaign model
const Campaign = db.define('Campaign', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    }
});

// Define CampaignPlayer model
const CampaignPlayer = db.define('CampaignPlayer', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

// Define User model
const User = db.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { len: [3, 30] }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('dm', 'player'),
        allowNull: false,
        default: 'player'
    }
});

// Define Character model
const Character = db.define('Character', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    characterClass: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'class' // Keeps the column name 'class' in the DB
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: { min: 1 }
    },
    race: {
        type: DataTypes.STRING,
        allowNull: false
    }
  });

// Define Session model
const Session = db.define('Session', {
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

// Define relationships
Campaign.belongsTo(User, { foreignKey: 'dmId', as: 'dm' });
Campaign.belongsToMany(User, { through: CampaignPlayer, foreignKey: 'campaignId', otherKey: 'userId', as: 'players' });
Campaign.hasMany(Character, { foreignKey: 'campaignId', as: 'characters', onDelete: 'CASCADE' });
Campaign.hasMany(Session, { foreignKey: 'campaignId', as: 'sessions', onDelete: 'CASCADE' });

User.hasMany(Campaign, { foreignKey: 'dmId', as: 'managedCampaigns' });
User.hasMany(Character, { foreignKey: 'userId', as: 'characters' });
User.belongsToMany(Campaign, { through: CampaignPlayer, foreignKey: 'userId', otherKey: 'campaignId', as: 'joinedCampaigns' });

Character.belongsTo(User, { foreignKey: 'userId', as: 'player' });
Character.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });

Session.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });

// Export for use in other files
module.exports = { db, Campaign, User, Character, Session };

// Create database and tables
async function setupDatabase() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
        
        // Use environment variable to control force sync
        const forceSync = process.env.FORCE_SYNC === 'true';
        await db.sync({ force: forceSync });
        console.log(`Database sync completed. Force sync: ${forceSync}`);
        
        // Let the calling code manage the connection
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error; // Re-throw to let calling code handle it
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase();
}