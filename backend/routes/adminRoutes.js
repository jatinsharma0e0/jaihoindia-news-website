const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const {
    login,
    getArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    forceRefresh,
    getGallery,
    addToGallery,
    removeFromGallery,
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * Admin authentication and article management routes
 * All routes except login require JWT authentication
 */

// Configure multer for file uploads with dynamic subdirectories
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get upload type from query parameter, default to 'articles'
        const uploadType = req.query.type || 'articles';
        const validTypes = ['articles', 'gallery'];

        // Validate upload type
        const subDir = validTypes.includes(uploadType) ? uploadType : 'articles';
        const uploadDir = path.join(__dirname, '..', config.upload.dir, subDir);

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: config.upload.maxFileSize },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
        }
    },
});

// Public route - Login
router.post('/login', login);

// Protected routes - Require authentication
router.use(authenticateToken);

// Article management
router.get('/articles', getArticles);
router.post('/articles', createArticle);
router.put('/articles/:id', updateArticle);
router.delete('/articles/:id', deleteArticle);

// File upload
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // Get upload type for URL construction
        const uploadType = req.query.type || 'articles';
        const validTypes = ['articles', 'gallery'];
        const subDir = validTypes.includes(uploadType) ? uploadType : 'articles';

        // Use config.server.url or hardcode for now
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/${subDir}/${req.file.filename}`;

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                filename: req.file.filename,
                url: fileUrl,
                path: req.file.path,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: error.message,
        });
    }
});

// Manual cache refresh (admin only)
router.post('/refresh-cache', authorizeRoles('admin'), forceRefresh);

// Gallery Management
router.get('/gallery', getGallery);
router.post('/gallery', addToGallery);
router.delete('/gallery/:id', removeFromGallery);

module.exports = router;
