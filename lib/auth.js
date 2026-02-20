import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify JWT from Authorization header
 * Returns decoded admin object or throws an error
 */
export function verifyToken(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        const err = new Error('Access token required');
        err.status = 401;
        throw err;
    }

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        const err = new Error('Invalid or expired token');
        err.status = 403;
        throw err;
    }
}

/**
 * CORS headers for all API routes
 */
export function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

/**
 * Handle preflight and set CORS. Returns true if handled.
 */
export function handleCors(req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
}
