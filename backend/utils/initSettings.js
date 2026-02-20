const { supabase } = require('../config/supabase');

const initSettings = async () => {
    try {
        console.log('🔌 Connecting to Supabase...');

        // Insert default setting for API using upsert
        const { error } = await supabase
            .from('settings')
            .upsert({
                setting_key: 'enable_external_api',
                setting_value: 'true',
                description: 'Toggle external news fetching from NewsData.io'
            }, {
                onConflict: 'setting_key'
            });

        if (error) throw error;

        console.log('✅ Settings initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing settings:', error);
        process.exit(1);
    }
};

initSettings();
