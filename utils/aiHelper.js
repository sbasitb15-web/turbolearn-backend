const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIHelper {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        if (!this.apiKey) {
            console.warn('⚠️ OPENROUTER_API_KEY not found');
        }
        this.genAI = new GoogleGenerativeAI(this.apiKey);
    }

    async generateText(prompt, type = 'summary') {
        try {
            if (!this.apiKey) {
                throw new Error('OpenRouter API key not configured');
            }

            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash-exp" 
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error('❌ AI Helper Error:', error);
            throw new Error(`AI service error: ${error.message}`);
        }
    }

    async generateSummary(text) {
        const prompt = `Create a comprehensive and well-structured summary of the following text. Make it educational and easy to understand:\n\n${text}`;
        return await this.generateText(prompt, 'summary');
    }

    async generateFlashcards(text) {
        const prompt = `Create educational flashcards from the following text. Format each flashcard as "Question | Answer". Create 5-10 flashcards:\n\n${text}`;
        return await this.generateText(prompt, 'flashcards');
    }

    async generateQuiz(text) {
        const prompt = `Create a quiz with multiple choice questions from the following text. Format each question as "Question? A) Option1 B) Option2 C) Option3 D) Option4 | CorrectAnswer". Create 5 questions:\n\n${text}`;
        return await this.generateText(prompt, 'quiz');
    }
}

module.exports = new AIHelper();