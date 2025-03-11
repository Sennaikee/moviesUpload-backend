const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // Convert to string
  port: Number(process.env.DB_PORT), // Convert to number
});

pool
  .connect()
  .then(() => console.log(" Database connected successfully"))
  .catch((err) => console.error(" Database connection error:", err));

console.log("Database Password:", process.env.DB_PASSWORD);


module.exports = pool;
