const express = require('express');
const multer = require('multer');
const aiHelper = require('../utils/aiHelper');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Only text files are supported currently'), false);
        }
    }
});

// ✅ SIMPLE TEXT FILE UPLOAD (No PDF dependencies)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        console.log('📄 Processing file:', {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        let extractedText = '';

        // Only handle text files for now
        if (req.file.mimetype === 'text/plain' || req.file.originalname.endsWith('.txt')) {
            // Text file - direct read
            extractedText = req.file.buffer.toString('utf8');
            console.log('📝 Text file processed, length:', extractedText.length);
        } else {
            return res.status(400).json({
                success: false,
                error: 'Only text files (.txt) are supported',
                message: 'Please upload .txt files or paste content directly. PDF support coming soon.'
            });
        }

        // Validate extracted text
        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text content found',
                message: 'The file appears to be empty.'
            });
        }

        console.log('📋 Extracted text preview:', extractedText.substring(0, 200) + '...');

        // Process with AI based on type
        const { type = 'summary' } = req.body;
        let result;

        try {
            console.log(`🤖 Processing with AI (${type})...`);
            
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

            console.log('✅ AI processing completed');

            res.json({
                success: true,
                [type]: result,
                text: extractedText,
                extractedLength: extractedText.length,
                type: type,
                source: 'text'
            });

        } catch (aiError) {
            console.error('❌ AI Processing Error:', aiError);
            res.status(500).json({
                success: false,
                error: 'AI processing failed',
                message: aiError.message
            });
        }

    } catch (error) {
        console.error('❌ File Processing Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process file',
            message: error.message
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

        console.log('🎥 Received YouTube URL:', url);

        // Simple response - user needs to paste transcript
        res.json({
            success: true,
            message: 'Please paste the video transcript in the text area below for AI processing.',
            instructions: 'Copy the transcript from YouTube and paste it in the text input area, then generate your study materials.',
            type: type,
            source: 'youtube'
        });

    } catch (error) {
        console.error('❌ YouTube Processing Error:', error);
        res.json({
            success: true,
            message: 'Please paste the YouTube video transcript in the text area above for AI processing.',
            type: 'summary',
            source: 'youtube'
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

        console.log('📝 Processing summary for text length:', text.length);
        const result = await aiHelper.generateSummary(text);
        
        res.json({
            success: true,
            summary: result,
            source: 'direct_text',
            textLength: text.length
        });

    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate summary: ' + error.message
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

        console.log('🎴 Processing flashcards for text length:', text.length);
        const result = await aiHelper.generateFlashcards(text);
        
        res.json({
            success: true,
            flashcards: result,
            source: 'direct_text',
            textLength: text.length
        });

    } catch (error) {
        console.error('Flashcards error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate flashcards: ' + error.message
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

        console.log('❓ Processing quiz for text length:', text.length);
        const result = await aiHelper.generateQuiz(text);
        
        res.json({
            success: true,
            quiz: result,
            source: 'direct_text',
            textLength: text.length
        });

    } catch (error) {
        console.error('Quiz error:', error);
        res.status(500).render('error', { error: error.message });
    }
});

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'TurboLearn Backend',
        timestamp: new Date().toISOString(),
        features: ['Text Processing', 'AI Content Generation', 'File Upload (.txt)'],
        note: 'PDF support temporarily disabled for stability'
    });
});

// Debug endpoint
router.get('/debug', (req, res) => {
    res.json({
        status: 'operational',
        version: '1.0.0',
        features: {
            text_processing: 'enabled',
            file_upload: 'text_only',
            ai: 'enabled'
        }
    });
});

module.exports = router;
