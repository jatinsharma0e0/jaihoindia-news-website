import { handleCors, verifyToken } from '../../../lib/auth.js';
import { supabase } from '../../../lib/supabase.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'DELETE') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        verifyToken(req);
        const { id } = req.query;

        // Fetch record URL
        const { data: record, error: fetchError } = await supabase
            .from('gallery_images').select('image_url').eq('id', id).single();
        if (fetchError) throw fetchError;

        // Delete from storage
        if (record?.image_url) {
            try {
                const url = new URL(record.image_url);
                const parts = url.pathname.split('/');
                const publicIndex = parts.indexOf('public');
                if (publicIndex !== -1 && parts.length > publicIndex + 2) {
                    const bucket = parts[publicIndex + 1];
                    const filePath = parts.slice(publicIndex + 2).join('/');
                    await supabase.storage.from(bucket).remove([filePath]);
                }
            } catch (e) {
                console.warn('Storage delete warning:', e.message);
            }
        }

        const { error } = await supabase.from('gallery_images').delete().eq('id', id);
        if (error) throw error;

        res.status(200).json({ success: true, message: 'Image deleted' });
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
}
