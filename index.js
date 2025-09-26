import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// ✅ Route: Generate Summary
app.post("/generate-summary", async (req, res) => {
  try {
    const { text } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Summarize this clearly:\n\n${text}` }] }],
        }),
      }
    );

    const data = await response.json();

    // ✅ Multiple fallback options
    const summary =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.candidates?.[0]?.output ||
      JSON.stringify(data, null, 2) ||
      "No summary generated";

    res.json({ summary });
  } catch (error) {
    console.error("Error in /generate-summary:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// ✅ Health check route
app.get("/", (req, res) => {
  res.send(
    `✅ Turbolean Backend is running with GEMINI API key: ${
      process.env.GEMINI_API_KEY ? "Loaded" : "Missing"
    }`
  );
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
