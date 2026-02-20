const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { supabase } = require('../config/supabase');
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

        // Find admin by username using Supabase
        const { data: admins, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .eq('is_active', true);

        if (error) throw error;

        if (!admins || admins.length === 0) {
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

        // Query with join to get author name
        let query = supabase
            .from('articles')
            .select('*, admins!author_id(username)');

        if (status) {
            query = query.eq('status', status);
        }

        if (category) {
            query = query.eq('category', category);
        }

        const { data: articles, error } = await query
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Map data to match previous structure if needed
        const formattedArticles = articles.map(a => ({
            ...a,
            image: a.image_url, // map field name if frontend expects 'image'
            author_name: a.admins?.username || 'Unknown'
        }));

        res.json({
            success: true,
            data: formattedArticles,
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
        const image_url = req.body.image_url || req.body.image;
        const tags = req.body.tags || '';
        const author_id = req.admin.id;

        if (!title || !content || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, content, and category are required',
            });
        }

        const published_at = status === 'published' ? new Date().toISOString() : null;

        const { data, error } = await supabase
            .from('articles')
            .insert([{
                title,
                slug,
                summary,
                content,
                image_url,
                category,
                tags,
                author_id,
                status,
                is_original: true,
                published_at
            }])
            .select();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Article created successfully',
            data: { id: data[0].id },
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
        const image_url = req.body.image_url || req.body.image;
        const tags = req.body.tags || '';

        const updateData = {
            title,
            slug,
            summary,
            content,
            image_url,
            category,
            tags,
            status,
            updated_at: new Date().toISOString()
        };

        if (status === 'published') {
            updateData.published_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('articles')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;

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

        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id);

        if (error) throw error;

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

const getGallery = async (req, res) => {
    try {
        const { type } = req.query;
        let query = supabase.from('gallery_images').select('*');

        if (type === 'documents') {
            query = query.ilike('image_url', '%/public/documents/%');
        } else if (type === 'team') {
            query = query.ilike('image_url', '%/public/team/%');
        } else if (type === 'gallery') {
            query = query.not('image_url', 'ilike', '%/public/documents/%')
                .not('image_url', 'ilike', '%/public/team/%');
        }

        const { data: images, error } = await query.order('uploaded_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: images });
    } catch (error) {
        console.error('Get gallery error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch gallery', error: error.message });
    }
};

const addToGallery = async (req, res) => {
    try {
        const { image_url, caption } = req.body;
        if (!image_url) {
            return res.status(400).json({ success: false, message: 'Image URL is required' });
        }

        const { data, error } = await supabase
            .from('gallery_images')
            .insert([{ image_url, caption: caption || null }])
            .select();

        if (error) throw error;

        res.status(201).json({ success: true, message: 'Image added to gallery', data: data[0] });
    } catch (error) {
        console.error('Add to gallery error:', error);
        res.status(500).json({ success: false, message: 'Failed to add image', error: error.message });
    }
};

const removeFromGallery = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch the record first so we know which file to delete from storage
        const { data: record, error: fetchError } = await supabase
            .from('gallery_images')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // 2. Parse bucket name and file path from the Supabase CDN URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/BUCKET/FILENAME
        if (record?.image_url) {
            try {
                const url = new URL(record.image_url);
                // pathname = /storage/v1/object/public/BUCKET/FILENAME
                const parts = url.pathname.split('/');
                // Find index of 'public' segment, bucket is next, rest is the file path
                const publicIndex = parts.indexOf('public');
                if (publicIndex !== -1 && parts.length > publicIndex + 2) {
                    const bucket = parts[publicIndex + 1];
                    const filePath = parts.slice(publicIndex + 2).join('/');

                    const { error: storageError } = await supabase.storage
                        .from(bucket)
                        .remove([filePath]);

                    if (storageError) {
                        // Log but don't fail — still delete the DB row
                        console.warn(`Storage delete warning for ${filePath}:`, storageError.message);
                    } else {
                        console.log(`✅ Deleted file from storage: ${bucket}/${filePath}`);
                    }
                }
            } catch (parseErr) {
                console.warn('Could not parse storage URL for deletion:', parseErr.message);
            }
        }

        // 3. Delete the DB row
        const { error } = await supabase
            .from('gallery_images')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Image removed from gallery and storage' });
    } catch (error) {
        console.error('Remove from gallery error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove image', error: error.message });
    }
};


/**
 * Bulk remove gallery images — deletes files from Storage AND rows from DB in one shot
 */
const bulkRemoveFromGallery = async (req, res) => {
    try {
        const { ids } = req.body; // array of image IDs

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'ids must be a non-empty array' });
        }

        // 1. Fetch all records to get their URLs
        const { data: records, error: fetchError } = await supabase
            .from('gallery_images')
            .select('id, image_url')
            .in('id', ids);

        if (fetchError) throw fetchError;

        // 2. Parse bucket + filePath from each URL and group by bucket
        const bucketFiles = {}; // { bucketName: [filePath, ...] }
        for (const record of records) {
            if (!record.image_url) continue;
            try {
                const url = new URL(record.image_url);
                const parts = url.pathname.split('/');
                const publicIndex = parts.indexOf('public');
                if (publicIndex !== -1 && parts.length > publicIndex + 2) {
                    const bucket = parts[publicIndex + 1];
                    const filePath = parts.slice(publicIndex + 2).join('/');
                    if (!bucketFiles[bucket]) bucketFiles[bucket] = [];
                    bucketFiles[bucket].push(filePath);
                }
            } catch (e) {
                console.warn('Could not parse URL:', record.image_url);
            }
        }

        // 3. Delete files from each bucket in parallel
        const storageResults = await Promise.allSettled(
            Object.entries(bucketFiles).map(([bucket, paths]) =>
                supabase.storage.from(bucket).remove(paths)
            )
        );

        storageResults.forEach((result, i) => {
            const bucket = Object.keys(bucketFiles)[i];
            if (result.status === 'rejected' || result.value?.error) {
                console.warn(`Storage bulk delete warning for bucket "${bucket}":`, result.reason || result.value?.error?.message);
            } else {
                console.log(`✅ Bulk deleted ${bucketFiles[bucket].length} file(s) from storage bucket "${bucket}"`);
            }
        });

        // 4. Batch delete all DB rows in one query
        const { error: deleteError } = await supabase
            .from('gallery_images')
            .delete()
            .in('id', ids);

        if (deleteError) throw deleteError;

        res.json({
            success: true,
            message: `Successfully removed ${records.length} item(s) from gallery and storage`,
            deletedCount: records.length,
        });
    } catch (error) {
        console.error('Bulk remove from gallery error:', error);
        res.status(500).json({ success: false, message: 'Bulk delete failed', error: error.message });
    }
};

/**
 * Get arrangement order for a section (gallery/team/documents)
 */
const getArrangement = async (req, res) => {
    try {
        const { section } = req.params;
        const validSections = ['gallery', 'team', 'documents'];
        if (!validSections.includes(section)) {
            return res.status(400).json({ success: false, message: 'Invalid section' });
        }

        const key = `${section}_arrangement`;
        const { data, error } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', key)
            .maybeSingle();

        if (error) throw error;

        const order = data?.setting_value ? JSON.parse(data.setting_value) : null;
        res.json({ success: true, data: { order } });
    } catch (error) {
        console.error('Get arrangement error:', error);
        res.status(500).json({ success: false, message: 'Failed to get arrangement', error: error.message });
    }
};

/**
 * Save arrangement order for a section
 */
const saveArrangement = async (req, res) => {
    try {
        const { section } = req.params;
        const { order } = req.body; // array of IDs
        const validSections = ['gallery', 'team', 'documents'];

        if (!validSections.includes(section)) {
            return res.status(400).json({ success: false, message: 'Invalid section' });
        }
        if (!Array.isArray(order)) {
            return res.status(400).json({ success: false, message: 'order must be an array' });
        }

        const key = `${section}_arrangement`;
        const { error } = await supabase
            .from('settings')
            .upsert({ setting_key: key, setting_value: JSON.stringify(order) }, { onConflict: 'setting_key' });

        if (error) throw error;
        res.json({ success: true, message: 'Arrangement saved' });
    } catch (error) {
        console.error('Save arrangement error:', error);
        res.status(500).json({ success: false, message: 'Failed to save arrangement', error: error.message });
    }
};

module.exports = {
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
};
