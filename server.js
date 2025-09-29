const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Production CORS settings
app.use(cors({
    origin: [
        'https://yourwordpresssite.com',  // Aapki WordPress site URL yahan daalna
        'http://yourwordpresssite.com',
        'https://www.yourwordpresssite.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const aiRoutes = require('./routes/aiRoutes');
const fileRoutes = require('./routes/fileRoutes');

// Use routes
app.use('/api', aiRoutes);
app.use('/api', fileRoutes);

// Basic routes
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: '🚀 Turbolearn AI Backend is running!',
        service: 'OpenAI GPT-4',
        endpoints: {
            health: '/health',
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
    res.json({ 
        success: true,
        status: 'Healthy ✅',
        server: 'Running',
        port: PORT,
        service: 'OpenAI GPT-4',
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

// Start server
app.listen(PORT, () => {
    console.log(`🎯 Turbolearn AI Backend running on port ${PORT}`);
    console.log(`✅ Health check: /health`);
    console.log(`🤖 AI Service: OpenAI GPT-4`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});