const express = require('express');
const router = express.Router();
const AIHelper = require('../utils/aiHelper');

const ai = new AIHelper();

// Generate summary - OpenAI GPT-4
router.post('/summary', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Text is required and cannot be empty'
            });
        }

        console.log('📝 OpenAI Summary requested - Length:', text.length);

        const prompt = `
            Create a comprehensive and well-structured summary of the following text for students.
            Make it educational, organized with clear sections, and highlight key concepts.
            
            TEXT:
            ${text.substring(0, 6000)}
            
            Provide a detailed summary that helps with studying.
        `;

        const summary = await ai.generateText(prompt, 'summary');
        
        res.json({
            success: true,
            summary: summary,
            originalLength: text.length,
            summaryLength: summary.length,
            aiService: 'OpenAI GPT-4',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Summary error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate summary',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Generate flashcards - OpenAI GPT-4
router.post('/flashcards', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Text is required and cannot be empty'
            });
        }

        console.log('📇 OpenAI Flashcards requested - Length:', text.length);

        const prompt = `
            Create 8-10 educational flashcards based on this text.
            Each should have a clear question and concise answer.
            
            TEXT:
            ${text.substring(0, 6000)}
            
            Return valid JSON format:
            [{"question": "Question?", "answer": "Answer."}]
        `;

        const response = await ai.generateText(prompt, 'flashcards');
        
        let flashcards;
        try {
            const cleanedResponse = response.replace(/```json|```/g, '').trim();
            flashcards = JSON.parse(cleanedResponse);
            
            if (!Array.isArray(flashcards)) {
                throw new Error('Invalid format');
            }
        } catch (parseError) {
            console.warn('JSON parse failed, using fallback');
            flashcards = [
                { 
                    question: "What is the main topic?", 
                    answer: "The text discusses important educational content." 
                },
                { 
                    question: "Key concepts covered?", 
                    answer: "Various important concepts are explained in the text." 
                }
            ];
        }
        
        res.json({
            success: true,
            flashcards: flashcards,
            count: flashcards.length,
            aiService: 'OpenAI GPT-4',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Flashcards error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate flashcards',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Generate quiz - OpenAI GPT-4
router.post('/quiz', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Text is required and cannot be empty'
            });
        }

        console.log('❓ OpenAI Quiz requested - Length:', text.length);

        const prompt = `
            Create a quiz with 6 multiple-choice questions based on this text.
            Each question should have 4 options and one correct answer.
            
            TEXT:
            ${text.substring(0, 6000)}
            
            Return valid JSON format:
            [{
                "question": "Question?",
                "options": ["A", "B", "C", "D"],
                "answer": "Correct Answer"
            }]
        `;

        const response = await ai.generateText(prompt, 'quiz');
        
        let quiz;
        try {
            const cleanedResponse = response.replace(/```json|```/g, '').trim();
            quiz = JSON.parse(cleanedResponse);
            
            if (!Array.isArray(quiz)) {
                throw new Error('Invalid format');
            }
        } catch (parseError) {
            console.warn('JSON parse failed, using fallback');
            quiz = [
                {
                    question: "What is the primary subject of this text?",
                    options: ["Subject A", "Subject B", "Subject C", "Subject D"],
                    answer: "Subject A"
                }
            ];
        }
        
        res.json({
            success: true,
            quiz: quiz,
            count: quiz.length,
            aiService: 'OpenAI GPT-4',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Quiz error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate quiz',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;