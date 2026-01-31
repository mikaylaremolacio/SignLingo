const { body } = require("express-validator");
const checkValidation = require("../../../shared/middlewares/check-validation");

const createProgressRules = [

  body("username")
    .notEmpty()
    .withMessage("User is required")
    .isString()
    .withMessage("User must be a valid username"),

  body("level")
    .notEmpty()
    .withMessage("Level is required")
    .isInt({ min: 1 })
    .withMessage("Level must be a positive integer"),

  body("letters")
    .notEmpty()
    .withMessage("Letters are required")
    .isArray({ min: 1 })
    .withMessage("Letters must be a non-empty array"),

  body("letters.*.letter")
    .notEmpty()
    .withMessage("Letter is required")
    .isString()
    .withMessage("Letter must be a string")
    .trim(),

  body("letters.*.review.interval")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Interval must be a positive integer"),

  body("letters.*.review.easeFactor")
    .optional()
    .isFloat({ min: 1.3 })
    .withMessage("Ease factor must be a number greater than or equal to 1.3"),

  body("letters.*.review.repetitions")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Repetitions must be a non-negative integer"),

  body("letters.*.review.nextReviewAt")
    .notEmpty()
    .withMessage("Next review date is required")
    .isISO8601()
    .withMessage("Next review date must be a valid date"),

  body("letters.*.review.lastReviewedAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Last reviewed date must be a valid date"),

  body("letters.*.review.correctReviews")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Correct reviews must be a non-negative integer"),

  body("letters.*.review.incorrectReviews")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Incorrect reviews must be a non-negative integer"),

  checkValidation,
];

module.exports = createProgressRules;
