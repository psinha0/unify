const express = require('express');
const router = express.Router();
const messagingController = require('../controllers/messaging.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware
router.use(authMiddleware);

// Route to send a message
router.post('/send', messagingController.sendMessage);

// Route to get messages with a specific user
router.get('/messages/:userId', messagingController.getMessages);

// Route to get chat history with a specific friend
router.get('/history/:friendId', messagingController.getChatHistory);

// Route to mark messages as read
router.put('/read/:friendId', messagingController.markAsRead);

module.exports = router;