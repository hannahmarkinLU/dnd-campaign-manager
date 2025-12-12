const { body } = require("express-validator");

exports.createCharacterValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Character name is required"),

  body("class")
    .trim()
    .notEmpty().withMessage("Class is required"),

  body("race")
    .trim()
    .notEmpty().withMessage("Race is required"),

  body("level")
    .optional()
    .isInt({ min: 1 }).withMessage("Level must be a positive integer"),

  body("campaignId")
    .isInt().withMessage("campaignId must be a valid integer")
];

exports.updateCharacterValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty().withMessage("Name cannot be empty"),

  body("level")
    .optional()
    .isInt({ min: 1 }).withMessage("Level must be a positive integer")
    .default(1),

  body("class")
    .optional()
    .trim()
    .notEmpty().withMessage("Class cannot be empty"),

  body("race")
    .optional()
    .trim()
    .notEmpty().withMessage("Race cannot be empty")
];