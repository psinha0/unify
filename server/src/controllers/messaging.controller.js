const Message = require('../models/message.model');
const User = require('../models/user.model.extended');
// Send a message
exports.sendMessage = async (req, res) => {
    const { senderId, receiverId, content } = req.body;
    try {
        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            timestamp: new Date()
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
};
// Get messages between two users
exports.getMessages = async (req, res) => {
    const { userId1, userId2 } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving messages', error });
    }
};
// Get chat history with a specific friend
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        const { friendId } = req.params;
        // Check if users are friends
        const user = await User.findById(userId);
        if (!user.friends.includes(friendId)) {
            return res.status(403).json({ message: 'Not authorized to view this chat history' });
        }
        // Get messages between the two users
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: friendId },
                { sender: friendId, receiver: userId }
            ]
        }).sort({ timestamp: 1 });
        // Mark messages from friend as read when retrieving chat history
        await Message.updateMany(
            { sender: friendId, receiver: userId, read: false },
            { $set: { read: true, readAt: new Date() } }
        );
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving chat history', error: error.message });
    }
};
// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        const { friendId } = req.params;
        // Get unread messages before updating them
        const unreadMessages = await Message.find({
            sender: friendId,
            receiver: userId,
            read: false
        });
        const now = new Date();
        // Mark all unread messages from this friend as read
        const result = await Message.updateMany(
            { sender: friendId, receiver: userId, read: false },
            { $set: { read: true, readAt: now } }
        );
        const updatedCount = result.modifiedCount || result.nModified || 0;
        // If there are unread messages, notify the sender through socket
        if (unreadMessages.length > 0) {
            // Get the socket.io instance from the app
            const io = req.app.get('socketio');
            const { onlineUsers } = req.app.get('socketData') || { onlineUsers: new Map() };
            // Get updated messages
            const updatedMessageIds = unreadMessages.map(msg => msg._id);
            const updatedMessagesData = await Message.find({ _id: { $in: updatedMessageIds } }).lean();
            const formattedMessages = updatedMessagesData.map(msg => ({
                ...msg,
                _id: msg._id.toString(),
                read: true,
                readAt: now
            }));
            // Notify sender if online
            const senderSocketId = onlineUsers.get(friendId);
            if (senderSocketId && io) {
                io.to(senderSocketId).emit('messages_read', {
                    by: userId,
                    count: updatedCount,
                    readAt: now,
                    messageIds: updatedMessageIds.map(id => id.toString()),
                    messages: formattedMessages
                });
            }
        }
        res.status(200).json({
            message: `Marked ${updatedCount} messages as read`,
            updatedCount: updatedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error marking messages as read', error: error.message });
    }
};