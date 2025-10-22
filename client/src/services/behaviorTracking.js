// A service for tracking user behavior and generating insights
import { getSocket } from './socket';
import { updateUserProfile } from './api';
import { analyzeTextForTopics, getAllTopics } from './topicDefinitions';
// Initialize the storage for tracking behavioral data
let behaviorsToTrack = {
    messageFrequency: [],
    responseTime: [],
    interactionPatterns: {},
    activeHours: {},
    friendPreferences: {},
    topicInterests: {}
};
// Reset the tracking data
const resetTracking = () => {
    behaviorsToTrack = {
        messageFrequency: [],
        responseTime: [],
        interactionPatterns: {},
        activeHours: {},
        friendPreferences: {},
        topicInterests: {}
    };
};
// Track a message being sent
const trackMessageSent = (message, recipientId) => {
    // Track timestamp for active hours analysis
    const hour = new Date().getHours();
    if (!behaviorsToTrack.activeHours[hour]) {
        behaviorsToTrack.activeHours[hour] = 0;
    }
    behaviorsToTrack.activeHours[hour]++;
    // Track friend interactions frequency
    if (!behaviorsToTrack.friendPreferences[recipientId]) {
        behaviorsToTrack.friendPreferences[recipientId] = {
            messageCount: 0,
            lastMessageTime: Date.now(),
            totalResponseTime: 0,
            responseCount: 0
        };
    }
    behaviorsToTrack.friendPreferences[recipientId].messageCount++;
    behaviorsToTrack.friendPreferences[recipientId].lastMessageTime = Date.now();
    // Track message content for topic interests using centralized topic definitions
    const messageText = message.content;
    if (messageText) {
        // Use the centralized topic analysis function
        const matchedTopics = analyzeTextForTopics(messageText);
        // Update topic interest counts
        Object.keys(matchedTopics).forEach(topic => {
            if (!behaviorsToTrack.topicInterests[topic]) {
                behaviorsToTrack.topicInterests[topic] = 0;
            }
            behaviorsToTrack.topicInterests[topic]++;
        });
    }
    // Save the updated tracking data after each interaction
    saveTrackingData();
    // For development purposes only - save to local JSON file
    if (isDev) {
        saveDevTrackingData('message_sent', {
            message, 
            recipientId, 
            timestamp: new Date().toISOString()
        });
    }
};
// Track a message being received
const trackMessageReceived = (message, senderId) => {
    // Calculate response time if it's a reply
    if (behaviorsToTrack.friendPreferences[senderId]?.lastMessageTime) {
        const responseTime = Date.now() - behaviorsToTrack.friendPreferences[senderId].lastMessageTime;
        behaviorsToTrack.friendPreferences[senderId].totalResponseTime += responseTime;
        behaviorsToTrack.friendPreferences[senderId].responseCount++;
    }
    // For development purposes only - save to local JSON file
    if (isDev) {
        saveDevTrackingData('message_received', {
            message,
            senderId,
            timestamp: new Date().toISOString(),
            responseTime: behaviorsToTrack.friendPreferences[senderId]?.lastMessageTime ? 
                Date.now() - behaviorsToTrack.friendPreferences[senderId].lastMessageTime : null
        });
    }
    // Track message content for topic interests using centralized topic definitions
    const messageText = message.content;
    if (messageText) {
        // Use the centralized topic analysis function
        const matchedTopics = analyzeTextForTopics(messageText);
        // Update topic interest counts with half weight since it's not user-generated content
        Object.keys(matchedTopics).forEach(topic => {
            if (!behaviorsToTrack.topicInterests[topic]) {
                behaviorsToTrack.topicInterests[topic] = 0;
            }
            behaviorsToTrack.topicInterests[topic] += 0.5;
        });
    }
};
// Save the tracking data to localStorage for persistence
const saveTrackingData = () => {
    try {
        localStorage.setItem('userBehaviorData', JSON.stringify(behaviorsToTrack));
    } catch (error) {
    }
};
// Load the tracking data from localStorage
const loadTrackingData = () => {
    try {
        const savedData = localStorage.getItem('userBehaviorData');
        if (savedData) {
            behaviorsToTrack = JSON.parse(savedData);
        }
    } catch (error) {
    }
};
// Generate insights from collected behavioral data
const generateInsights = () => {
    const insights = {
        activeHours: getMostActiveHours(),
        favoriteContacts: getFavoriteContacts(),
        topicInterests: getTopTopics(),
        communicationStyle: getCommunicationStyle()
    };
    return insights;
};
// Get the hours when the user is most active
const getMostActiveHours = () => {
    const hours = Object.keys(behaviorsToTrack.activeHours)
        .map(hour => ({
            hour: parseInt(hour),
            count: behaviorsToTrack.activeHours[hour]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    return hours.map(h => h.hour);
};
// Get the contacts the user interacts with most frequently
const getFavoriteContacts = () => {
    return Object.keys(behaviorsToTrack.friendPreferences)
        .map(friendId => ({
            friendId,
            messageCount: behaviorsToTrack.friendPreferences[friendId].messageCount
        }))
        .sort((a, b) => b.messageCount - a.messageCount)
        .slice(0, 5)
        .map(f => f.friendId);
};
// Get the topics the user discusses most frequently
const getTopTopics = () => {
    return Object.keys(behaviorsToTrack.topicInterests)
        .map(topic => ({
            topic,
            count: behaviorsToTrack.topicInterests[topic]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(t => t.topic);
};
// Infer the user's communication style based on message patterns
const getCommunicationStyle = () => {
    // Analyze average message length, response time, and message frequency
    let totalMessages = 0;
    let totalResponseTime = 0;
    let responseCount = 0;
    Object.values(behaviorsToTrack.friendPreferences).forEach(friend => {
        totalMessages += friend.messageCount;
        totalResponseTime += friend.totalResponseTime;
        responseCount += friend.responseCount;
    });
    // Quick responder: average response time under 5 minutes
    if (responseCount > 0 && (totalResponseTime / responseCount) < 5 * 60 * 1000) {
        return 'Quick responder';
    }
    // Frequent communicator: more than 10 messages per friend on average
    if (Object.keys(behaviorsToTrack.friendPreferences).length > 0 && 
        (totalMessages / Object.keys(behaviorsToTrack.friendPreferences).length) > 10) {
        return 'Frequent communicator';
    }
    // Default style
    return 'Regular communicator';
};
// Sync insights with user profile periodically
const syncInsightsWithProfile = async (userId) => {
    try {
        // Only sync if we have enough data
        if (Object.keys(behaviorsToTrack.activeHours).length === 0 && 
            Object.keys(behaviorsToTrack.friendPreferences).length === 0) {
            return;
        }
        const insights = generateInsights();
        // Update the user profile with new insights
        await updateUserProfile({
            inferred: {
                activeHours: insights.activeHours,
                topicInterests: insights.topicInterests,
                communicationStyle: insights.communicationStyle
            }
        });
        // Track when we last synced insights
        localStorage.setItem('lastInsightSync', Date.now().toString());
    } catch (error) {
    }
};
// Initialize the behavior tracking
const initializeBehaviorTracking = (userId) => {
    loadTrackingData();
    // Setup periodic syncing (every week)
    const checkAndSync = () => {
        const lastSync = parseInt(localStorage.getItem('lastInsightSync') || '0');
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - lastSync > oneWeekMs) {
            syncInsightsWithProfile(userId);
        }
    };
    // Check if sync is needed when user opens app
    checkAndSync();
    // Also schedule regular checks
    setInterval(checkAndSync, 24 * 60 * 60 * 1000); // Daily check
    return {
        trackMessageSent,
        trackMessageReceived,
        generateInsights,
        resetTracking
    };
};
// Development-only functions for local tracking
const loadDevTrackingData = () => {
    if (!isDev || !fs) return null;
    try {
        const data = fs.readFileSync(DEV_TRACKING_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return default structure if file doesn't exist or has issues
        return {
            users: {},
            interactions: [],
            messagePatterns: {},
            responseTimeAnalysis: {},
            conversationTopics: {},
            sentiment: {},
            userEngagement: {},
            lastUpdated: new Date().toISOString()
        };
    }
};
const saveDevTrackingData = (action, data) => {
    if (!isDev) return;
    // Function to analyze message content for topics using the centralized topic definitions
    const analyzeMessageTopics = (message, currentData) => {
        if (!message || !message.content) return;
        // Ensure conversationTopics exists in the data structure
        if (!currentData.conversationTopics) {
            currentData.conversationTopics = {};
        }
        // Use our centralized topic analysis function
        const matchedTopics = analyzeTextForTopics(message.content);
        // Process each matched topic
        Object.keys(matchedTopics).forEach(topic => {
            // Initialize topic counter if not exists
            if (!currentData.conversationTopics[topic]) {
                currentData.conversationTopics[topic] = { 
                    count: 0,
                    examples: [],
                    lastDetected: null
                };
            }
            // Increment counter
            currentData.conversationTopics[topic].count++;
            // Add example (keep only up to 5 examples)
            if (currentData.conversationTopics[topic].examples.length < 5) {
                currentData.conversationTopics[topic].examples.push({
                    snippet: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
                    timestamp: new Date().toISOString()
                });
            }
            // Update last detected time
            currentData.conversationTopics[topic].lastDetected = new Date().toISOString();
        });
        return currentData;
    };
    try {
        // Use browser localStorage as fallback if fs is not available (for dev in browser)
        if (!fs) {
            const currentData = localStorage.getItem('devUserTracking') 
                ? JSON.parse(localStorage.getItem('devUserTracking')) 
                : devUserTracking;
            // Update the interactions array
            currentData.interactions.push({ action, ...data, timestamp: new Date().toISOString() });
            // Analyze for topics if it's a message
            if ((action === 'message_sent' || action === 'message_received') && data.message) {
                analyzeMessageTopics(data.message, currentData);
            }
            currentData.lastUpdated = new Date().toISOString();
            // Save back to localStorage
            localStorage.setItem('devUserTracking', JSON.stringify(currentData));
            return;
        }
        // If fs is available, use the file system
        const currentData = loadDevTrackingData() || devUserTracking;
        // Update the interactions array
        currentData.interactions.push({ action, ...data, timestamp: new Date().toISOString() });
        // Analyze for topics if it's a message
        if ((action === 'message_sent' || action === 'message_received') && data.message) {
            analyzeMessageTopics(data.message, currentData);
        }
        currentData.lastUpdated = new Date().toISOString();
        // Save to file
        fs.writeFileSync(DEV_TRACKING_PATH, JSON.stringify(currentData, null, 2));
    } catch (error) {
    }
};
export { 
    initializeBehaviorTracking,
    trackMessageSent,
    trackMessageReceived,
    generateInsights,
    resetTracking,
    // Development only exports - not for production use
    loadDevTrackingData,
    saveDevTrackingData
};