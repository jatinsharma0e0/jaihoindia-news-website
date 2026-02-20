import { handleCors, verifyToken } from '../../lib/auth.js';
import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    if (req.method === 'GET') {
        try {
            verifyToken(req);
            const { type } = req.query;
            let query = supabase.from('gallery_images').select('*');

            if (type === 'documents') {
                query = query.ilike('image_url', '%/public/documents/%');
            } else if (type === 'team') {
                query = query.ilike('image_url', '%/public/team/%');
            } else if (type === 'gallery') {
                query = query
                    .not('image_url', 'ilike', '%/public/documents/%')
                    .not('image_url', 'ilike', '%/public/team/%');
            }

            const { data: images, error } = await query.order('uploaded_at', { ascending: false });
            if (error) throw error;

            return res.status(200).json({ success: true, data: images || [] });
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, message: err.message });
        }
    }

    if (req.method === 'POST') {
        try {
            verifyToken(req);
            const { image_url, caption } = req.body;
            if (!image_url) return res.status(400).json({ success: false, message: 'image_url is required' });

            const { data, error } = await supabase
                .from('gallery_images')
                .insert([{ image_url, caption: caption || null }])
                .select();

            if (error) throw error;
            return res.status(201).json({ success: true, message: 'Image added', data: data[0] });
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, message: err.message });
        }
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
}
