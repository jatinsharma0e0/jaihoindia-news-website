import { handleCors, verifyToken } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('setting_key, setting_value, updated_at')
                .not('setting_key', 'in', '("news_cache","youtube_cache","gallery_arrangement","team_arrangement","documents_arrangement")');

            if (error) throw error;

            // Convert array to object map
            const settingsMap = {};
            for (const row of data || []) {
                settingsMap[row.setting_key] = row.setting_value;
            }

            return res.status(200).json({ success: true, data: settingsMap });
        } catch (error) {
            console.error('Get settings error:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch settings', error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            verifyToken(req);
            const { key, value } = req.body;

            if (!key) return res.status(400).json({ success: false, message: 'key is required' });

            const { error } = await supabase
                .from('settings')
                .upsert({ setting_key: key, setting_value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'setting_key' });

            if (error) throw error;

            return res.status(200).json({ success: true, message: 'Setting updated' });
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, message: err.message });
        }
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
}
