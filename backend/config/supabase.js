const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client with service role key (backend only)
// NEVER expose SUPABASE_SECRET_KEY to frontend
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Test connection helper
const testConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('setting_key')
            .limit(1);

        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            return false;
        }

        console.log('✅ Supabase connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection error:', error.message);
        return false;
    }
};

module.exports = {
    supabase,
    testConnection,
};
