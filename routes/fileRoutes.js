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
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'text/plain' ||
            file.originalname.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and text files are allowed'), false);
        }
    }
});

// ✅ WORKING PDF UPLOAD
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const fileBuffer = req.file.buffer;
        
        console.log('📄 Processing file:', {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        let extractedText = '';

        // Handle different file types
        if (req.file.mimetype === 'text/plain' || req.file.originalname.endsWith('.txt')) {
            // Text file - direct read
            extractedText = fileBuffer.toString('utf8');
            console.log('📝 Text file processed, length:', extractedText.length);
            
        } else if (req.file.mimetype === 'application/pdf') {
            // PDF file - use pdf-parse
            try {
                console.log('🔧 Extracting text from PDF...');
                const pdfData = await pdfParse(fileBuffer);
                extractedText = pdfData.text;
                console.log('✅ PDF text extracted, length:', extractedText.length);
                
                if (!extractedText || extractedText.trim().length === 0) {
                    extractedText = 'This PDF appears to be image-based or contains no extractable text. Please use a text-based PDF or paste the content manually.';
                }
                
            } catch (pdfError) {
                console.error('❌ PDF Extraction Error:', pdfError);
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
                message: 'The file appears to be empty or contains no extractable text.'
            });
        }

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
                source: req.file.mimetype === 'application/pdf' ? 'pdf' : 'text'
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

// ✅ WORKING YOUTUBE PROCESSING
router.post('/youtube', async (req, res) => {
    try {
        const { url, type = 'summary' } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'YouTube URL is required'
            });
        }

        console.log('🎥 Processing YouTube video:', url);

        try {
            // Get video info first
            const videoInfo = await ytdl.getInfo(url);
            const videoTitle = videoInfo.videoDetails.title;
            
            // Get transcript
            const transcript = await YoutubeTranscript.fetchTranscript(url);
            
            if (!transcript || transcript.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No transcript available',
                    message: 'This YouTube video does not have captions/transcript available.'
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
                videoTitle: videoTitle,
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

// Direct text processing routes (keep these)
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
        features: ['PDF Processing', 'YouTube Integration', 'AI Content Generation']
    });
});

module.exports = router;
