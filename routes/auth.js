const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config");
require("dotenv").config();
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY; // Change this to an environment variable


// User Registration
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const query =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(query, [username, email, hashedPassword], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(201).json({ message: "User registered successfully!" });
  });
});



// User Login - Generate Token
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful!", token });
  });
});

module.exports = router;


