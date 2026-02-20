import { handleCors } from '../../../lib/auth.js';
import { supabase } from '../../../lib/supabase.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ success: false, message: 'Article ID required' });

        // Try to find by ID or slug in Supabase original articles
        const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .or(`id.eq.${id},slug.eq.${id}`)
            .eq('status', 'published')
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (article) {
            return res.status(200).json({ success: true, data: article });
        }

        // Not found in Supabase
        res.status(404).json({ success: false, message: 'Article not found' });
    } catch (error) {
        console.error('Get article error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch article', error: error.message });
    }
}
