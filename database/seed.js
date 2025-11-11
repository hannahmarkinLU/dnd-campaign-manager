// seed.js
const { db, User, Campaign, Character, Session } = require('./database/setup');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    await db.authenticate();
    console.log('Connected to database for seeding.');
    
    await db.sync({ force: true }); // Safely resets tables

    // === SAMPLE USERS ===
    const users = [
      {
        username: 'DungeonMaster',
        password: await bcrypt.hash('dm123', 10),
        role: 'dm'
      },
      {
        username: 'ElfPlayer',
        password: await bcrypt.hash('elf123', 10),
        role: 'player'
      },
      {
        username: 'RoguePlayer',
        password: await bcrypt.hash('rogue123', 10),
        role: 'player'
      }
    ];
    const createdUsers = await User.bulkCreate(users);
    console.log('Sample users inserted.');

    // === SAMPLE CAMPAIGNS ===
    const campaigns = [
      {
        title: 'The Lost Mines of Phandelver',
        description: 'A classic D&D starter adventure with goblins, mines, and mystery.',
        dmId: createdUsers[0].id
      },
      {
        title: 'Curse of Strahd',
        description: 'A gothic horror campaign in the cursed land of Barovia.',
        dmId: createdUsers[0].id
      }
    ];
    const createdCampaigns = await Campaign.bulkCreate(campaigns);
    console.log('Sample campaigns inserted.');

    // === SAMPLE CHARACTERS ===
    const characters = [
      {
        name: 'Elara Moonwhisper',
        characterClass: 'Ranger',
        level: 3,
        race: 'Elf',
        userId: createdUsers[1].id,
        campaignId: createdCampaigns[0].id
      },
      {
        name: 'Thorin Stonefist',
        characterClass: 'Cleric',
        level: 4,
        race: 'Dwarf',
        userId: createdUsers[2].id,
        campaignId: createdCampaigns[1].id
      }
    ];
    await Character.bulkCreate(characters);
    console.log('Sample characters inserted.');

    // === SAMPLE SESSIONS ===
    const sessions = [
      {
        date: '2025-11-15',
        summary: 'The party entered the goblin cave and rescued Sildar Hallwinter.',
        campaignId: createdCampaigns[0].id
      },
      {
        date: '2025-11-22',
        summary: 'The group ventured into Castle Ravenloft for the final showdown.',
        campaignId: createdCampaigns[1].id
      }
    ];
    await Session.bulkCreate(sessions);
    console.log('Sample sessions inserted.');

    await db.close();
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();