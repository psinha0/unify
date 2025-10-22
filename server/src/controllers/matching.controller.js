const matchingService = require('../services/matching.service');
const User = require('../models/user.model.extended');
exports.getFriends = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).populate('friends', 'username email profilePicture bio interests location');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.friends || []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friends', error: error.message });
    }
};
exports.getFriendById = async (req, res) => {
    try {
        const userId = req.userId;
        const { friendId } = req.params;
        // Check if the friendId is in the user's friends list
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.friends.includes(friendId)) {
            return res.status(403).json({ message: 'Not authorized to view this friend' });
        }
        // Get the friend's details
        const friend = await User.findById(friendId).select('username email profilePicture bio interests location');
        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }
        res.status(200).json(friend);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friend details', error: error.message });
    }
};
exports.getPotentialFriends = async (req, res) => {
    try {
        const userId = req.userId;
        const potentialFriends = await matchingService.findPotentialFriends(userId);
        res.status(200).json(potentialFriends);
    } catch (error) {
        res.status(500).json({ message: 'Error finding potential friends', error: error.message });
    }
};
exports.getMatchAnalytics = async (req, res) => {
    try {
        const userId = req.userId;
        const analytics = await matchingService.getMatchAnalytics(userId);
        res.status(200).json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Error getting match analytics', error: error.message });
    }
};
exports.matchWithFriend = async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.userId;
        const result = await matchingService.sendFriendRequest(userId, friendId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error sending friend request', error: error.message });
    }
};
exports.unmatchWithFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.userId;
        // Implement unmatch functionality in matching.service.js
        res.status(200).json({ message: 'Friend removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing friend', error: error.message });
    }
};
exports.getFriendRequests = async (req, res) => {
    try {
        const userId = req.userId;
        // Implement getFriendRequests functionality in matching.service.js
        const user = await User.findById(userId).populate('friendRequests.from', 'username profilePicture');
        res.status(200).json(user.friendRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friend requests', error: error.message });
    }
};
exports.acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.userId;
        const result = await matchingService.acceptFriendRequest(userId, requestId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error accepting friend request', error: error.message });
    }
};
exports.rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.userId;
        // Implement rejectFriendRequest functionality in matching.service.js
        res.status(200).json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
    }
};
exports.getMatchAnalytics = async (req, res) => {
    try {
        const userId = req.userId;
        const analytics = await matchingService.getMatchAnalytics(userId);
        res.status(200).json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching match analytics', error: error.message });
    }
};
exports.recordSwipe = async (req, res) => {
    try {
        const userId = req.userId;
        const swipeData = req.body;
        const result = await matchingService.recordSwipe(userId, swipeData);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error recording swipe', error: error.message });
    }
};
exports.sendFriendRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const { friendId } = req.body;
        const result = await matchingService.sendFriendRequest(userId, friendId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error sending friend request', error: error.message });
    }
};