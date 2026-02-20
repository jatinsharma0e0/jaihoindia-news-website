import { handleCors, verifyToken } from '../../../lib/auth.js';
import { supabase } from '../../../lib/supabase.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    const { id } = req.query;

    if (req.method === 'PUT') {
        try {
            verifyToken(req);
            const { title, slug, summary, content, category, status, tags } = req.body;
            const image_url = req.body.image_url || req.body.image;

            const updateData = { title, slug, summary, content, image_url, category, tags: tags || '', status, updated_at: new Date().toISOString() };
            if (status === 'published') updateData.published_at = new Date().toISOString();

            const { error } = await supabase.from('articles').update(updateData).eq('id', id);
            if (error) throw error;

            return res.status(200).json({ success: true, message: 'Article updated' });
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, message: err.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            verifyToken(req);
            const { error } = await supabase.from('articles').delete().eq('id', id);
            if (error) throw error;
            return res.status(200).json({ success: true, message: 'Article deleted' });
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, message: err.message });
        }
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
}
