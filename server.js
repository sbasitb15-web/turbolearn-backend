const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ PRODUCTION CORS SETTINGS - UPDATED
app.use(cors({
    origin: [
        "https://turbolearnai.in",
        "http://turbolearnai.in", 
        "https://www.turbolearnai.in",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// ✅ Handle preflight OPTIONS requests
app.options('*', cors());

// Add CORS headers to all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const aiRoutes = require('./routes/aiRoutes');
const fileRoutes = require('./routes/fileRoutes');

// Use routes
app.use('/api', aiRoutes);
app.use('/api', fileRoutes);

// ✅ DEBUG ROUTE - Check API Keys
app.get('/api/debug', (req, res) => {
    const debugInfo = {
        groq_key_set: !!process.env.GROQ_API_KEY,
        groq_key_prefix: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) + '...' : 'Not set',
        deepseek_key_set: !!process.env.DEEPSEEK_API_KEY,
        openrouter_key_set: !!process.env.OPENROUTER_API_KEY,
        current_service: process.env.GROQ_API_KEY ? "Groq" : 
                        process.env.DEEPSEEK_API_KEY ? "DeepSeek" : 
                        process.env.OPENROUTER_API_KEY ? "OpenRouter" : "None",
        environment: process.env.NODE_ENV || 'development',
        all_env_keys: Object.keys(process.env).filter(key => key.includes('API') || key.includes('KEY'))
    };
    
    console.log('🔍 DEBUG API Key Status:', debugInfo);
    res.json(debugInfo);
});

// Basic routes
app.get('/', (req, res) => {
    const aiService = process.env.GROQ_API_KEY ? "Groq API" : 
                     process.env.DEEPSEEK_API_KEY ? "DeepSeek API" :
                     process.env.OPENROUTER_API_KEY ? "OpenRouter BYOK" : 
                     "No AI Service";
    
    res.json({ 
        success: true,
        message: '🚀 Turbolearn AI Backend is running!',
        service: aiService,
        endpoints: {
            health: '/health',
            debug: '/api/debug',
            summary: 'POST /api/summary',
            flashcards: 'POST /api/flashcards',
            quiz: 'POST /api/quiz',
            upload: 'POST /api/upload',
            youtube: 'POST /api/youtube',
            transcribe: 'POST /api/transcribe'
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    const aiService = process.env.GROQ_API_KEY ? "Groq API" : 
                     process.env.DEEPSEEK_API_KEY ? "DeepSeek API" :
                     process.env.OPENROUTER_API_KEY ? "OpenRouter BYOK" : 
                     "No AI Service";
    
    res.json({ 
        success: true,
        status: 'Healthy ✅',
        server: 'Running',
        port: PORT,
        service: aiService,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: 'The requested endpoint does not exist',
        availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /api/debug',
            'POST /api/summary',
            'POST /api/flashcards',
            'POST /api/quiz',
            'POST /api/upload',
            'POST /api/youtube',
            'POST /api/transcribe'
        ]
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

// ✅ ENVIRONMENT CHECK BEFORE START
console.log('🔑 Environment Variables Check:');
console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
console.log('GROQ_API_KEY value:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) + '...' : 'Not set');
console.log('DEEPSEEK_API_KEY exists:', !!process.env.DEEPSEEK_API_KEY);
console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);

const detectedService = process.env.GROQ_API_KEY ? "Groq API" : 
                       process.env.DEEPSEEK_API_KEY ? "DeepSeek API" :
                       process.env.OPENROUTER_API_KEY ? "OpenRouter BYOK" : 
                       "No AI Service";

// Start server
app.listen(PORT, () => {
    console.log(`🎯 Turbolearn AI Backend running on port ${PORT}`);
    console.log(`✅ Health check: /health`);
    console.log(`🤖 AI Service: ${detectedService}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 CORS Enabled for: turbolearnai.in`);
    console.log(`🐛 Debug endpoint: /api/debug`);
});