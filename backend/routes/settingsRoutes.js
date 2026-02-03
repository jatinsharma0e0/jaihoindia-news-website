const express = require('express');
const router = express.Router();
const { getSettings, updateSetting } = require('../controllers/settingsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require admin privileges
router.use(authenticateToken, authorizeRoles('admin'));

// Get all settings
router.get('/', getSettings);

// Update a setting
router.post('/', updateSetting);

module.exports = router;
