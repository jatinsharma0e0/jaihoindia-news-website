const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { query } = require('../config/db');
const { manualRefresh } = require('../jobs/refreshJob');

/**
 * Admin login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required',
            });
        }

        // Find admin by username
        const admins = await query(
            'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
            [username]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const admin = admins[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: admin.id,
                username: admin.username,
                role: admin.role,
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    full_name: admin.full_name,
                    role: admin.role,
                },
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message,
        });
    }
};

/**
 * Get all articles (for admin panel)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getArticles = async (req, res) => {
    try {
        const { status, category } = req.query;

        let sql = `
      SELECT a.id, a.title, a.slug, a.summary, a.content, a.image_url as image, a.category, a.tags, a.status, a.is_original, a.published_at, a.created_at, a.updated_at, ad.username as author_name
      FROM articles a
      LEFT JOIN admins ad ON a.author_id = ad.id
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            sql += ' AND a.status = ?';
            params.push(status);
        }

        if (category) {
            sql += ' AND a.category = ?';
            params.push(category);
        }

        sql += ' ORDER BY a.updated_at DESC';

        const articles = await query(sql, params);

        res.json({
            success: true,
            data: articles,
        });

    } catch (error) {
        console.error('Get articles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch articles',
            error: error.message,
        });
    }
};

/**
 * Create new article
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const createArticle = async (req, res) => {
    try {
        const { title, slug, summary, content, category, status } = req.body;
        // Handle field mismatches from frontend
        const image_url = req.body.image_url || req.body.image; // Frontend sends 'image'
        const tags = req.body.tags || ''; // Optional

        const author_id = req.admin.id;

        if (!title || !content || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, and category are required',
            });
        }

        const published_at = status === 'published' ? new Date() : null;

        const result = await query(
            `INSERT INTO articles (title, slug, summary, content, image_url, category, tags, author_id, status, is_original, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
            [title, slug, summary, content, image_url, category, tags, author_id, status, published_at]
        );

        res.status(201).json({
            success: true,
            message: 'Article created successfully',
            data: { id: result.insertId },
        });

    } catch (error) {
        console.error('Create article error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create article',
            error: error.message,
        });
    }
};

/**
 * Update article
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, summary, content, category, status } = req.body;

        // Handle field mismatches
        const image_url = req.body.image_url || req.body.image;
        const tags = req.body.tags || '';

        const published_at = status === 'published' ? new Date() : null;

        await query(
            `UPDATE articles 
       SET title = ?, slug = ?, summary = ?, content = ?, image_url = ?, category = ?, tags = ?, status = ?, published_at = ?
       WHERE id = ?`,
            [title, slug, summary, content, image_url, category, tags, status, published_at, id]
        );

        res.json({
            success: true,
            message: 'Article updated successfully',
        });

    } catch (error) {
        console.error('Update article error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update article',
            error: error.message,
        });
    }
};

/**
 * Delete article
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        await query('DELETE FROM articles WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Article deleted successfully',
        });

    } catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete article',
            error: error.message,
        });
    }
};

/**
 * Force cache refresh (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const forceRefresh = async (req, res) => {
    try {
        const { type } = req.body;
        const hardReset = type === 'hard';

        await manualRefresh({ hardReset });

        res.json({
            success: true,
            message: hardReset ? 'Hard cache reset triggered successfully' : 'Cache refresh triggered successfully',
        });

    } catch (error) {
        console.error('Force refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh cache',
            error: error.message,
        });
    }
};

module.exports = {
    login,
    getArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    forceRefresh,
};
