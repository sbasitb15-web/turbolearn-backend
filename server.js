const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Existing Routes (example)
const summaryRoutes = require("./routes/summaryRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const quizRoutes = require("./routes/quizRoutes");

// ✅ 👉 NEW: Import extract routes (PDF & YouTube)
const extractRoutes = require("./routes/extractRoutes");

// ✅ Use existing routes
app.use("/api/summary", summaryRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/quiz", quizRoutes);

// ✅ 👉 NEW: Add extract routes here
app.use("/api", extractRoutes);

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TurboLearn backend is running 🚀",
    endpoints: [
      "/api/summary",
      "/api/flashcards",
      "/api/quiz",
      "/api/extract/pdf",
      "/api/extract/youtube"
    ]
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
