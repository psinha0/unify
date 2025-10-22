import { io } from 'socket.io-client';
// Create a singleton socket instance
let socket;
// Helper function to create consistent conversation IDs
const createConversationId = (userId1, userId2) => {
    // Sort the IDs to ensure the conversation ID is the same regardless of who initiates
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
};
// Safe way to get environment variables in browser
const getEnvVar = (name, defaultValue) => {
    try {
        return typeof process !== 'undefined' && 
               process.env && 
               process.env[name] ? 
               process.env[name] : defaultValue;
    } catch (e) {
        return defaultValue;
    }
};
// Get socket URL safely
const SOCKET_URL = getEnvVar('REACT_APP_SOCKET_URL', 'http://localhost:5000');
const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            autoConnect: false
        });
    }
    return socket;
};
const connectSocket = () => {
    const socket = getSocket();
    if (!socket.connected) {
        socket.connect();
    }
};
const disconnectSocket = () => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
};
const onMessageReceived = (callback) => {
    const socket = getSocket();
    socket.off('message').on('message', callback);
};
const receiveMessages = (callback) => {
    const socket = getSocket();
    socket.off('receive_message').on('receive_message', callback);
};
const sendMessage = (message) => {
    try {
        const socket = getSocket();
        socket.emit('private_message', message);
    } catch (error) {
    }
};
const markMessagesAsRead = ({ userId, friendId }) => {
    try {
        const socket = getSocket();
        socket.emit('mark_messages_read', { userId, friendId });
    } catch (error) {
    }
};
const onMessagesRead = (callback) => {
    const socket = getSocket();
    socket.off('messages_read').on('messages_read', callback);
};
const onMessagesMarkedRead = (callback) => {
    const socket = getSocket();
    socket.off('messages_marked_read').on('messages_marked_read', callback);
};
const onMessageSent = (callback) => {
    const socket = getSocket();
    socket.off('message_sent').on('message_sent', callback);
};
const onMessageError = (callback) => {
    const socket = getSocket();
    socket.off('message_error').on('message_error', callback);
};
const sendTypingIndicator = (sender, recipient) => {
    try {
        const socket = getSocket();
        socket.emit('typing', { sender, recipient });
    } catch (error) {
    }
};
const onUserTyping = (callback) => {
    const socket = getSocket();
    socket.off('user_typing').on('user_typing', callback);
};
// New function to notify server when a chat is opened
const notifyChatOpened = (userId, friendId) => {
    try {
        const socket = getSocket();
        const conversationId = createConversationId(userId, friendId);
        socket.emit('chatOpened', { conversationId, userId, friendId });
    } catch (error) {
    }
};
// Handle read status sync events
const onReadStatusSync = (callback) => {
    const socket = getSocket();
    socket.off('read_status_sync').on('read_status_sync', callback);
};
export { 
    connectSocket, 
    disconnectSocket, 
    onMessageReceived, 
    sendMessage, 
    receiveMessages, 
    markMessagesAsRead, 
    onMessagesRead, 
    onMessagesMarkedRead,
    onMessageSent,
    onMessageError,
    sendTypingIndicator,
    onUserTyping,
    notifyChatOpened,
    onReadStatusSync,
    getSocket,
    createConversationId
};