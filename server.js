const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
// ✅ PRODUCTION CORS SETTINGS - UPDATED
app.use(cors({
    origin: [
        "https://turbolearnai.in",        // Your WordPress site
        "http://turbolearnai.in", 
        "https://www.turbolearnai.in",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"  // Allow all temporarily
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
