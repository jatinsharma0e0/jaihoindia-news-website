const { query } = require('../config/db');

/**
 * Get all system settings
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getSettings = async (req, res) => {
    try {
        const settings = await query('SELECT * FROM settings ORDER BY setting_key');

        // Convert array to object for easier frontend consumption
        const settingsMap = {};
        settings.forEach(item => {
            settingsMap[item.setting_key] = item.setting_value;
        });

        res.json({
            success: true,
            data: settingsMap,
            raw: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings',
            error: error.message,
        });
    }
};

/**
 * Update a specific setting
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key) {
            return res.status(400).json({
                success: false,
                message: 'Setting key is required',
            });
        }

        // Check if setting exists
        await query(
            'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()',
            [key, String(value), String(value)]
        );

        res.json({
            success: true,
            message: `Setting '${key}' updated successfully`,
            data: { key, value }
        });

    } catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update setting',
            error: error.message,
        });
    }
};

module.exports = {
    getSettings,
    updateSetting,
};
