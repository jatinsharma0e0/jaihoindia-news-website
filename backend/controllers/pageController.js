const { supabase } = require('../config/supabase');

/**
 * Get page by slug
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getPage = async (req, res) => {
    try {
        const { slug } = req.params;

        const { data: pages, error } = await supabase
            .from('pages')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true);

        if (error) throw error;

        if (!pages || pages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Page not found',
            });
        }

        res.json({
            success: true,
            data: pages[0],
        });

    } catch (error) {
        console.error('Get page error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch page',
            error: error.message,
        });
    }
};

/**
 * Get all pages
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllPages = async (req, res) => {
    try {
        const { data: pages, error } = await supabase
            .from('pages')
            .select('id, slug, title, meta_description, is_active, updated_at')
            .eq('is_active', true);

        if (error) throw error;

        res.json({
            success: true,
            data: pages,
        });

    } catch (error) {
        console.error('Get all pages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pages',
            error: error.message,
        });
    }
};

/**
 * Get setting by key
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getSetting = async (req, res) => {
    try {
        const { key } = req.params;

        const { data: settings, error } = await supabase
            .from('settings')
            .select('*')
            .eq('setting_key', key);

        if (error) throw error;

        if (!settings || settings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found',
            });
        }

        res.json({
            success: true,
            data: settings[0],
        });

    } catch (error) {
        console.error('Get setting error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch setting',
            error: error.message,
        });
    }
};

/**
 * Get all settings
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllSettings = async (req, res) => {
    try {
        const { data: settings, error } = await supabase
            .from('settings')
            .select('*');

        if (error) throw error;

        // Convert to key-value object
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.setting_key] = setting.setting_value;
        });

        res.json({
            success: true,
            data: settingsObj,
        });

    } catch (error) {
        console.error('Get all settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings',
            error: error.message,
        });
    }
};

module.exports = {
    getPage,
    getAllPages,
    getSetting,
    getAllSettings,
};
