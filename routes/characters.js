const express = require("express");
const router = express.Router();
const { Character } = require("../database/setup");
const { requireAuth } = require("../middleware/auth");
const { canEditCharacter } = require("../middleware/authHelper");
const { createCharacterValidator, updateCharacterValidator } = require("../validators/characterValidators");
const validate = require("../middleware/validate");

// GET all characters
router.get("/", requireAuth, async (req, res, next) => {
    try {
        const chars = await Character.findAll();
        res.json(chars);
    } catch (err) {
        next(err);
    }
});

// GET character by ID
router.get("/:id", requireAuth, async (req, res, next) => {
    try {
        const char = await Character.findByPk(req.params.id);
        if (!char) return res.status(404).json({ error: "Character not found" });
        res.json(char);
    } catch (err) {
        next(err);
    }
});

// CREATE character - any authenticated user
router.post("/", requireAuth, createCharacterValidator, validate, async (req, res, next) => {
    try {
        const newChar = await Character.create({
            ...req.body,
            userId: req.user.id
        });
        res.status(201).json(newChar);
    } catch (err) {
        next(err);
    }
});

// UPDATE character - must be owner OR campaign DM
router.put("/:id", requireAuth, updateCharacterValidator, validate, async (req, res, next) => {
    try {
        const check = await canEditCharacter(req.user, req.params.id);
        if (check === null) return res.status(404).json({ error: "Character not found" });
        if (check === false) return res.status(403).json({ error: "Not authorized" });

        await check.update(req.body);
        res.json(check);
    } catch (err) {
        next(err);
    }
});

// DELETE character - must be owner OR campaign DM
router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
        const check = await canEditCharacter(req.user, req.params.id);
        if (check === null)
            return res.status(404).json({ error: "Character not found" });
        if (check === false)
            return res.status(403).json({ error: "Not authorized" });

        await check.destroy();
        res.json({ message: "Character deleted" });
    } catch (err) {
        next(err);
    }
});

module.exports = router;