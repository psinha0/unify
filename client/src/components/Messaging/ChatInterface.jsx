import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useParams, useHistory } from 'react-router-dom';
import { 
    sendMessage, 
    receiveMessages, 
    connectSocket, 
    disconnectSocket, 
    markMessagesAsRead,
    onMessagesRead,
    onMessageSent,
    onMessageError,
    sendTypingIndicator,
    onUserTyping,
    notifyChatOpened,
    onReadStatusSync,
    getSocket,
    createConversationId
} from '../../services/socket';
import { getChatHistory, markMessagesAsRead as apiMarkMessagesAsRead } from '../../services/api';
import { trackMessageSent, trackMessageReceived } from '../../services/behaviorTracking';
import '../../styles/chat.css';
// Safe time formatter utility function
const formatTime = (dateObj) => {
    try {
        if (!dateObj) return '';
        // If it's not a Date object, try to convert it
        const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
        // Check if it's a valid date
        if (isNaN(date.getTime())) return '';
        // Format the time
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        return '';
    }
};
const ChatInterface = () => {
    const { user } = useAuth();
    const { friendId } = useParams();
    const history = useHistory();
    const [friend, setFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const messagesEndRef = useRef(null);
    // Setup socket connection and handlers
    useEffect(() => {
        // Connect to socket when component mounts
        connectSocket();
        const handleReceiveMessage = (message) => {
            // Format the timestamp correctly with error handling
            let formattedMessage = { ...message };
            try {
                // Try to format timestamp as Date
                if (message.timestamp) {
                    formattedMessage.timestamp = new Date(message.timestamp);
                    if (isNaN(formattedMessage.timestamp.getTime())) {
                        formattedMessage.timestamp = new Date();
                    }
                } else {
                    formattedMessage.timestamp = new Date();
                }
                // Try to format readAt as Date if it exists
                if (message.readAt) {
                    formattedMessage.readAt = new Date(message.readAt);
                    if (isNaN(formattedMessage.readAt.getTime())) {
                        formattedMessage.readAt = null;
                    }
                } else {
                    formattedMessage.readAt = null;
                }
            } catch (error) {
                formattedMessage.timestamp = new Date();
                formattedMessage.readAt = null;
            }
            setMessages((prevMessages) => [...prevMessages, formattedMessage]);
            // Track received message for behavioral learning
            if (message.sender === friendId) {
                try {
                    trackMessageReceived(formattedMessage, friendId);
                } catch (error) {
                }
            }
            // If we receive a message from the friend we're chatting with, mark it as read
            if (message.sender === friendId && user?._id) {
                markMessagesAsRead({ userId: user._id, friendId });
            }
        };
        const handleMessageSent = (confirmation) => {
            // Update the message in our state with the server-generated ID
            setMessages((prevMessages) => 
                prevMessages.map(msg => {
                    // Match by timestamp if no _id, using getTime for accurate comparison
                    const msgTime = msg.timestamp.getTime();
                    const confTime = new Date(confirmation.timestamp).getTime();
                    // Allow for small time differences (within 1 second)
                    const isTimeMatch = Math.abs(msgTime - confTime) < 1000;
                    if (msg.isSent && !msg._id && isTimeMatch) {
                        return { 
                            ...msg, 
                            _id: confirmation._id, 
                            timestamp: new Date(confirmation.timestamp),
                            read: confirmation.read || false,
                            readAt: confirmation.readAt ? new Date(confirmation.readAt) : null
                        };
                    }
                    return msg;
                })
            );
        };
        const handleMessageError = (error) => {
            setError(`Error sending message: ${error.message}`);
            setTimeout(() => setError(null), 5000);
        };
        const handleMessagesRead = (data) => {
            if (data.by === friendId) {
                // Ensure readAt is properly formatted as a Date
                let readAtDate;
                try {
                    // If readAt exists, try to convert it to a Date
                    readAtDate = data.readAt ? new Date(data.readAt) : new Date();
                    // Check if it's a valid date
                    if (isNaN(readAtDate.getTime())) {
                        readAtDate = new Date();
                    }
                } catch (error) {
                    readAtDate = new Date();
                }
                // Update read status of messages in state
                setMessages((prevMessages) => {
                    // Create a map of updated messages for quick lookup
                    const updatedMsgs = new Map();
                    // If we have detailed message data from the server, use it
                    if (data.messages && Array.isArray(data.messages)) {
                        data.messages.forEach(serverMsg => {
                            try {
                                // Parse the timestamps safely
                                let msgTimestamp = new Date();
                                let msgReadAt = readAtDate;
                                if (serverMsg.timestamp) {
                                    try {
                                        msgTimestamp = new Date(serverMsg.timestamp);
                                        if (isNaN(msgTimestamp.getTime())) msgTimestamp = new Date();
                                    } catch (e) {
                                    }
                                }
                                if (serverMsg.readAt) {
                                    try {
                                        msgReadAt = new Date(serverMsg.readAt);
                                        if (isNaN(msgReadAt.getTime())) msgReadAt = readAtDate;
                                    } catch (e) {
                                    }
                                }
                                updatedMsgs.set(serverMsg._id, {
                                    ...serverMsg,
                                    read: true,
                                    readAt: msgReadAt,
                                    timestamp: msgTimestamp
                                });
                            } catch (e) {
                            }
                        });
                    }
                    // Handle resync operations more aggressively
                    if (data.isResync) {
                        // For resyncs, force update all sender's messages as read
                        return prevMessages.map(msg => {
                            // If we have detailed data for this message, use it
                            if (msg._id && updatedMsgs.has(msg._id)) {
                                return updatedMsgs.get(msg._id);
                            }
                            // For resyncs, be more aggressive in marking sender's messages as read
                            if (msg.sender === user?.id) {
                                return { 
                                    ...msg, 
                                    read: true, 
                                    readAt: readAtDate
                                };
                            }
                            return msg;
                        });
                    }
                    // Regular update for normal read receipts
                    return prevMessages.map(msg => {
                        // If we have detailed data for this message, use it
                        if (msg._id && updatedMsgs.has(msg._id)) {
                            return updatedMsgs.get(msg._id);
                        }
                        // Otherwise use the message ID list or just update based on sender
                        if ((msg.sender === user?.id && !msg.read) || 
                            (data.messageIds && data.messageIds.includes(msg._id))) {
                            return { 
                                ...msg, 
                                read: true, 
                                readAt: readAtDate
                            };
                        }
                        return msg;
                    });
                });
                // Force scroll to bottom to show the read status updates
                scrollToBottom();
            }
        };
        const handleUserTyping = (data) => {
            if (data.sender === friendId) {
                setIsTyping(true);
                // Clear any existing timeout
                if (typingTimeout) {
                    clearTimeout(typingTimeout);
                }
                // Set a timeout to clear the typing indicator after 3 seconds
                const timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 3000);
                setTypingTimeout(timeout);
            }
        };
        // Handle read status sync events
        const handleReadStatusSync = (data) => {
            if (data.messages && data.messages.length > 0) {
                // Update messages with synced read statuses
                setMessages(prevMessages => {
                    // Create a map of message IDs from the sync data
                    const syncedMessageMap = new Map();
                    data.messages.forEach(syncedMsg => {
                        syncedMessageMap.set(syncedMsg._id, {
                            ...syncedMsg,
                            timestamp: new Date(syncedMsg.timestamp),
                            readAt: syncedMsg.readAt ? new Date(syncedMsg.readAt) : null
                        });
                    });
                    // Update local messages with synced read statuses
                    return prevMessages.map(msg => {
                        if (msg._id && syncedMessageMap.has(msg._id)) {
                            const syncedMsg = syncedMessageMap.get(msg._id);
                            return {
                                ...msg,
                                read: syncedMsg.read,
                                readAt: syncedMsg.readAt
                            };
                        }
                        return msg;
                    });
                });
            }
        };
        // Register socket event handlers
        receiveMessages(handleReceiveMessage);
        onMessageSent(handleMessageSent);
        onMessageError(handleMessageError);
        onMessagesRead(handleMessagesRead);
        onUserTyping(handleUserTyping);
        onReadStatusSync(handleReadStatusSync);
        // Notify server that user is online if we have a user ID
        if (user && user._id) {
            const socket = getSocket();
            socket.emit('user_login', user._id);
        }
        return () => {
            // Cleanup the socket connection when component unmounts
            disconnectSocket();
            // Clear any existing typing timeout to prevent memory leaks
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        };
    }, [user, friendId, typingTimeout]);
    // Load friend details and chat history
    useEffect(() => {
        const loadFriendAndChat = async () => {
            if (!friendId || !user) return;
            setLoading(true);
            try {
                // Import this function at the top of the file
                const { getFriendById } = await import('../../services/api');
                // Get friend details
                const friendData = await getFriendById(friendId);
                setFriend(friendData);
                // Get chat history
                const chatHistory = await getChatHistory(friendId);
                // Notify server that chat is opened and sync read statuses
                if (user._id) {
                    try {
                        // This will trigger the server to mark messages as read AND sync read statuses
                        notifyChatOpened(user._id, friendId);
                        // Also emit the socket event for immediate sync
                        const socket = getSocket();
                        if (socket && socket.connected) {
                            socket.emit('chatOpened', { 
                                conversationId: createConversationId(user._id, friendId),
                                userId: user._id,
                                friendId: friendId
                            });
                        }
                        // Also use the traditional method as backup
                        markMessagesAsRead({ userId: user._id, friendId });
                    } catch (err) {
                    }
                }
                // Format the timestamps as Date objects with error handling
                const formattedHistory = chatHistory.map(msg => {
                    let timestamp, readAt;
                    try {
                        timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
                        if (isNaN(timestamp.getTime())) {
                            timestamp = new Date();
                        }
                    } catch (err) {
                        timestamp = new Date();
                    }
                    try {
                        readAt = msg.readAt ? new Date(msg.readAt) : null;
                        if (readAt && isNaN(readAt.getTime())) {
                            readAt = null;
                        }
                    } catch (err) {
                        readAt = null;
                    }
                    return {
                        ...msg,
                        timestamp,
                        readAt
                    };
                });
                setMessages(formattedHistory);
                // Mark messages as read when chat is opened
                if (user._id) {
                    try {
                        // First update via socket for real-time update to other user
                        markMessagesAsRead({ userId: user._id, friendId });
                        // Then update via API to ensure database is updated
                        await apiMarkMessagesAsRead(friendId);
                    } catch (err) {
                    }
                }
            } catch (error) {
                setError('Failed to load chat data. Please try again.');
                setTimeout(() => setError(null), 5000);
            } finally {
                setLoading(false);
            }
        };
        loadFriendAndChat();
    }, [friendId, user]);
    // Create scrollToBottom function as a ref so we can call it from multiple places
    const scrollToBottom = useCallback(() => {
        // Try both methods to ensure scrolling works properly
        setTimeout(() => {
            // Method 1: Use messagesEndRef
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
            // Method 2: Use direct container scrolling (as backup)
            const chatContainer = document.querySelector('.chat-messages');
            if (chatContainer) {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }, 100); // Small delay to ensure DOM updates have completed
    }, []);
    // Scroll to bottom of messages when they update or typing status changes
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);
    const handleSendMessage = () => {
        if (newMessage.trim() && user && user._id && friendId) {
            try {
                const messageData = {
                    sender: user._id,
                    receiver: friendId,
                    content: newMessage
                };
                // Send via socket
                sendMessage(messageData);
                // Add message to local state with a unique client-side ID
                const clientMessageId = `temp-${Date.now()}`;
                const newMsg = {
                    _id: null, // Will be updated when server confirms
                    clientMessageId, // Temporary client-side ID to help with matching
                    sender: user._id,
                    receiver: friendId,
                    content: newMessage,
                    timestamp: new Date(),
                    read: false,
                    readAt: null,
                    isSent: true
                };
                // Track this message for behavioral learning
                try {
                    trackMessageSent(newMsg, friendId);
                } catch (error) {
                }
                setMessages((prevMessages) => [...prevMessages, newMsg]);
                setNewMessage('');
                // Scroll to bottom
                scrollToBottom();
            } catch (error) {
                setError(`Failed to send message: ${error.message || 'Unknown error'}`);
                setTimeout(() => setError(null), 5000);
            }
        }
    };
    // Handle back button to return to dashboard
    const handleBack = () => {
        history.push('/dashboard');
    };
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading chat...</p>
            </div>
        );
    }
    return (
        <div className="chat-container">
            <div className="chat-header">
                <button className="back-button" onClick={handleBack}>
                    &larr; Back
                </button>
                {friend && (
                    <div className="chat-friend-info">
                        <img 
                            src={friend.profilePicture || 'https://via.placeholder.com/40'} 
                            alt={friend.username} 
                            className="chat-avatar"
                        />
                        <div className="chat-name">
                            <h3>{friend.username}</h3>
                            <p>{friend.location}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="chat-messages">
                {error && <div className="error-message">{error}</div>}
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`message ${msg.sender === user._id ? 'sent' : 'received'}`}
                        >
                            <div className="message-content">{msg.content}</div>
                            <div className="message-info">
                                <span className="message-time">
                                    {formatTime(msg.timestamp)}
                                </span>
                                {msg.sender === user._id && (
                                    <span className="message-status">
                                        {msg.read ? (
                                            <span className="status-read" title={`Read at ${formatTime(msg.readAt) || 'unknown time'}`}>
                                                ✓✓ Read
                                            </span>
                                        ) : (
                                            <span className="status-sent">
                                                ✓ Sent
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isTyping && (
                    <div className="typing-indicator">
                        <span>{friend?.username || 'Friend'} is typing</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        // Debounce typing indicator to reduce socket traffic
                        if (user?._id && friendId) {
                            // Clear existing timeout if any
                            if (typingTimeout) {
                                clearTimeout(typingTimeout);
                            }
                            // Only send typing indicator every 1 second at most
                            const newTimeout = setTimeout(() => {
                                sendTypingIndicator(user._id, friendId);
                            }, 300);
                            setTypingTimeout(newTimeout);
                        }
                    }}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} disabled={!newMessage.trim()}>Send</button>
            </div>
        </div>
    );
};
export default ChatInterface;