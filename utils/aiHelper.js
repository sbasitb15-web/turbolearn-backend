const OpenAI = require('openai');

class AIHelper {
    constructor() {
        this.apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY;
        if (!this.apiKey) {
            console.warn('⚠️ DEEPSEEK_API_KEY not found');
        }
        
        this.openai = new OpenAI({
            apiKey: this.apiKey,
            baseURL: "https://api.deepseek.com/v1" // DeepSeek API endpoint
        });
        
        this.lastRequestTime = 0;
        this.minRequestInterval = 3000; // 3 seconds between requests
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async generateText(prompt, type = 'summary') {
        try {
            // Rate limiting
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.minRequestInterval) {
                await this.delay(this.minRequestInterval - timeSinceLastRequest);
            }

            if (!this.apiKey) {
                throw new Error('DeepSeek API key not configured');
            }

            const completion = await this.openai.chat.completions.create({
                model: "deepseek-chat", // DeepSeek free model
                messages: [
                    { 
                        role: "user", 
                        content: prompt 
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            });

            this.lastRequestTime = Date.now();
            return completion.choices[0].message.content;

        } catch (error) {
            console.error('❌ DeepSeek AI Error:', error);
            
            // Handle rate limit specifically
            if (error.status === 429) {
                throw new Error('Rate limit exceeded. Please wait 10 seconds and try again.');
            }
            
            throw new Error(`AI service error: ${error.message}`);
        }
    }

    async generateSummary(text) {
        const prompt = `Create a comprehensive and well-structured summary of the following text. Make it educational and easy to understand. Return only the summary without any additional text:\n\n${text}`;
        return await this.generateText(prompt, 'summary');
    }

    async generateFlashcards(text) {
        const prompt = `Create educational flashcards from the following text. Format each flashcard as "Question | Answer". Create 5-10 flashcards. Return only the flashcards without any additional text:\n\n${text}`;
        return await this.generateText(prompt, 'flashcards');
    }

    async generateQuiz(text) {
        const prompt = `Create a quiz with multiple choice questions from the following text. Format each question as "Question? A) Option1 B) Option2 C) Option3 D) Option4 | CorrectAnswer". Create 5 questions. Return only the quiz questions without any additional text:\n\n${text}`;
        return await this.generateText(prompt, 'quiz');
    }
}

module.exports = new AIHelper();
