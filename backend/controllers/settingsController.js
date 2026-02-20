const { supabase } = require('../config/supabase');

/**
 * Get all system settings
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getSettings = async (req, res) => {
    try {
        const { data: settings, error } = await supabase
            .from('settings')
            .select('*')
            .order('setting_key');

        if (error) throw error;

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

        // Use upsert in Supabase to handle both insert and update
        const { error } = await supabase
            .from('settings')
            .upsert({
                setting_key: key,
                setting_value: String(value),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'setting_key'
            });

        if (error) throw error;

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
