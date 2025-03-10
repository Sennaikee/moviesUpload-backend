const express = require("express");
const router = express.Router();
const db = require("../config");
const upload = require("../middleware/upload");
const  authenticateToken  = require("../middleware/auth"); // Import authentication middleware

// Upload a movie (Only for registered users)
router.post(
  "/upload",
  authenticateToken,
  upload.single("cover"),
  (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id; // Extract from JWT
    if (!title || !description || !req.file) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const coverUrl = req.file.path; // Get Cloudinary URL
    const query =
      "INSERT INTO movies (title, description, cover, user_id) VALUES (?, ?, ?, ?)";
    db.query(query, [title, description, coverUrl, userId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(201).json({
        message: "Movie uploaded successfully!",
        movieId: result.insertId,
        coverUrl,
      });
    });
  }
);


// Like a movie (Only for registered users)
router.post("/:id/like", authenticateToken, (req, res) => {
  const { id: movieId } = req.params;
  const userId = req.user.id; // Get user ID from JWT

  const checkQuery =
    "SELECT * FROM likes_dislikes WHERE user_id = ? AND movie_id = ?";
  db.query(checkQuery, [userId, movieId], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });

    if (results.length > 0) {
      // User has already liked or disliked this movie
      if (results[0].action === "like") {
        return res
          .status(400)
          .json({ message: "You have already liked this movie!" });
      } else {
        // Update dislike → like
        const updateQuery =
          "UPDATE likes_dislikes SET action = 'like' WHERE user_id = ? AND movie_id = ?";
        db.query(updateQuery, [userId, movieId], (updateErr) => {
          if (updateErr)
            return res
              .status(500)
              .json({ message: "Database error", error: updateErr });
          res.status(200).json({ message: "You changed your vote to like!" });
        });
      }
    } else {
      // Insert new like
      const insertQuery =
        "INSERT INTO likes_dislikes (user_id, movie_id, action) VALUES (?, ?, 'like')";
      db.query(insertQuery, [userId, movieId], (insertErr) => {
        if (insertErr)
          return res
            .status(500)
            .json({ message: "Database error", error: insertErr });
        res.status(200).json({ message: "Movie liked!" });
      });
    }
  });
});


// Dislike a movie (Only for registered users)
router.post("/:id/dislike", authenticateToken, (req, res) => {
  const { id: movieId } = req.params;
  const userId = req.user.id; // Get user ID from JWT

  const checkQuery =
    "SELECT * FROM likes_dislikes WHERE user_id = ? AND movie_id = ?";
  db.query(checkQuery, [userId, movieId], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });

    if (results.length > 0) {
      // User has already liked or disliked this movie
      if (results[0].action === "dislike") {
        return res
          .status(400)
          .json({ message: "You have already disliked this movie!" });
      } else {
        // Update like → dislike
        const updateQuery =
          "UPDATE likes_dislikes SET action = 'dislike' WHERE user_id = ? AND movie_id = ?";
        db.query(updateQuery, [userId, movieId], (updateErr) => {
          if (updateErr)
            return res
              .status(500)
              .json({ message: "Database error", error: updateErr });
          res
            .status(200)
            .json({ message: "You changed your vote to dislike!" });
        });
      }
    } else {
      // Insert new dislike
      const insertQuery =
        "INSERT INTO likes_dislikes (user_id, movie_id, action) VALUES (?, ?, 'dislike')";
      db.query(insertQuery, [userId, movieId], (insertErr) => {
        if (insertErr)
          return res
            .status(500)
            .json({ message: "Database error", error: insertErr });
        res.status(200).json({ message: "Movie disliked!" });
      });
    }
  });
});


// Get all movies (Anyone can access)
router.get("/", (req, res) => {
  const query = `
    SELECT movies.*, 
      (SELECT COUNT(*) FROM likes_dislikes WHERE movie_id = movies.id AND action = 'like') AS likes,
      (SELECT COUNT(*) FROM likes_dislikes WHERE movie_id = movies.id AND action = 'dislike') AS dislikes,
      users.username AS uploaded_by
    FROM movies
    LEFT JOIN users ON movies.user_id = users.id
    ORDER BY movies.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    res.status(200).json(results);
  });
});



module.exports = router;
