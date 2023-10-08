const { validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { jwtSecret } = require("../util/jwt-secret");

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const data = matchedData(req);

  bcrypt
    .hash(data.password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      return user.save();
    })
    .then((user) => {
      res
        .status(201)
        .json({ message: "User created", userId: user._id.toString() });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const data = matchedData(req);
  let foundUser;

  User.findOne({ email: data.email })
    .then((user) => {
      if (!user) {
        const error = new Error("User does not exist");
        error.statusCode = 401;
        error.data = errors.array();
        throw error;
      }

      foundUser = user;

      return bcrypt.compare(data.password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Password is wrong");
        error.statusCode = 401;
        error.data = errors.array();
        throw error;
      }

      const token = jwt.sign(
        { email: foundUser.email, userId: foundUser._id.toString() },
        jwtSecret,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: process.env.COOKIE_SETTINGS_HTTP_ONLY === "true",
        secure: process.env.COOKIE_SETTINGS_SECURE === "true",
      });

      res.status(200).json({
        token: token,
        user: {
          userId: foundUser._id.toString(),
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
        },
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

exports.logout = (req, res, next) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
