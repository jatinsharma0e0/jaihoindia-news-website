require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jaiho_news',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  newsApi: {
    key: process.env.NEWSDATA_API_KEY || 'pub_a4bb2a07e85b4193874ecdafe46d6902',
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
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  },
};

module.exports = config;
