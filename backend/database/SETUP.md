# Database Setup Guide

## Step 1: Install MySQL

Make sure MySQL is installed and running on your system.

## Step 2: Create Database

```bash
# Login to MySQL
mysql -u root -p
```

## Step 3: Run Schema

```sql
-- Option 1: Run from MySQL prompt
source D:/JATIN/PROJECTS/JaiHoNews_Website/bharat-news-beat/backend/database/schema.sql;

-- Option 2: Or from command line
mysql -u root -p < D:/JATIN/PROJECTS/JaiHoNews_Website/bharat-news-beat/backend/database/schema.sql
```

## Step 4: Create Admin User with Password

### Generate Password Hash

```bash
cd backend
node utils/generateHash.js
```

This will output a bcrypt hash. Copy it.

### Insert Admin User

```sql
USE jaiho_news;

INSERT INTO admins (username, email, password_hash, full_name, role) 
VALUES ('admin', 'admin@jaihoindia.com', 'YOUR_HASH_HERE', 'Administrator', 'admin');
```

Replace `YOUR_HASH_HERE` with the hash from step 1.

## Step 5: Verify Setup

```sql
-- Check if database exists
SHOW DATABASES LIKE 'jaiho_news';

-- Check tables
USE jaiho_news;
SHOW TABLES;

-- Verify admin user
SELECT id, username, email, role FROM admins;

-- Check default pages
SELECT slug, title FROM pages;

-- Check settings
SELECT setting_key, setting_value FROM settings;
```

## Default Admin Credentials

After setup:
- **Username**: `admin`
- **Password**: `admin123`

**IMPORTANT**: Change this password in production!

## Database Structure

### Tables Created:
1. **admins** - Admin user accounts
2. **articles** - JaiHoIndia original articles
3. **media** - Uploaded files
4. **pages** - Static/CMS pages
5. **settings** - Site configuration

### Default Data:
- 1 admin user
- 6 static pages (About, Contact, Team, Privacy, Terms, Editorial)
- 4 site settings (name, tagline, disclaimer, email)

## Troubleshooting

### Error: Access denied for user
- Check MySQL credentials in `.env`
- Verify MySQL user has proper permissions

### Error: Database already exists
- Either drop the existing database:
  ```sql
  DROP DATABASE jaiho_news;
  ```
- Or skip database creation and just run the table commands

### Error: Table already exists
- Safe to ignore if using `CREATE TABLE IF NOT EXISTS`
- Or drop tables and recreate

## Production Checklist

- [ ] Change admin password
- [ ] Update database credentials in `.env`
- [ ] Set strong JWT_SECRET
- [ ] Enable MySQL authentication
- [ ] Configure database backups
- [ ] Set up proper user permissions
