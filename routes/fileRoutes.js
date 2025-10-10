const express = require('express');
const multer = require('multer');
const aiHelper = require('../utils/aiHelper');

const router = express.Router();

// Simple multer configuration
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// ✅ SIMPLE PDF UPLOAD (Text files only for now)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        console.log('📄 Processing file:', req.file.originalname);

        let extractedText = '';

        // Only handle text files initially
        if (req.file.mimetype === 'text/plain' || req.file.originalname.endsWith('.txt')) {
            extractedText = req.file.buffer.toString('utf8');
            console.log('📝 Text file processed, length:', extractedText.length);
        } else {
            return res.status(400).json({
                success: false,
                error: 'Please upload text files (.txt) for now',
                message: 'PDF support will be added in the next update'
            });
        }

        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text content found'
            });
        }

        // Process with AI
        const { type = 'summary' } = req.body;
        let result;

        try {
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
                text: extractedText,
                extractedLength: extractedText.length,
                type: type,
                source: 'text'
            });

        } catch (aiError) {
            console.error('AI Processing Error:', aiError);
            res.status(500).json({
                success: false,
                error: 'AI processing failed'
            });
        }

    } catch (error) {
        console.error('File Processing Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process file'
        });
    }
});

// ✅ SIMPLE YOUTUBE PROCESSING
router.post('/youtube', async (req, res) => {
    try {
        const { url, type = 'summary' } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'YouTube URL is required'
            });
        }

        console.log('🎥 YouTube URL received:', url);

        // For now, return instructions
        res.json({
            success: true,
            message: 'Please paste the YouTube video transcript in the text area below.',
            instructions: 'Copy transcript from YouTube and paste in text input',
            type: type,
            source: 'youtube'
        });

    } catch (error) {
        console.error('YouTube Processing Error:', error);
        res.json({
            success: true,
            message: 'Please paste the YouTube transcript in the text area.',
            type: 'summary'
        });
    }
});

// ✅ DIRECT TEXT PROCESSING (This works!)
router.post('/summary', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        const result = await aiHelper.generateSummary(text);
        
        res.json({
            success: true,
            summary: result,
            source: 'direct_text'
        });

    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate summary'
        });
    }
});

router.post('/flashcards', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        const result = await aiHelper.generateFlashcards(text);
        
        res.json({
            success: true,
            flashcards: result,
            source: 'direct_text'
        });

    } catch (error) {
        console.error('Flashcards error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate flashcards'
        });
    }
});

router.post('/quiz', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        const result = await aiHelper.generateQuiz(text);
        
        res.json({
            success: true,
            quiz: result,
            source: 'direct_text'
        });

    } catch (error) {
        console.error('Quiz error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate quiz'
        });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'TurboLearn Backend',
        timestamp: new Date().toISOString(),
        features: ['Text Processing', 'AI Content Generation']
    });
});

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> b84d94f12fe015722344d40b28bcd8262903fed0
