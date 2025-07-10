// middleware/verifySocketAuth.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const verifySocketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Access token missing"));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // Attach user data to socket
    next();
  } catch (err) {
    return next(new Error("Invalid or expired token"));
  }
};

module.exports = verifySocketAuth;
