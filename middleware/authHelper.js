const { Character, Campaign, User, Session } = require("../database/setup");

// Check if user can edit character
async function canEditCharacter(user, characterId) {
    try {
        const character = await Character.findByPk(characterId, {
            include: [
                { 
                    model: Campaign, 
                    as: 'campaign',
                    include: [{ model: User, as: 'dm' }]
                }
            ]
        });
        
        if (!character) return null;
        
        if (character.userId === user.id) return character;
        
        if (character.campaign && character.campaign.dmId === user.id) return character;
        
        return false;
    } catch (error) {
        console.error('Error in canEditCharacter:', error);
        return null;
    }
}

// Check if user is DM of a campaign and return campaign if true
async function isCampaignDM(userId, campaignId) {
    try {
        const campaign = await Campaign.findByPk(campaignId);
        if (!campaign) return null;
        if (campaign.dmId === userId) return campaign; // Return campaign object, not boolean
        return false;
    } catch (error) {
        console.error("Error in isCampaignDM:", error);
        return false;
    }
}

// Check if user can edit a session
// Check if user can edit a session
async function canEditSession(user, sessionId) {
    try {
        const session = await Session.findByPk(sessionId, {
            include: [
                {
                    model: Campaign,
                    as: "campaign",
                    include: [{ model: User, as: "dm" }]
                }
            ]
        });

        if (!session) return null;

        // Only the DM of the campaign can edit sessions
        if (session.campaign && session.campaign.dmId === user.id) {
            return session;
        }

        return false;
    } catch (error) {
        console.error("Error in canEditSession:", error);
        return null;
    }
}

// Export both functions
module.exports = { canEditCharacter, isCampaignDM, canEditSession };