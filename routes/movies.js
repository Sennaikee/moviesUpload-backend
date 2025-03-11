const express = require("express");
const router = express.Router();
const pool = require("../config"); // PostgreSQL connection
const upload = require("../middleware/upload");
const authenticateToken = require("../middleware/auth"); // Authentication middleware

// Upload a movie (Only for registered users)
router.post(
  "/upload",
  authenticateToken,
  upload.single("cover"),
  async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id; // Extract from JWT

    if (!title || !description || !req.file) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const coverUrl = req.file.path; // Get Cloudinary URL

    try {
      const query = `
        INSERT INTO movies (title, description, cover, user_id) 
        VALUES ($1, $2, $3, $4) RETURNING id
      `;
      const { rows } = await pool.query(query, [
        title,
        description,
        coverUrl,
        userId,
      ]);

      res.status(201).json({
        message: "Movie uploaded successfully!",
        movieId: rows[0].id,
        coverUrl,
      });
    } catch (err) {
      res.status(500).json({ message: "Database error", error: err });
    }
  }
);

// Like a movie (Only for registered users)
router.post("/:id/like", authenticateToken, async (req, res) => {
  const { id: movieId } = req.params;
  const userId = req.user.id;

  try {
    const checkQuery = `
      SELECT * FROM likes_dislikes WHERE user_id = $1 AND movie_id = $2
    `;
    const { rows } = await pool.query(checkQuery, [userId, movieId]);

    if (rows.length > 0) {
      if (rows[0].action === "like") {
        return res
          .status(400)
          .json({ message: "You have already liked this movie!" });
      } else {
        const updateQuery = `
          UPDATE likes_dislikes SET action = 'like' WHERE user_id = $1 AND movie_id = $2
        `;
        await pool.query(updateQuery, [userId, movieId]);
        return res
          .status(200)
          .json({ message: "You changed your vote to like!" });
      }
    }

    // Insert new like
    const insertQuery = `
      INSERT INTO likes_dislikes (user_id, movie_id, action) VALUES ($1, $2, 'like')
    `;
    await pool.query(insertQuery, [userId, movieId]);

    res.status(200).json({ message: "Movie liked!" });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Dislike a movie (Only for registered users)
router.post("/:id/dislike", authenticateToken, async (req, res) => {
  const { id: movieId } = req.params;
  const userId = req.user.id;

  try {
    const checkQuery = `
      SELECT * FROM likes_dislikes WHERE user_id = $1 AND movie_id = $2
    `;
    const { rows } = await pool.query(checkQuery, [userId, movieId]);

    if (rows.length > 0) {
      if (rows[0].action === "dislike") {
        return res
          .status(400)
          .json({ message: "You have already disliked this movie!" });
      } else {
        const updateQuery = `
          UPDATE likes_dislikes SET action = 'dislike' WHERE user_id = $1 AND movie_id = $2
        `;
        await pool.query(updateQuery, [userId, movieId]);
        return res
          .status(200)
          .json({ message: "You changed your vote to dislike!" });
      }
    }

    // Insert new dislike
    const insertQuery = `
      INSERT INTO likes_dislikes (user_id, movie_id, action) VALUES ($1, $2, 'dislike')
    `;
    await pool.query(insertQuery, [userId, movieId]);

    res.status(200).json({ message: "Movie disliked!" });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Get all movies (Anyone can access)
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT movies.*, 
        (SELECT COUNT(*) FROM likes_dislikes WHERE movie_id = movies.id AND action = 'like') AS likes,
        (SELECT COUNT(*) FROM likes_dislikes WHERE movie_id = movies.id AND action = 'dislike') AS dislikes,
        users.username AS uploaded_by
      FROM movies
      LEFT JOIN users ON movies.user_id = users.id
      ORDER BY movies.created_at DESC
    `;

    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});

// hii
module.exports = router;
