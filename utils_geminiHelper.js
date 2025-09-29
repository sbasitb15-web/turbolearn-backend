const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiHelper {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('❌ Gemini API key is missing. Please check your .env file');
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        }
      });
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize Gemini: ${error.message}`);
    }
  }

  async generateText(prompt) {
    try {
      console.log('🔮 Sending prompt to Gemini...');
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini response received');
      
      return text;
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}

module.exports = GeminiHelper;