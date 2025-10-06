const express = require('express');
const router = express.Router();
const aiHelper = require('../utils/aiHelper');

// Summary route
router.post('/summary', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        console.log('📝 Generating summary for text length:', text.length);
        const summary = await aiHelper.generateSummary(text);
        
        res.json({
            success: true,
            summary: summary,
            type: 'summary'
        });

    } catch (error) {
        console.error('❌ Summary Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate summary',
            message: error.message
        });
    }
});

// Flashcards route
router.post('/flashcards', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        console.log('📚 Generating flashcards for text length:', text.length);
        const flashcards = await aiHelper.generateFlashcards(text);
        
        res.json({
            success: true,
            flashcards: flashcards,
            type: 'flashcards'
        });

    } catch (error) {
        console.error('❌ Flashcards Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate flashcards',
            message: error.message
        });
    }
});

// Quiz route
router.post('/quiz', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        console.log('❓ Generating quiz for text length:', text.length);
        const quiz = await aiHelper.generateQuiz(text);
        
        res.json({
            success: true,
            quiz: quiz,
            type: 'quiz'
        });

    } catch (error) {
        console.error('❌ Quiz Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate quiz',
            message: error.message
        });
    }
});

module.exports = router;