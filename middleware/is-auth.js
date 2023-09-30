const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../util/jwt-secret");

module.exports = (req, res, next) => {
  const token = req.headers.cookie;

  if (!token) {
    const error = new Error("Not authenticated");
    error.status = 401;
    throw error;
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, jwtSecret);
  } catch (error) {
    error.status = 500;
    throw error;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.status = 401;
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
};
