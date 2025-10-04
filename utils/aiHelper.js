const axios = require('axios');

class AIHelper {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    
    if (!this.apiKey) {
      throw new Error('❌ OpenRouter API key is not configured');
    }
    
    console.log('✅ AI Helper initialized with OpenRouter');
  }

  async generateSummary(text) {
    const prompt = `Create a comprehensive educational summary of the following content. Focus on key concepts and main ideas.

Content: ${text}`;
    
    return await this.generateWithOpenRouter(prompt);
  }

  async generateFlashcards(text) {
    const prompt = `Create educational flashcards from this content. Format as JSON: [{question: "", answer: ""}]

Content: ${text}`;
    
    const response = await this.generateWithOpenRouter(prompt);
    return this.parseFlashcards(response);
  }

  async generateQuiz(text) {
    const prompt = `Create a quiz from this content. Format as JSON: [{question: "", options: ["","","",""], answer: ""}]

Content: ${text}`;
    
    const response = await this.generateWithOpenRouter(prompt);
    return this.parseQuiz(response);
  }

  async generateWithOpenRouter(prompt) {
    try {
      const response = await axios.post(this.apiUrl, {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an educational AI assistant."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://turbolearnai.in',
          'X-Title': 'Turbolearn AI'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter Error:', error.message);
      throw new Error('AI service unavailable');
    }
  }

  parseFlashcards(text) {
    try {
      const jsonMatch = text.match(/\[.*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [
        { question: "Sample Q1", answer: "Sample A1" },
        { question: "Sample Q2", answer: "Sample A2" }
      ];
    } catch (error) {
      return [
        { question: "What is the main topic?", answer: "Educational content" },
        { question: "Key points?", answer: "Important concepts" }
      ];
    }
  }

  parseQuiz(text) {
    try {
      const jsonMatch = text.match(/\[.*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [
        {
          question: "Sample question?",
          options: ["A", "B", "C", "D"],
          answer: "A"
        }
      ];
    } catch (error) {
      return [
        {
          question: "Primary subject?",
          options: ["Education", "Tech", "Business", "Science"],
          answer: "Education"
        }
      ];
    }
  }
}

module.exports = AIHelper;