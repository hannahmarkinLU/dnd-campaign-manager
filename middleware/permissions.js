const { Campaign, Character, Session } = require("../database/setup");

// Verify logged-in user is the DM of the specified campaign
async function requireCampaignDM(req, res, next) {
  try {
    const id = req.params.campaignId || req.params.id || req.body.campaignId;

    const campaign = await Campaign.findByPk(id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    // userId = DM who owns the campaign
    if (campaign.userId !== req.user.id)
      return res.status(403).json({ error: "Only the campaign DM can perform this action" });

    req.campaign = campaign;
    next();
  } catch (err) {
      next(err);
  }
}

// Character owner OR the DM of the character's campaign can update character
async function requireCharacterOwnerOrCampaignDM(req, res, next) {
  try {
    const character = await Character.findByPk(req.params.id);
    if (!character) return res.status(404).json({ error: "Character not found" });

    const campaign = await Campaign.findByPk(character.campaignId);

    const isOwner = character.userId === req.user.id;
    const isDM = campaign && campaign.userId === req.user.id;

    if (!isOwner && !isDM)
      return res.status(403).json({ error: "Only the character owner or campaign DM can modify this character" });

    req.character = character;
    req.campaign = campaign;
      next();
  } catch (err) {
    next(err);
  }
}

// Only the DM of that campaign may modify the corresponding session
async function requireSessionDM(req, res, next) {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const campaign = await Campaign.findByPk(session.campaignId);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const isDM = campaign.userId === req.user.id;
    if (!isDM)
      return res.status(403).json({ error: "Only the campaign DM may modify this session" });

    req.session = session;
    req.campaign = campaign;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
    requireCampaignDM,
    requireCharacterOwnerOrCampaignDM,
    requireSessionDM
};