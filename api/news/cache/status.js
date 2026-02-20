import { handleCors } from '../../../lib/auth.js';
import { getCacheStats } from '../../../lib/cache.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        const stats = await getCacheStats();
        res.status(200).json({
            success: true,
            data: stats || { message: 'Cache is empty' },
        });
    } catch (error) {
        console.error('Cache status error:', error);
        res.status(500).json({ success: false, message: 'Failed to get cache status', error: error.message });
    }
}
