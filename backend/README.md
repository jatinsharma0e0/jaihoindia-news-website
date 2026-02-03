# JaiHoIndia News Backend

A production-ready backend API for JaiHoIndia News - a hybrid news aggregation and original journalism platform built with strict API safety measures, caching, and legal compliance.

## 🚨 Critical Features

### API Safety (ZERO BAN GUARANTEE)
- ✅ **Server-side only** API calls via cron jobs
- ✅ **Single API call** per refresh cycle (default: 1 hour)
- ✅ **All users** consume cached data exclusively
- ✅ **No user-triggered** API requests
- ✅ **Fail-safe fallback** to last cached data on errors

### Legal Compliance
- ✅ Short summaries only (no full articles)
- ✅ Clear source attribution
- ✅ Links to original publishers
- ✅ Disclaimer on all aggregated content
- ✅ Visual distinction between aggregated vs. original articles

### Architecture
- **Caching**: JSON file-based (persists across restarts)
- **Database**: MySQL for admin accounts & original articles only
- **Refresh**: Server time-based (ignores client time)
- **Deduplication**: Removes duplicate titles and URLs
- **Pagination**: Slices cached data (no additional API calls)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your configuration
# CRITICAL: Update DB_PASSWORD with your MySQL password
```

### 4. Setup MySQL database
```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source database/schema.sql

# Or manually import
mysql -u root -p < database/schema.sql
```

### 5. Create admin user
The schema automatically creates a default admin user:
- **Username**: `admin`
- **Password**: `admin123`

**IMPORTANT**: Change this password in production!

To create a custom admin with hashed password:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your_password', 10, (err, hash) => console.log(hash));"
```

Then update MySQL:
```sql
UPDATE admins SET password_hash = 'your_hashed_password' WHERE username = 'admin';
```

## 🏃 Running the Server

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Public Endpoints (No Authentication)

#### News Endpoints
- `GET /api/news/home` - Home page news (breaking + category previews)
- `GET /api/news/category/:category` - Category-specific news with pagination
- `GET /api/news/all?page=1&limit=20` - All news with pagination
- `GET /api/news/cache/status` - Cache statistics

**Example** Category values: `breaking`, `politics`, `sports`, `technology`

#### Static Pages
- `GET /api/pages` - List all pages
- `GET /api/pages/:slug` - Get specific page (about-us, contact-us, etc.)
- `GET /api/pages/settings/all` - Get all site settings

#### YouTube
- `GET /api/youtube/videos` - Get cached YouTube videos

### Protected Endpoints (Require JWT)

#### Authentication
- `POST /api/admin/login` - Admin login
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

#### Article Management (Admin Only)
- `GET /api/admin/articles` - List all articles
- `POST /api/admin/articles` - Create article
- `PUT /api/admin/articles/:id` - Update article
- `DELETE /api/admin/articles/:id` - Delete article

#### File Upload
- `POST /api/admin/upload` - Upload image (multipart/form-data)

#### Cache Management
- `POST /api/admin/refresh-cache` - Force cache refresh (admin role only)

## 🔧 Configuration

### Cache Refresh Interval
Default: 60 minutes

To change, edit `.env`:
```env
REFRESH_INTERVAL_MINUTES=120  # 2 hours
```

### Frontend CORS
Update the frontend URL in `.env`:
```env
FRONTEND_URL=http://localhost:3000
```

### MySQL Configuration
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=jaiho_news
DB_PORT=3306
```

## 📂 Project Structure

```
backend/
├── config/           # Configuration files
│   ├── config.js     # Centralized config
│   └── db.js         # Database connection
├── controllers/      # Business logic
│   ├── newsController.js
│   ├── adminController.js
│   ├── pageController.js
│   └── youtubeController.js
├── routes/           # API routes
│   ├── newsRoutes.js
│   ├── adminRoutes.js
│   ├── pagesRoutes.js
│   └── youtubeRoutes.js
├── services/         # External API integrations
│   └── newsService.js
├── jobs/             # Cron jobs
│   └── refreshJob.js
├── utils/            # Utilities
│   ├── cache.js
│   ├── normalizer.js
│   └── deduplicator.js
├── middleware/       # Express middleware
│   ├── auth.js
│   └── errorHandler.js
├── database/         # Database schema
│   └── schema.sql
├── cache/            # Cache files (auto-generated)
├── uploads/          # Uploaded files (auto-generated)
└── server.js         # Main entry point
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Configurable origin policy
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing
- **File validation**: Image upload restrictions
- **Error handling**: No sensitive data exposure

## ⚙️ How It Works

### Cache Refresh Flow
1. Cron job runs every N minutes (server time)
2. Check if cache is expired
3. If expired:
   - Fetch news from NewsData.io API (single call)
   - Normalize data format
   - Remove duplicates
   - Save to JSON cache file
4. If API fails:
   - Keep serving existing cache
   - No aggressive retries

### Pagination Flow
1. Client requests page 2: `/api/news/category/politics?page=2`
2. Backend loads cache from JSON file
3. Filter by category if specified
4. Slice array based on page number
5. Return paginated results
6. **NO API CALL** is made during pagination

## 🧪 Testing

### Test Database Connection
```bash
curl http://localhost:5000/health
```

### Test News API
```bash
# Home page
curl http://localhost:5000/api/news/home

# Category
curl http://localhost:5000/api/news/category/politics

# Pagination
curl "http://localhost:5000/api/news/category/politics?page=2&limit=10"
```

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Protected Route
```bash
# Use token from login response
curl http://localhost:5000/api/admin/articles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Important Notes

### ⚠️ API Safety Rules
- **NEVER** call NewsData API from frontend
- **NEVER** trigger API calls on user actions
- **ONLY** cron job can call external news APIs
- Pagination must **ALWAYS** use cached data

### ⚠️ Legal Compliance
- Display source name for ALL aggregated news
- Link to original publisher
- Show disclaimers
- Use short summaries only
- Mark original articles clearly

### ⚠️ Database Usage
- MySQL stores ONLY:
  - Admin accounts
  - JaiHoIndia original articles
  - Media uploads
  - Static pages
- **NEVER** store third-party news in MySQL

## 🐛 Troubleshooting

### Cache not refreshing
- Check cron job logs in console
- Verify `REFRESH_INTERVAL_MINUTES` in `.env`
- Check NewsData API key validity

### Database connection failed
- Verify MySQL is running
- Check credentials in `.env`
- Run schema.sql to create tables

### Port already in use
- Change `PORT` in `.env`
- Or kill process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

## 📄 License

ISC

## 👥 Support

For issues or questions, contact: admin@jaihoindia.com
