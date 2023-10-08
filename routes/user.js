const express = require("express");
const { body } = require("express-validator");

const userControllers = require("../controllers/user");
const {
  noSpecialCharsNoWhiteSpacesAtTheStartAndAtTheEndRegex,
  passwordRegex,
} = require("../util/regex");
const User = require("../models/user");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.post(
  "/signUp",
  body("email")
    .trim()
    .isEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Email address already exists");
        }
      });
    })
    .normalizeEmail(),
  body("firstName")
    .trim()
    .isLength({ min: 3 })
    .matches(noSpecialCharsNoWhiteSpacesAtTheStartAndAtTheEndRegex)
    .escape(),
  body("lastName")
    .trim()
    .isLength({ min: 3 })
    .matches(noSpecialCharsNoWhiteSpacesAtTheStartAndAtTheEndRegex)
    .escape(),
  body("password").trim().isLength({ min: 6 }).matches(passwordRegex),
  userControllers.signUp
);

router.post(
  "/login",
  body("email").trim().isEmail().normalizeEmail(),
  body("password").trim().isLength({ min: 6 }).matches(passwordRegex),
  userControllers.login
);

router.get("/logout", isAuth, userControllers.logout);

module.exports = router;
