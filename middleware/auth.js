const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

const SECRET_KEY = process.env.SECRET_KEY; // Use environment variable

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]; // Extract only the token part

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded; // Attach user data to request if valid
    } catch (error) {
      return res.status(401).json({ message: "Invalid token." });
    }
  }

  next(); // Proceed even if there's no token (for guests)
};
