const OpenAI = require('openai');

class AIHelper {
    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY;
        
        if (!this.apiKey) {
            console.error('❌ OPENAI_API_KEY is missing');
            throw new Error('OpenAI API key is not configured');
        }
        
        try {
            this.openai = new OpenAI({
                apiKey: this.apiKey
            });
            console.log('✅ OpenAI GPT-4 initialized successfully');
        } catch (error) {
            console.error('❌ OpenAI initialization failed:', error);
            throw new Error(`OpenAI initialization failed: ${error.message}`);
        }
    }

    async generateText(prompt, type = 'general') {
        try {
            console.log(`🔮 Sending ${type} request to OpenAI...`);
            
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { 
                        role: "system", 
                        content: this.getSystemMessage(type)
                    },
                    { role: "user", content: prompt }
                ],
                max_tokens: 2000,
                temperature: 0.7
            });
            
            const text = completion.choices[0].message.content;
            console.log(`✅ OpenAI ${type} response received - Length: ${text.length}`);
            
            return text;
        } catch (error) {
            console.error('❌ OpenAI API Error:', error);
            
            if (error.code === 'invalid_api_key') {
                throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
            } else if (error.code === 'insufficient_quota') {
                throw new Error('OpenAI API quota exceeded. Please check your billing details.');
            } else {
                throw new Error(`OpenAI API error: ${error.message}`);
            }
        }
    }

    getSystemMessage(type) {
        const messages = {
            summary: "You are an expert educational assistant. Create comprehensive, well-structured summaries with clear sections and bullet points. Focus on key concepts and make it easy for students to study.",
            flashcards: "You are a flashcard creation expert. Create educational flashcards with clear questions and concise answers. Focus on testing understanding of key concepts. Always return valid JSON format.",
            quiz: "You are a quiz creation expert. Create challenging multiple-choice questions with 4 options each. Ensure questions test comprehension and application. Always return valid JSON format.",
            general: "You are an AI educational assistant that helps students create study materials from various content sources."
        };
        
        return messages[type] || messages.general;
    }
}

module.exports = AIHelper;