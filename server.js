// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());
// app.use("/uploads", express.static("uploads")); // Serve images

// const movieRoutes = require("./routes/movies");
// const commentRoutes = require("./routes/comments");

// app.use("/api/movies", movieRoutes);
// app.use("/api/comments", commentRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/movies", require("./routes/movies"));
app.use("/api/comments", require("./routes/comments"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
