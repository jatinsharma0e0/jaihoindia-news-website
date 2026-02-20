require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config/config');
const { testConnection } = require('./config/supabase');
const { initRefreshJob } = require('./jobs/refreshJob');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const newsRoutes = require('./routes/newsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pagesRoutes = require('./routes/pagesRoutes');
const youtubeRoutes = require('./routes/youtubeRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors(config.cors));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (fallback for local uploads if any exist)
app.use('/uploads', express.static(path.join(__dirname, config.upload.dir)));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'JaiHoIndia News Backend is running (Supabase Powered)',
        timestamp: new Date().toISOString(),
    });
});

// Root status page
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JaiHoIndia News API - Status</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #FF5722;
                --primary-dark: #E64A19;
                --bg: #0F172A;
                --card-bg: #1E293B;
                --text: #F8FAFC;
                --text-muted: #94A3B8;
                --accent: #38BDF8;
            }
            body { 
                font-family: 'Outfit', sans-serif; 
                background: var(--bg); 
                color: var(--text); 
                margin: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
            }
            .container { 
                background: var(--card-bg); 
                padding: 3rem; 
                border-radius: 24px; 
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); 
                max-width: 800px; 
                width: 90%; 
                border: 1px solid rgba(255,255,255,0.05);
                position: relative;
                overflow: hidden;
            }
            .container::before {
                content: '';
                position: absolute;
                top: -50px;
                right: -50px;
                width: 200px;
                height: 200px;
                background: var(--primary);
                filter: blur(100px);
                opacity: 0.15;
            }
            h1 { color: var(--primary); margin-top: 0; font-size: 2.5rem; letter-spacing: -0.025em; }
            p { color: var(--text-muted); line-height: 1.6; font-size: 1.1rem; }
            .status { 
                display: inline-flex; 
                align-items: center; 
                background: rgba(16, 185, 129, 0.1); 
                color: #10B981; 
                padding: 0.5rem 1rem; 
                border-radius: 99px; 
                font-weight: 600; 
                font-size: 0.875rem;
                margin-bottom: 2rem;
            }
            .status::before {
                content: '';
                display: inline-block;
                width: 8px;
                height: 8px;
                background: #10B981;
                border-radius: 50%;
                margin-right: 10px;
                box-shadow: 0 0 10px #10B981;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.5; }
                100% { transform: scale(1); opacity: 1; }
            }
            .badges { display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap; }
            .badge { 
                background: rgba(255,255,255,0.05); 
                padding: 0.5rem 1rem; 
                border-radius: 12px; 
                font-size: 0.875rem; 
                color: var(--text);
                border: 1px solid rgba(255,255,255,0.1);
            }
            .endpoints { margin-top: 3rem; }
            .endpoints h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; color: var(--accent); }
            ul { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
            li { 
                background: rgba(255,255,255,0.03); 
                padding: 1rem; 
                border-radius: 16px; 
                border: 1px solid rgba(255,255,255,0.05);
                transition: all 0.3s ease;
            }
            li:hover {
                transform: translateY(-2px);
                background: rgba(255,255,255,0.05);
                border-color: var(--accent);
            }
            code { 
                color: var(--primary); 
                font-family: 'Fira Code', monospace; 
                font-weight: 600;
                display: block;
                margin-bottom: 0.25rem;
            }
            a { color: inherit; text-decoration: none; display: block; }
            .footer { margin-top: 4rem; text-align: center; color: var(--text-muted); font-size: 0.875rem; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status">System Operational</div>
            <h1>JaiHoIndia News API</h1>
            <p>Production-grade hybrid news aggregation and original journalism backend. Strict API safety, caching, and legal compliance enabled.</p>
            
            <div class="badges">
                <div class="badge">🚀 Node.js Express</div>
                <div class="badge">⚡ Supabase Powered</div>
                <div class="badge">⚡ JSON Caching</div>
                <div class="badge">🛡️ JWT Auth</div>
            </div>

            <div class="endpoints">
                <h2>Explorable Endpoints</h2>
                <ul>
                    <li><a href="/api/news/home" target="_blank"><code>GET /api/news/home</code> <span style="font-size: 0.8rem; color: var(--text-muted);">Home Feed & Top Stories</span></a></li>
                    <li><a href="/api/news/cache/status" target="_blank"><code>GET /api/news/cache/status</code> <span style="font-size: 0.8rem; color: var(--text-muted);">Real-time Cache Tracking</span></a></li>
                    <li><a href="/api/news/category/sports" target="_blank"><code>GET /api/news/category/sports</code> <span style="font-size: 0.8rem; color: var(--text-muted);">Sports Category Feed</span></a></li>
                    <li><a href="/api/pages" target="_blank"><code>GET /api/pages</code> <span style="font-size: 0.8rem; color: var(--text-muted);">Static CMS Pages</span></a></li>
                </ul>
            </div>

            <div class="footer">
                &copy; 2026 JaiHoIndia News. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `);
});

// API routes
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Test Supabase connection
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.warn('⚠️ Supabase connection failed - some features may not work');
        }

        // Initialize cron job for cache refresh
        console.log('\n📡 Initializing news cache refresh system...');
        initRefreshJob();

        // Start Express server
        const PORT = config.server.port;
        app.listen(PORT, () => {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`✅ JaiHoIndia News Backend Server Started`);
            console.log(`${'='.repeat(60)}`);
            console.log(`🌐 Server running on: http://localhost:${PORT}`);
            console.log(`📝 Environment: ${config.server.nodeEnv}`);
            console.log(`⏰ Cache refresh interval: ${config.cache.refreshIntervalMinutes} minutes`);
            console.log(`📦 Database: ${dbConnected ? 'Supabase Connected' : 'Supabase Disconnected'}`);
            console.log(`${'='.repeat(60)}\n`);
        });

    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
