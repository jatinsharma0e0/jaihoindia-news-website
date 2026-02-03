# Quick Start Guide

## Prerequisites Check
- [x] Node.js installed
- [ ] MySQL installed and running
- [ ] Git (optional)

## Setup Steps (5 minutes)

### 1. Install Dependencies (Done!)
```bash
cd backend
npm install
```
✅ Already completed

### 2. Configure Environment
```bash
# Edit .env file
# CRITICAL: Update these values:
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_production_secret_key
```

### 3. Setup Database
```bash
# Login to MySQL
mysql -u root -p

# Run schema (from MySQL prompt)
source database/schema.sql;

# Or from command line
mysql -u root -p < database/schema.sql
```

### 4. Create Admin User
```bash
# Generate password hash
node utils/generateHash.js

# Copy the hash, then in MySQL:
USE jaiho_news;
INSERT INTO admins (username, email, password_hash, full_name, role) 
VALUES ('admin', 'admin@jaihoindia.com', 'PASTE_HASH_HERE', 'Administrator', 'admin');
```

### 5. Start the Server
```bash
# Development mode (auto-reload)
npm run dev

# OR Production mode
npm start
```

Server will start at: http://localhost:5000

### 6. Test the API
```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get news (wait 1 minute for cache to populate)
curl http://localhost:5000/api/news/home
```

## What Happens When You Start?

1. ✅ Server connects to MySQL
2. ✅ Cron job starts (refreshes news every 60 minutes)
3. ✅ First API call to NewsData.io happens immediately
4. ✅ News is cached to `cache/news-cache.json`
5. ✅ All endpoints become available

## Default Configuration

- **Port**: 5000
- **Cache Refresh**: Every 60 minutes
- **Frontend CORS**: http://localhost:3000
- **Upload Max Size**: 5MB
- **JWT Expiry**: 7 days

## File Structure After Setup

```
backend/
├── cache/
│   └── news-cache.json (auto-created on first run)
├── uploads/ (auto-created when files uploaded)
├── node_modules/ (dependencies)
├── .env (your configuration)
└── ... (rest of the files)
```

## Next Steps

1. **Test the endpoints** using the API documentation in README.md
2. **Connect your frontend** to `http://localhost:5000`
3. **Update frontend to use** the new API endpoints
4. **Customize static pages** in MySQL `pages` table
5. **Create original articles** via admin panel

## Common Issues

### "Database connection failed"
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `.env`

### "No cache data available"
- Wait 1-2 minutes for first cron job to run
- Check console logs for API errors
- Verify NewsData API key is valid

### "Port 5000 already in use"
- Change PORT in `.env` to 5001 or another port
- Or kill the process using port 5000

### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and run `npm install`

## Production Deployment

Before deploying to production:
- [ ] Change admin password
- [ ] Update JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Configure proper database credentials
- [ ] Set up HTTPS
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up process manager (PM2)
- [ ] Configure firewall rules
- [ ] Enable database backups

## Support

For detailed API documentation, see: `README.md`
For database setup guide, see: `database/SETUP.md`
