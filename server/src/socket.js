const Message = require('./models/message.model');
const User = require('./models/user.model.extended');
module.exports = (io) => {
    // Store online users
    const onlineUsers = new Map();
    io.on('connection', (socket) => {
        // Handle user login
        socket.on('user_login', (userId) => {
            onlineUsers.set(userId, socket.id);
        });
        // Handle private messages
        socket.on('private_message', async ({ sender, recipient, content }) => {
            try {
                // Save message to database
                const message = new Message({
                    sender,
                    receiver: recipient,  // Fixed: recipient -> receiver to match model
                    content,
                    timestamp: new Date(),
                    read: false,
                    readAt: null
                });
                await message.save();
                // Send to recipient if online
                const recipientSocketId = onlineUsers.get(recipient);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('receive_message', {
                        _id: message._id,
                        sender: message.sender,
                        receiver: message.receiver,
                        content: message.content,
                        timestamp: message.timestamp,
                        read: message.read,
                        readAt: message.readAt
                    });
                }
                // Confirm message was sent
                socket.emit('message_sent', {
                    _id: message._id,
                    timestamp: message.timestamp,
                    read: message.read,
                    readAt: message.readAt
                });
            } catch (error) {
                socket.emit('message_error', { error: error.message });
            }
        });
        // Handle typing indicator
        socket.on('typing', ({ sender, recipient }) => {
            const recipientSocketId = onlineUsers.get(recipient);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user_typing', { sender });
            }
        });
        // Handle chat opening - this ensures read status sync when a user opens a chat
        socket.on('chat_opened', async ({ userId, friendId }) => {
            try {
                // 1. Mark any unread messages from friend to user as read
                const now = new Date();
                // Find unread messages first to get their IDs
                const unreadMessages = await Message.find({
                    sender: friendId,
                    receiver: userId,
                    read: false
                });
                if (unreadMessages.length > 0) {
                    const unreadMessageIds = unreadMessages.map(msg => msg._id);
                    // Update messages in database
                    await Message.updateMany(
                        { _id: { $in: unreadMessageIds } },
                        { $set: { read: true, readAt: now } }
                    );
                    // Get the updated messages with their full details
                    const updatedMessages = await Message.find({
                        _id: { $in: unreadMessageIds }
                    }).lean();
                    // Convert _id to string and format for client
                    const formattedMessages = updatedMessages.map(msg => ({
                        ...msg,
                        _id: msg._id.toString(),
                        read: true,
                        readAt: now
                    }));
                    // Notify sender that messages were read
                    const senderSocketId = onlineUsers.get(friendId);
                    if (senderSocketId) {
                        io.to(senderSocketId).emit('messages_read', {
                            by: userId,
                            count: unreadMessages.length,
                            readAt: now,
                            messageIds: unreadMessageIds.map(id => id.toString()),
                            messages: formattedMessages
                        });
                    }
                }
                // 2. Check if there are any messages from user to friend that user needs to know have been read
                const friendReadMessages = await Message.find({
                    sender: userId,
                    receiver: friendId,
                    read: true
                }).lean();
                if (friendReadMessages.length > 0) {
                    // Format messages for client
                    const formattedFriendReadMessages = friendReadMessages.map(msg => ({
                        ...msg,
                        _id: msg._id.toString()
                    }));
                    // Send the sync event to the user who just opened the chat
                    socket.emit('read_status_sync', {
                        messages: formattedFriendReadMessages
                    });
                }
            } catch (error) {
            }
        });
        // Handle reading messages
        socket.on('mark_messages_read', async ({ userId, friendId }) => {
            try {
                const now = new Date();
                // Find unread messages first to get their IDs
                const unreadMessages = await Message.find(
                    { sender: friendId, receiver: userId, read: false }
                );
                if (unreadMessages.length === 0) {
                    // Even if no new unread messages, check if there are any messages that were previously read
                    // This handles edge cases where sender might need to be updated about previous reads
                    const readMessages = await Message.find(
                        { sender: friendId, receiver: userId, read: true }
                    ).lean().sort({ timestamp: -1 }).limit(20);
                    if (readMessages.length > 0) {
                        const formattedReadMessages = readMessages.map(msg => ({
                            ...msg,
                            _id: msg._id.toString()
                        }));
                        // Notify sender about these already read messages (to sync states)
                        const senderSocketId = onlineUsers.get(friendId);
                        if (senderSocketId) {
                            io.to(senderSocketId).emit('messages_read', {
                                by: userId,
                                count: formattedReadMessages.length,
                                readAt: readMessages[0].readAt || now,
                                messageIds: formattedReadMessages.map(msg => msg._id),
                                messages: formattedReadMessages,
                                isResync: true // Flag to indicate this is a resync of previously read messages
                            });
                        }
                    }
                    return;
                }
                const unreadMessageIds = unreadMessages.map(msg => msg._id.toString());
                // Update messages in database
                const result = await Message.updateMany(
                    { sender: friendId, receiver: userId, read: false },
                    { $set: { read: true, readAt: now } }
                );
                // Get the updated messages with their full details
                const updatedMessages = await Message.find(
                    { _id: { $in: unreadMessageIds } }
                ).lean();
                // Convert _id to string to make it easier to work with in client
                const formattedMessages = updatedMessages.map(msg => ({
                    ...msg,
                    _id: msg._id.toString(),
                    read: true,
                    readAt: now
                }));
                const updatedCount = result.modifiedCount || result.nModified || 0;
                // Notify sender that messages were read
                const senderSocketId = onlineUsers.get(friendId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('messages_read', {
                        by: userId,
                        count: updatedCount,
                        readAt: now,
                        messageIds: unreadMessageIds,
                        messages: formattedMessages
                    });
                }
                // Confirm to reader
                socket.emit('messages_marked_read', {
                    count: updatedCount,
                    messageIds: unreadMessageIds
                });
            } catch (error) {
                socket.emit('message_error', { error: error.message });
            }
        });
        // Handle user disconnect
        socket.on('disconnect', () => {
            let userId = null;
            // Find and remove the disconnected user
            for (const [key, value] of onlineUsers.entries()) {
                if (value === socket.id) {
                    userId = key;
                    break;
                }
            }
            if (userId) {
                onlineUsers.delete(userId);
            }
        });
    });
    // Return the socketData so it can be accessed elsewhere
    return {
        onlineUsers
    };
};