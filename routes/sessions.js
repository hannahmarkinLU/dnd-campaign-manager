const express = require("express");
const router = express.Router();
const { Session } = require("../database/setup");
const { requireAuth } = require("../middleware/auth");
const { isCampaignDM, canEditSession } = require("../middleware/authHelper");
const { createSessionValidator, updateSessionValidator } = require("../validators/sessionValidators");
const validate = require("../middleware/validate");

// GET all sessions
router.get("/", requireAuth, async (req, res, next) => {
    try {
        const sessions = await Session.findAll();
        res.json(sessions);
    } catch (err) {
        next(err);
    }
});

// GET session by ID
router.get("/:id", requireAuth, async (req, res, next) => {
    try {
        const session = await Session.findByPk(req.params.id);

        if (!session)
            return res.status(404).json({ error: "Session not found" });

        res.json(session);
    } catch (err) {
        next(err);
    }
});

// CREATE session - must be DM of campaign
router.post(
    "/",
    requireAuth,
    createSessionValidator,
    validate,
    async (req, res, next) => {
        try {
            const { campaignId } = req.body;

            const check = await isCampaignDM(req.user.id, campaignId);

            if (check === null)
                return res.status(404).json({ error: "Campaign not found" });

            if (check === false)
                return res.status(403).json({ error: "You are not authorized to create sessions for this campaign" });

            const newSession = await Session.create(req.body);
            res.status(201).json(newSession);
        } catch (err) {
            next(err);
        }
    }
);

// UPDATE session - DM only
router.put("/:id", requireAuth, updateSessionValidator, validate, async (req, res, next) => {
  try {
    const check = await canEditSession(req.user, req.params.id);

    if (check === null)
      return res.status(404).json({ error: "Session not found" });

    if (check === false)
      return res.status(403).json({ error: "You are not authorized to update sessions for this campaign" });

    await check.update(req.body);
    res.json(check);
  } catch (err) {
    next(err);
  }
});

// DELETE session - DM only
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const check = await canEditSession(req.user, req.params.id);

    if (check === null)
      return res.status(404).json({ error: "Session not found" });

    if (check === false)
      return res.status(403).json({ error: "You are not authorized to delete sessions for this campaign" });

    await check.destroy();
    res.json({ message: "Session deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;