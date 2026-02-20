import { handleCors, verifyToken } from '../../../lib/auth.js';
import { supabase } from '../../../lib/supabase.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'DELETE') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        verifyToken(req);
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'ids must be a non-empty array' });
        }

        // Fetch all records
        const { data: records, error: fetchError } = await supabase
            .from('gallery_images').select('id, image_url').in('id', ids);
        if (fetchError) throw fetchError;

        // Group files by bucket
        const bucketFiles = {};
        for (const record of records) {
            if (!record.image_url) continue;
            try {
                const url = new URL(record.image_url);
                const parts = url.pathname.split('/');
                const pubIdx = parts.indexOf('public');
                if (pubIdx !== -1 && parts.length > pubIdx + 2) {
                    const bucket = parts[pubIdx + 1];
                    const filePath = parts.slice(pubIdx + 2).join('/');
                    if (!bucketFiles[bucket]) bucketFiles[bucket] = [];
                    bucketFiles[bucket].push(filePath);
                }
            } catch { /* skip */ }
        }

        // Delete from storage in parallel
        await Promise.allSettled(
            Object.entries(bucketFiles).map(([bucket, paths]) =>
                supabase.storage.from(bucket).remove(paths)
            )
        );

        // Delete DB rows
        const { error } = await supabase.from('gallery_images').delete().in('id', ids);
        if (error) throw error;

        res.status(200).json({ success: true, message: `Deleted ${records.length} item(s)`, deletedCount: records.length });
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
}
