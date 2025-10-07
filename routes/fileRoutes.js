const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const ytdl = require('ytdl-core');
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
        // Allow PDF and text files
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'text/plain' ||
            file.originalname.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and text files are allowed'), false);
        }
    }
});

// ✅ FIXED: PDF Upload and Processing
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
                
                // If no text extracted, try alternative method
                if (!extractedText || extractedText.trim().length === 0) {
                    console.log('⚠️ No text extracted, PDF might be image-based');
                    extractedText = 'This PDF appears to be image-based or contains no extractable text. Please use a text-based PDF or paste the content manually.';
                }
                
            } catch (pdfError) {
                console.error('❌ PDF Extraction Error:', pdfError.message);
                
                // Provide helpful error message
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
        } else {
            return res.status(400).json({
                success: false,
                error: 'Unsupported file type',
                message: 'Please upload PDF or text files only'
            });
        }

        // Validate extracted text
        if (!extractedText || extractedText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text content found',
                message: 'The file appears to be empty or contains no extractable text.'
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
                text: extractedText, // Return extracted text for frontend
                extractedLength: extractedText.length,
                type: type
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

        // Simple response for now
        res.json({
            success: true,
            message: 'Please paste the video transcript in the text area for AI processing.',
            type: type
        });

    } catch (error) {
        console.error('❌ YouTube Processing Error:', error);
        res.json({
            success: true,
            message: 'Please paste the video transcript in the text area above.',
            type: 'summary'
        });
    }
});

module.exports = router;