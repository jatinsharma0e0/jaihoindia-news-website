require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  newsApi: {
    key: process.env.NEWSDATA_API_KEY,
    url: process.env.NEWSDATA_API_URL || 'https://newsdata.io/api/1/latest',
    params: {
      country: 'in,us,jp,cn',
      language: 'hi',
      category: 'top,politics,sports,technology',
      removeduplicate: 1,
    },
  },

  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    channelId: process.env.YOUTUBE_CHANNEL_ID || '',
    cacheHours: parseInt(process.env.YOUTUBE_CACHE_HOURS) || 6,
  },

  cache: {
    dir: process.env.CACHE_DIR || './cache',
    file: process.env.CACHE_FILE || 'news-cache.json',
    refreshIntervalMinutes: parseInt(process.env.REFRESH_INTERVAL_MINUTES) || 60,
  },

  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
  },

  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      process.env.FRONTEND_URL,            // Vercel prod URL e.g. https://your-app.vercel.app
    ].filter(Boolean),
    credentials: true,
  },
};

module.exports = config;
