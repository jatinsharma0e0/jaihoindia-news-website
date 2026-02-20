const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { supabase } = require('../config/supabase');
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
    bulkRemoveFromGallery,
    getArrangement,
    saveArrangement,
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * Admin authentication and article management routes
 */

// Use memory storage for Supabase uploads
const upload = multer({
    storage: multer.memoryStorage(),
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

// File upload to Supabase Storage
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // Debugging logs
        console.log('Upload Request - Query:', req.query);
        console.log('Upload Request - File:', req.file ? req.file.originalname : 'No file');

        // Get upload type/bucket from query parameter
        const bucketName = req.query.type || 'articles';
        const validBuckets = ['articles', 'gallery', 'documents', 'team'];
        const bucket = validBuckets.includes(bucketName) ? bucketName : 'articles';

        // Generate unique filename
        const fileExt = path.extname(req.file.originalname);
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        const fileUrl = publicUrlData.publicUrl;

        res.json({
            success: true,
            message: 'File uploaded successfully to Supabase',
            data: {
                filename: fileName,
                url: fileUrl,
                bucket: bucket,
                path: data.path
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
router.delete('/gallery/bulk', bulkRemoveFromGallery); // Bulk delete — must be before /:id
router.delete('/gallery/:id', removeFromGallery);

// Arrangement order (gallery / team / documents)
router.get('/arrangement/:section', getArrangement);
router.post('/arrangement/:section', saveArrangement);

module.exports = router;
