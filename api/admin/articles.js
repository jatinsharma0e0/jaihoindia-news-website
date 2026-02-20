import { handleCors, verifyToken } from '../../lib/auth.js';
import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;

    // GET – list articles, POST – create article
    if (req.method === 'GET') {
        try {
            verifyToken(req);
            const { status, category } = req.query;

            let query = supabase.from('articles').select('*, admins!author_id(username)');
            if (status) query = query.eq('status', status);
            if (category) query = query.eq('category', category);

            const { data: articles, error } = await query.order('updated_at', { ascending: false });
            if (error) throw error;

            const formatted = articles.map(a => ({
                ...a,
                image: a.image_url,
                author_name: a.admins?.username || 'Unknown',
            }));

            return res.status(200).json({ success: true, data: formatted });
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, message: err.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const admin = verifyToken(req);
            const { title, slug, summary, content, category, status, tags } = req.body;
            const image_url = req.body.image_url || req.body.image;

            if (!title || !content || !category) {
                return res.status(400).json({ success: false, message: 'Title, content and category are required' });
            }

            const published_at = status === 'published' ? new Date().toISOString() : null;

            const { data, error } = await supabase
                .from('articles')
                .insert([{ title, slug, summary, content, image_url, category, tags: tags || '', author_id: admin.id, status, is_original: true, published_at }])
                .select();

            if (error) throw error;

            return res.status(201).json({ success: true, message: 'Article created', data: { id: data[0].id } });
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, message: err.message });
        }
    }

    res.status(405).json({ success: false, message: 'Method not allowed' });
}
