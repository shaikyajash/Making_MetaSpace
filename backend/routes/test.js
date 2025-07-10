// routes/test.js
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";


router.get("/", (req, res) => {
  res.status(200).json({ message: "Test route is working!" });
});
router.get("/test-auth", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({
      message: "✅ JWT Verified Successfully",
      user: decoded,
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
});

module.exports = router;
