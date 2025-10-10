const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const ytdl = require('ytdl-core');
const { YoutubeTranscript } = require('youtube-transcript');
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
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// ✅ PDF Upload and Processing
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const fileBuffer = req.file.buffer;
        
        console.log('📄 Processing PDF:', {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        let extractedText = '';

        // PDF processing with enhanced error handling
        try {
            console.log('🔧 Extracting text from PDF...');
            const pdfData = await pdfParse(fileBuffer);
            extractedText = pdfData.text;
            console.log('✅ PDF text extracted, length:', extractedText.length);
            
            // If no text extracted, provide helpful message
            if (!extractedText || extractedText.trim().length === 0) {
                console.log('⚠️ No text extracted, PDF might be image-based');
                extractedText = 'This PDF appears to be image-based or contains no extractable text. Please use a text-based PDF or paste the content manually.';
            }
            
        } catch (pdfError) {
            console.error('❌ PDF Extraction Error:', pdfError.message);
            
            if (pdfError.message.includes('Invalid PDF')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid PDF file',
                    message: 'The PDF file may be corrupted, password protected, or in an unsupported format.'
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: 'PDF processing failed',
                    message: 'Unable to read the PDF file. Please try a different file or paste the text directly.'
                });
            }
        }

        // Validate extracted text
        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text content found',
                message: 'The PDF appears to be empty or contains no extractable text.'
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
                source: 'pdf'
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

// ✅ YouTube Video Processing
router.post('/youtube', async (req, res) => {
    try {
        const { url, type = 'summary' } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'YouTube URL is required'
            });
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid YouTube URL',
                message: 'Please provide a valid YouTube video URL'
            });
        }

        console.log('🎥 Processing YouTube video:', url);

        try {
            // Get video transcript
            const transcript = await YoutubeTranscript.fetchTranscript(url);
            
            if (!transcript || transcript.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No transcript available',
                    message: 'This YouTube video does not have captions/transcript available. Please try a different video or paste the content manually.'
                });
            }

            // Combine transcript text
            const transcriptText = transcript.map(entry => entry.text).join(' ');
            console.log('✅ YouTube transcript extracted, length:', transcriptText.length);

            // Process with AI
            let result;
            console.log(`🤖 Processing YouTube content with AI (${type})...`);

            switch (type) {
                case 'summary':
                    result = await aiHelper.generateSummary(transcriptText);
                    break;
                case 'flashcards':
                    result = await aiHelper.generateFlashcards(transcriptText);
                    break;
                case 'quiz':
                    result = await aiHelper.generateQuiz(transcriptText);
                    break;
                default:
                    result = await aiHelper.generateSummary(transcriptText);
            }

            console.log('✅ YouTube AI processing completed');

            res.json({
                success: true,
                [type]: result,
                text: transcriptText,
                extractedLength: transcriptText.length,
                type: type,
                source: 'youtube',
                videoUrl: url
            });

        } catch (transcriptError) {
            console.error('❌ YouTube Transcript Error:', transcriptError);
            
            return res.status(400).json({
                success: false,
                error: 'Transcript extraction failed',
                message: 'Unable to extract transcript from this YouTube video. The video may not have captions enabled.'
            });
        }

    } catch (error) {
        console.error('❌ YouTube Processing Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process YouTube video',
            message: error.message
        });
    }
});

// ✅ Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'TurboLearn Backend',
        timestamp: new Date().toISOString(),
        features: ['PDF Processing', 'YouTube Integration', 'AI Content Generation']
    });
});

// ✅ Debug endpoint
router.get('/debug', (req, res) => {
    res.json({
        status: 'operational',
        version: '1.0.0',
        features: {
            pdf: 'enabled',
            youtube: 'enabled',
            ai: 'enabled'
        },
        dependencies: {
            'pdf-parse': 'installed',
            'ytdl-core': 'installed',
            'youtube-transcript': 'installed'
        }
    });
});

module.exports = router;
