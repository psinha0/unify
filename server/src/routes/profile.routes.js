const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all profile routes
router.use(authMiddleware);

// Get current user's profile
router.get('/', profileController.getUserProfile);

// Update current user's profile
router.put('/', profileController.updateUserProfile);

module.exports = router;