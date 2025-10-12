const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { YoutubeTranscript } = require("youtube-transcript");

const router = express.Router();

// ✅ Memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// 📄 PDF Upload & Extract Route
router.post("/extract/pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No PDF file uploaded" });
    }

    const data = await pdfParse(req.file.buffer);
    if (!data.text || data.text.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Unable to extract text from this PDF." });
    }

    return res.json({ success: true, text: data.text.trim(), pages: data.numpages });
  } catch (error) {
    console.error("PDF Extract Error:", error);
    return res.status(500).json({ success: false, error: "PDF extraction failed." });
  }
});

// 📺 YouTube Transcript Extract Route
router.post("/extract/youtube", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: "YouTube URL is required" });

    const videoId = getYouTubeId(url);
    if (!videoId) return res.status(400).json({ success: false, error: "Invalid YouTube URL" });

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ success: false, error: "No transcript available for this video." });
    }

    const text = transcript.map(item => item.text).join(" ");
    return res.json({ success: true, text, videoId });
  } catch (error) {
    console.error("YouTube Extract Error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch YouTube transcript." });
  }
});

// 📎 Helper: Extract YouTube video ID
function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
    return null;
  } catch {
    return null;
  }
}

module.exports = router;
