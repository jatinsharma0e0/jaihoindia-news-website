-- JaiHoIndia News Database Schema
-- This schema is ONLY for admin accounts, original articles, media, and static pages
-- Third-party API news is NEVER stored in MySQL (cached in JSON files only)

CREATE DATABASE IF NOT EXISTS jaiho_news CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jaiho_news;

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('admin', 'editor', 'author') DEFAULT 'author',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- Articles Table (JaiHoIndia Original Content)
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  summary TEXT,
  content LONGTEXT NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(50) NOT NULL,
  tags VARCHAR(255),
  author_id INT NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  is_original BOOLEAN DEFAULT TRUE COMMENT 'Always TRUE for articles in this table',
  views_count INT DEFAULT 0,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES admins(id) ON DELETE RESTRICT,
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at),
  INDEX idx_author (author_id),
  FULLTEXT idx_fulltext (title, summary, content)
) ENGINE=InnoDB;

-- Media Table
CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(500) NOT NULL,
  file_type ENUM('image', 'document', 'video') DEFAULT 'image',
  mime_type VARCHAR(100),
  file_size INT COMMENT 'Size in bytes',
  uploaded_by INT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE RESTRICT,
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_file_type (file_type)
) ENGINE=InnoDB;

-- Pages Table (Static/CMS Pages)
CREATE TABLE IF NOT EXISTS pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  meta_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
) ENGINE=InnoDB;

-- Insert default admin user (username: admin, password: admin123)
-- Password hash generated using bcrypt with salt rounds 10
INSERT INTO admins (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@jaihoindia.com', '$2a$10$YourGeneratedHashWillGoHere', 'Administrator', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- NOTE: Before running this schema, generate a proper hash by running:
-- node utils/generateHash.js
-- Then replace the password_hash value above with the generated hash

-- Insert default static pages
INSERT INTO pages (slug, title, content, is_active) VALUES
('about-us', 'About Us', 'JaiHoIndia is a hybrid news platform combining curated news aggregation with original journalism.', TRUE),
('contact-us', 'Contact Us', 'Contact information will be added here.', TRUE),
('our-team', 'Our Team', 'Meet the team behind JaiHoIndia.', TRUE),
('privacy-policy', 'Privacy Policy', 'Privacy policy content.', TRUE),
('terms-conditions', 'Terms & Conditions', 'Terms and conditions content.', TRUE),
('editorial-policy', 'Editorial Policy', 'Our editorial standards and guidelines.', TRUE)
ON DUPLICATE KEY UPDATE slug = slug;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('site_name', 'JaiHoIndia News', 'Website name'),
('site_tagline', 'Breaking News & Original Journalism', 'Website tagline'),
('news_disclaimer', 'Aggregated news content is sourced from third-party providers. We do not claim ownership of such content. All credit goes to the original publishers.', 'Legal disclaimer for aggregated news'),
('contact_email', 'contact@jaihoindia.com', 'Contact email address')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
