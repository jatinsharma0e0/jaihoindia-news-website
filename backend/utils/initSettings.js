const db = require('../config/db');

const initSettings = async () => {
    try {
        console.log('🔌 Connecting to database...');

        // Insert default setting for API
        await db.query(`
            INSERT IGNORE INTO settings (setting_key, setting_value, description) 
            VALUES ('enable_external_api', 'true', 'Toggle external news fetching from NewsData.io')
        `);

        console.log('✅ Settings initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing settings:', error);
        process.exit(1);
    }
};

initSettings();
