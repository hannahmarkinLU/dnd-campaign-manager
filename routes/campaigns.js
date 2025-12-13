const express = require("express");
const router = express.Router();
const { db, Campaign } = require("../database/setup");
const { requireAuth, requireRole } = require("../middleware/auth");
const { isCampaignDM } = require("../middleware/authHelper");
const { createCampaignValidator, updateCampaignValidator } = require("../validators/campaignValidators");
const validate = require("../middleware/validate");

// GET all campaigns - player or DM
router.get("/", requireAuth, async (req, res, next) => {
    try {
        const campaigns = await Campaign.findAll();
        res.json(campaigns);
    } catch (err) {
        next(err);
    }
});

// GET single campaign - player or DM
router.get("/:id", requireAuth, async (req, res, next) => {
    try {
        const campaign = await Campaign.findByPk(req.params.id);
        if (!campaign) return res.status(404).json({ error: "Campaign not found" });
        res.json(campaign);
    } catch (err) {
        next(err);
    }
});

// CREATE campaign - DM only
router.post("/", requireAuth, requireRole("dm"), createCampaignValidator, validate, async (req, res, next) => {
    try {
        const campaign = await Campaign.create({
            ...req.body,
            dmId: req.user.id
        });
        res.status(201).json(campaign);
    } catch (err) {
        next(err);
    }
});

// UPDATE campaign - only DM of this campaign
router.put("/:id", requireAuth, updateCampaignValidator, validate, async (req, res, next) => {
    try {
        const campaign = await isCampaignDM(req.user.id, req.params.id);
        if (campaign === null)
            return res.status(404).json({ error: "Campaign not found" });
        if (campaign === false)
            return res.status(403).json({ error: "You are not authorized to edit this campaign" });

        await campaign.update(req.body);
        res.json(campaign);
    } catch (err) {
        next(err);
    }
});

// DELETE campaign - only DM of this campaign
router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
        const campaign = await isCampaignDM(req.user.id, req.params.id);
        if (campaign === null)
            return res.status(404).json({ error: "Campaign not found" });
        if (campaign === false)
            return res.status(403).json({ error: "You are not authorized to delete this campaign" });

        await campaign.destroy();
        res.json({ message: "Campaign deleted successfully" });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
