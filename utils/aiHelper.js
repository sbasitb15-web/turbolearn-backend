const OpenAI = require('openai');

class AIHelper {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY || process.env.DEEPSEEK_API_KEY;
        
        if (!this.apiKey) {
            console.warn('⚠️ No API key found - Please set GROQ_API_KEY or DEEPSEEK_API_KEY');
        }
        
        // Groq setup - SUPER FAST & FREE
        this.client = new OpenAI({
            apiKey: this.apiKey,
            baseURL: "https://api.groq.com/openai/v1"
        });
        
        this.modelName = "llama-3.1-8b-instant"; // Groq free & fast model
        
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // 1 second - Groq is very fast
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
                throw new Error('Groq API key not configured');
            }

            const completion = await this.client.chat.completions.create({
                model: this.modelName,
                messages: [
                    { 
                        role: "user", 
                        content: prompt 
                    }
                ],
                max_tokens: 1024,
                temperature: 0.7
            });

            this.lastRequestTime = Date.now();
            return completion.choices[0].message.content;

        } catch (error) {
            console.error('❌ Groq AI Error:', error);
            
            if (error.status === 429) {
                throw new Error('Rate limit exceeded. Please wait 10 seconds and try again.');
            }
            
            if (error.status === 401) {
                throw new Error('Invalid API key. Please check Groq configuration.');
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