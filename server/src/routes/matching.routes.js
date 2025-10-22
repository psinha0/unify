const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matching.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Route to get the user's friends
router.get('/friends', matchingController.getFriends);

// Route to get a specific friend by ID
router.get('/friends/:friendId', matchingController.getFriendById);

// Route to get potential friends
router.get('/potential-friends', matchingController.getPotentialFriends);

// Route to match with a friend
router.post('/match', matchingController.matchWithFriend);

// Route to unmatch with a friend
router.delete('/unmatch/:friendId', matchingController.unmatchWithFriend);

// Get pending friend requests
router.get('/requests', matchingController.getFriendRequests);

// Accept a friend request
router.post('/requests/:requestId/accept', matchingController.acceptFriendRequest);

// Reject a friend request
router.post('/requests/:requestId/reject', matchingController.rejectFriendRequest);

// Get match analytics
router.get('/analytics', matchingController.getMatchAnalytics);

// Record swipe for preference learning
router.post('/record-swipe', matchingController.recordSwipe);

// Send friend request (for swipe likes)
router.post('/friend-request', matchingController.sendFriendRequest);

module.exports = router;