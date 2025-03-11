const express = require("express");
const router = express.Router();
const db = require("../config");
const authenticateToken = require("../middleware/auth");

// Middleware to check for an optional token
const optionalAuthenticate = (req, res, next) => {
  if (req.headers.authorization) {
    return authenticateToken(req, res, next);
  }
  next(); // Proceed even if there's no token
};

// Post a comment (Guests and Registered Users)
router.post("/:movieId/comment", optionalAuthenticate, async (req, res) => {
  const { comment, guest_name } = req.body;
  const movieId = req.params.movieId;
  const userId = req.user ? req.user.id : null;

  if (!comment) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  let query, values;

  if (userId) {
    // Registered user
    query = `
      INSERT INTO comments (movie_id, user_id, guest_name, comment) 
      VALUES ($1, $2, NULL, $3) RETURNING id
    `;
    values = [movieId, userId, comment];
  } else {
    // Guest user
    query = `
      INSERT INTO comments (movie_id, user_id, guest_name, comment) 
      VALUES ($1, NULL, $2, $3) RETURNING id
    `;
    values = [movieId, guest_name || "Anonymous", comment];
  }

  try {
    const result = await db.query(query, values);
    res.status(201).json({
      message: "Comment added successfully!",
      commentId: result.rows[0].id,
    });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Get comments for a movie (Anyone can access)
router.get("/:movieId/comments", async (req, res) => {
  const movieId = req.params.movieId;

  const query = `
    SELECT comments.id, comments.comment, 
           users.username AS registered_user, 
           comments.guest_name, comments.created_at 
    FROM comments
    LEFT JOIN users ON comments.user_id = users.id
    WHERE comments.movie_id = $1 
    ORDER BY comments.created_at DESC
  `;

  try {
    const results = await db.query(query, [movieId]);

    const formattedComments = results.rows.map((comment) => ({
      id: comment.id,
      comment: comment.comment,
      posted_by: comment.registered_user || comment.guest_name || "Anonymous",
      created_at: comment.created_at,
    }));

    res.status(200).json(formattedComments);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});

module.exports = router;
