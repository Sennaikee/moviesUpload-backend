const express = require("express");
const router = express.Router();
const db = require("../config");
const auth = require("../middleware/auth");

// Post a comment
router.post("/:movieId/comment", auth, (req, res) => {
  const { comment, guest_name } = req.body;
  const movieId = req.params.movieId;
  const userId = req.user ? req.user.id : null; // Get user ID if authenticated

  if (!comment) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  let query, values;

  if (userId) {
    query =
      "INSERT INTO comments (movie_id, user_id, guest_name, comment) VALUES (?, ?, NULL, ?)";
    values = [movieId, userId, comment];
  } else {
    query =
      "INSERT INTO comments (movie_id, user_id, guest_name, comment) VALUES (?, NULL, ?, ?)";
    values = [movieId, guest_name || "Anonymous", comment];
  }

  db.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(201).json({ message: "Comment added successfully!" });
  });
});


// Get comments for a movie
router.get("/:movieId/comments", (req, res) => {
  const movieId = req.params.movieId;

  const query = `
    SELECT comments.id, comments.comment, 
           users.username AS registered_user, 
           comments.guest_name, comments.created_at 
    FROM comments
    LEFT JOIN users ON comments.user_id = users.id
    WHERE comments.movie_id = ? 
    ORDER BY comments.created_at DESC`;

  db.query(query, [movieId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    const formattedComments = results.map((comment) => ({
      id: comment.id,
      comment: comment.comment,
      posted_by: comment.registered_user || comment.guest_name || "Anonymous",
      created_at: comment.created_at,
    }));

    res.status(200).json(formattedComments);
  });
});


module.exports = router;
