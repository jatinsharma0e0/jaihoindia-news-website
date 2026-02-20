import { handleCors, verifyToken } from '../../../lib/auth.js';
import { supabase } from '../../../lib/supabase.js';

const VALID_SECTIONS = ['gallery', 'team', 'documents'];

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    const { section } = req.query;

    if (!VALID_SECTIONS.includes(section)) {
        return res.status(400).json({ success: false, message: 'Invalid section' });
    }

    const key = `${section}_arrangement`;

    if (req.method === 'GET') {
        try {
            verifyToken(req);
            const { data, error } = await supabase
                .from('settings').select('setting_value').eq('setting_key', key).maybeSingle();
            if (error) throw error;

            const order = data?.setting_value ? JSON.parse(data.setting_value) : null;
            return res.status(200).json({ success: true, data: { order } });
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, message: err.message });
        }
    }

    if (req.method === 'POST') {
        try {
            verifyToken(req);
            const { order } = req.body;
            if (!Array.isArray(order)) {
                return res.status(400).json({ success: false, message: 'order must be an array' });
            }

            const { error } = await supabase.from('settings').upsert(
                { setting_key: key, setting_value: JSON.stringify(order) },
                { onConflict: 'setting_key' }
            );
            if (error) throw error;

            return res.status(200).json({ success: true, message: 'Arrangement saved' });
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, message: err.message });
        }
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
}
