const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const loginRules = [
  body("username")
    .notEmpty()
    .withMessage("Username required"),

  body("password").notEmpty().withMessage("Password required"),

  checkValidation,
];

module.exports = loginRules;
