const express = require('express');
const AIHelper = require('../utils/aiHelper');

const router = express.Router();
const ai = new AIHelper();

// Generate summary
router.post('/summary', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text content is required'
            });
        }

        console.log('📝 Generating summary for text length:', text.length);
        
        const summary = await ai.generateSummary(text);
        
        res.json({
            success: true,
            summary: summary,
            aiService: 'OpenRouter BYOK',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Summary generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate summary',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Generate flashcards
router.post('/flashcards', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text content is required'
            });
        }

        console.log('🎴 Generating flashcards for text length:', text.length);
        
        const flashcards = await ai.generateFlashcards(text);
        
        res.json({
            success: true,
            flashcards: flashcards,
            aiService: 'OpenRouter BYOK', 
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Flashcards generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate flashcards',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Generate quiz
router.post('/quiz', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text content is required'
            });
        }

        console.log('❓ Generating quiz for text length:', text.length);
        
        const quiz = await ai.generateQuiz(text);
        
        res.json({
            success: true,
            quiz: quiz,
            aiService: 'OpenRouter BYOK',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Quiz generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate quiz',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
