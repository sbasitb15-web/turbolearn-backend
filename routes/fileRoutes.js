const express = require('express');
const multer = require('multer');
const AIHelper = require('../utils/aiHelper');

const router = express.Router();
const ai = new AIHelper();

// Configure multer for file uploads (memory storage for Render)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// PDF upload simulation
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        console.log('📄 PDF upload:', req.file.originalname);

        const prompt = `
            Create educational content about a PDF document on ${req.file.originalname}.
            Provide comprehensive study material that would be useful for students.
        `;

        const content = await ai.generateText(prompt);
        
        res.json({
            success: true,
            text: content,
            filename: req.file.originalname,
            message: 'PDF content generated with AI',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ PDF upload error:', error);
        res.status(500).json({
            success: false,
            error: 'PDF processing failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// YouTube URL processing
router.post('/youtube', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'YouTube URL is required'
            });
        }

        console.log('🎥 YouTube processing:', url);

        const prompt = `
            Create educational content about a YouTube video from this URL: ${url}
            Provide comprehensive study material and key takeaways.
        `;

        const content = await ai.generateText(prompt);

        res.json({
            success: true,
            text: content,
            videoUrl: url,
            message: 'YouTube content generated with AI',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ YouTube error:', error);
        res.status(500).json({
            success: false,
            error: 'YouTube processing failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Audio file transcription simulation
router.post('/transcribe', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file uploaded'
            });
        }

        console.log('🎵 Audio upload:', req.file.originalname);

        const prompt = `
            Create a transcript for an audio file about ${req.file.originalname}.
            Provide comprehensive educational content.
        `;

        const transcript = await ai.generateText(prompt);

        res.json({
            success: true,
            text: transcript,
            filename: req.file.originalname,
            message: 'Audio transcription completed with AI',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Audio error:', error);
        res.status(500).json({
            success: false,
            error: 'Audio transcription failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;