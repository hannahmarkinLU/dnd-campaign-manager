const { body } = require("express-validator");

exports.createCampaignValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Campaign title is required"),
  
  body("description")
    .optional()
    .isString().withMessage("Description must be a string")
];

exports.updateCampaignValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Campaign title cannot be empty"),

  body("description")
    .optional()
    .isString().withMessage("Description must be a string")
];