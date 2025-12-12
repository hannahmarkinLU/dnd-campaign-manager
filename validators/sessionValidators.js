const { body } = require("express-validator");

exports.createSessionValidator = [
  body("campaignId")
    .isInt().withMessage("campaignId must be a valid integer"),

  body("date")
    .notEmpty().withMessage("Date is required")
    .isISO8601().withMessage("Invalid date format"),

  body("summary")
    .optional()
    .isString().withMessage("Summary must be a string")
];

exports.updateSessionValidator = [
  body("date")
    .optional()
    .isISO8601().withMessage("Invalid date format"),

  body("summary")
    .optional()
    .isString().withMessage("Summary must be a string")
];