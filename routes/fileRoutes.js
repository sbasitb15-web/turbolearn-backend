const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const ytdl = require('ytdl-core');
const aiHelper = require('../utils/aiHelper'); // ✅ FIXED

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// PDF Upload and Processing
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const fileBuffer = req.file.buffer;
        
        // Extract text from PDF
        const pdfData = await pdfParse(fileBuffer);
        const extractedText = pdfData.text;

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text could be extracted from PDF'
            });
        }

        console.log('📄 PDF text extracted, length:', extractedText.length);

        // Process with AI based on type
        const { type = 'summary' } = req.body;
        let result;

        switch (type) {
            case 'summary':
                result = await aiHelper.generateSummary(extractedText);
                break;
            case 'flashcards':
                result = await aiHelper.generateFlashcards(extractedText);
                break;
            case 'quiz':
                result = await aiHelper.generateQuiz(extractedText);
                break;
            default:
                result = await aiHelper.generateSummary(extractedText);
        }

        res.json({
            success: true,
            [type]: result,
            extractedLength: extractedText.length,
            type: type
        });

    } catch (error) {
        console.error('❌ PDF Processing Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process PDF',
            message: error.message
        });
    }
});

// YouTube Processing
router.post('/youtube', async (req, res) => {
    try {
        const { url, type = 'summary' } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'YouTube URL is required'
            });
        }

        if (!ytdl.validateURL(url)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid YouTube URL'
            });
        }

        // Get video info (transcription would need additional service)
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title;
        const videoDescription = info.videoDetails.description;

        const videoText = `Title: ${videoTitle}\nDescription: ${videoDescription}`;

        console.log('🎥 YouTube video processed:', videoTitle);

        // Process with AI based on type
        let result;

        switch (type) {
            case 'summary':
                result = await aiHelper.generateSummary(videoText);
                break;
            case 'flashcards':
                result = await aiHelper.generateFlashcards(videoText);
                break;
            case 'quiz':
                result = await aiHelper.generateQuiz(videoText);
                break;
            default:
                result = await aiHelper.generateSummary(videoText);
        }

        res.json({
            success: true,
            [type]: result,
            videoTitle: videoTitle,
            type: type
        });

    } catch (error) {
        console.error('❌ YouTube Processing Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process YouTube video',
            message: error.message
        });
    }
});

module.exports = router;
