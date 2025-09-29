const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiHelper {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('❌ Gemini API key is missing. Please check your .env file');
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      
      // Try different model names
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro"  // Updated model name
      });
      
      console.log('✅ Gemini AI initialized successfully with model: gemini-1.5-pro');
    } catch (error) {
      console.error('❌ Model initialization error:', error);
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
      
      // Try with alternative model if first fails
      if (error.message.includes('not found') || error.message.includes('404')) {
        console.log('🔄 Trying with alternative model...');
        try {
          this.model = this.genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          console.log('✅ Gemini response received with alternative model');
          return text;
        } catch (error2) {
          throw new Error(`Both models failed: ${error2.message}`);
        }
      }
      
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}

module.exports = GeminiHelper;