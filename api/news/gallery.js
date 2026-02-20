import { handleCors } from '../../lib/auth.js';
import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        const { data: images, error } = await supabase
            .from('gallery_images')
            .select('*')
            .not('image_url', 'ilike', '%/public/documents/%')
            .not('image_url', 'ilike', '%/public/team/%')
            .order('uploaded_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data: images || [] });
    } catch (error) {
        console.error('Gallery error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch gallery', error: error.message });
    }
}
