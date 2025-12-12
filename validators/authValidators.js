const { body } = require("express-validator");

exports.registerValidator = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["player", "dm"]).withMessage("Role must be 'player' or 'dm'")
];

exports.loginValidator = [
  body("username").notEmpty().withMessage("Username required"),
  body("password").notEmpty().withMessage("Password required")
];