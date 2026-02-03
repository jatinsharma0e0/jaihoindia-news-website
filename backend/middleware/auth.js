const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * JWT authentication middleware
 * Protects admin routes
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required',
            });
        }

        jwt.verify(token, config.jwt.secret, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token',
                });
            }

            req.admin = decoded;
            next();
        });

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed',
        });
    }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Allowed roles
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.admin || !roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
};
