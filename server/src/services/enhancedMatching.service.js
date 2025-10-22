const User = require('../models/user.model.extended');
// Helper function to calculate compatibility score based on learned data
const calculateLearningBasedScore = async (userId, otherUserId) => {
    try {
        const [user, otherUser] = await Promise.all([
            User.findById(userId),
            User.findById(otherUserId)
        ]);
        if (!user || !otherUser) {
            throw new Error('User not found');
        }
        let learningScore = 0;
        let confidenceScore = 0;
        let insightData = {};
        // Communication style compatibility
        if (user.inferred?.communicationStyle && otherUser.socialPreferences?.responseTime) {
            let communicationMatch = false;
            // Match quick responders with quick responders
            if (user.inferred.communicationStyle === 'Quick responder' && 
                otherUser.socialPreferences.responseTime === 'Quick responder') {
                communicationMatch = true;
                insightData.communicationCompatibility = "You're both quick responders";
                insightData.communicationNote = "You both tend to reply quickly to messages";
                learningScore += 15;
            }
            // Match thoughtful communicators with each other
            else if (user.inferred.communicationStyle === 'Thoughtful communicator' && 
                    otherUser.socialPreferences.responseTime === 'Thoughtful communicator') {
                communicationMatch = true;
                insightData.communicationCompatibility = "You're both thoughtful communicators";
                insightData.communicationNote = "You both take time to craft meaningful responses";
                learningScore += 15;
            }
            // Regular communicators match with anyone
            else if (user.inferred.communicationStyle === 'Regular communicator' || 
                    otherUser.socialPreferences.responseTime === 'Regular communicator') {
                communicationMatch = true;
                insightData.communicationCompatibility = "Compatible communication styles";
                learningScore += 10;
            }
            if (communicationMatch) {
                confidenceScore += 20;
            }
        }
        // Active hours compatibility
        if (user.inferred?.activeHours?.length > 0 && otherUser.inferred?.activeHours?.length > 0) {
            // Check for overlapping active hours
            const userHours = new Set(user.inferred.activeHours);
            const otherUserHours = new Set(otherUser.inferred.activeHours);
            // Find overlapping hours
            const overlappingHours = [...userHours].filter(hour => otherUserHours.has(hour));
            if (overlappingHours.length > 0) {
                // Format the active hours into readable time ranges
                const formatHour = (hour) => {
                    return hour === 0 ? '12 AM' : 
                           hour < 12 ? `${hour} AM` : 
                           hour === 12 ? '12 PM' : 
                           `${hour - 12} PM`;
                };
                const timeRanges = overlappingHours
                    .sort((a, b) => a - b)
                    .map(hour => formatHour(hour))
                    .join(', ');
                insightData.activityTimeMatch = `Both active around: ${timeRanges}`;
                insightData.activityNote = "You're likely to be online at the same time";
                // Score based on number of overlapping hours
                learningScore += Math.min(20, overlappingHours.length * 5);
                confidenceScore += 15;
            }
        }
        // Topic interests compatibility
        if (user.inferred?.topicInterests?.length > 0 && otherUser.interests?.length > 0) {
            // Find recommended conversation topics based on user's inferred interests and other's explicit interests
            const recommendedTopics = user.inferred.topicInterests.filter(topic => 
                otherUser.interests.some(interest => 
                    interest.toLowerCase().includes(topic.toLowerCase()) || 
                    topic.toLowerCase().includes(interest.toLowerCase())
                )
            );
            if (recommendedTopics.length > 0) {
                insightData.recommendedTopics = recommendedTopics;
                learningScore += Math.min(15, recommendedTopics.length * 5);
                confidenceScore += 10;
            }
        }
        // Add more learning-based matching criteria here
        // Only return insights if we have meaningful data
        if (Object.keys(insightData).length > 0) {
            // Overall learning-based compatibility
            insightData.learnedCompatibility = true;
            insightData.confidenceScore = Math.min(95, confidenceScore);
            return {
                learningScore: Math.round(learningScore),
                insightData
            };
        }
        return {
            learningScore: 0,
            insightData: null
        };
    } catch (error) {
        return {
            learningScore: 0,
            insightData: null
        };
    }
};
// Enhanced version of findPotentialFriends that includes learning-based matching
const findPotentialFriendsWithLearning = async (userId) => {
    // Get traditional matches first
    const traditionalMatches = await findPotentialFriends(userId);
    // For each match, calculate additional learning-based score
    const enhancedMatches = await Promise.all(traditionalMatches.map(async (friend) => {
        try {
            const { learningScore, insightData } = await calculateLearningBasedScore(userId, friend._id);
            // Blend traditional and learning-based scores
            // Start with 70% traditional, 30% learning-based
            // As we collect more data and confidence increases, we can adjust this ratio
            let confidenceWeight = insightData?.confidenceScore ? (insightData.confidenceScore / 100) : 0.3;
            // Ensure a minimum of traditional matching still applies
            confidenceWeight = Math.min(0.7, confidenceWeight);
            const blendedScore = Math.round(
                (friend.matchScore * (1 - confidenceWeight)) + 
                (learningScore * confidenceWeight)
            );
            return {
                ...friend,
                originalMatchScore: friend.matchScore,
                learningMatchScore: learningScore,
                matchScore: blendedScore,  // Updated match score
                userInsights: insightData
            };
        } catch (error) {
            return friend; // Return original match if enhancement fails
        }
    }));
    // Re-sort based on new blended scores
    return enhancedMatches.sort((a, b) => b.matchScore - a.matchScore);
};
// The original findPotentialFriends function remains unchanged
const findPotentialFriends = async (userId) => {
    // Logic to find potential friends based on user preferences and interests
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    // Get an array of user IDs that have already sent a friend request to this user
    const receivedRequestIds = user.friendRequests.map(request => request.from.toString());
    // Find users with similar interests, excluding:
    // 1. The current user
    // 2. Existing friends
    // 3. Users who have already sent friend requests to this user
    const potentialFriends = await User.find({
        _id: { 
            $ne: userId,
            $nin: [...user.friends, ...receivedRequestIds]
        }
    })
    .select('-password -friendRequests')
    .limit(20);  // Limit to 20 potential friends to avoid overwhelming the user
    // Calculate match score based on shared interests
    const scoredFriends = potentialFriends.map(friend => {
        // Count how many interests match
        let matchScore = 0;
        const friendInterests = friend.interests || [];
        const userInterests = user.interests || [];
        if (userInterests.length > 0 && friendInterests.length > 0) {
            // Calculate percentage of shared interests
            const sharedInterests = friendInterests.filter(interest => 
                userInterests.includes(interest)
            );
            matchScore = Math.floor((sharedInterests.length / Math.max(userInterests.length, 1)) * 100);
        }
        // Return friend with calculated match score
        return {
            ...friend.toObject(),
            matchScore
        };
    });
    // Sort by match score (highest first)
    return scoredFriends.sort((a, b) => b.matchScore - a.matchScore);
};
// Function to record user feedback on matches for learning
const recordMatchFeedback = async (userId, targetUserId, feedbackType) => {
    try {
        // Valid feedback types: 'skip', 'connect', 'message', 'block'
        if (!['skip', 'connect', 'message', 'block'].includes(feedbackType)) {
            throw new Error('Invalid feedback type');
        }
        await User.findByIdAndUpdate(userId, {
            $push: {
                feedbackHistory: {
                    targetUser: targetUserId,
                    feedbackType,
                    createdAt: new Date()
                }
            }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
// Function to store questionnaire responses
const saveQuestionnaireResponse = async (userId, questionId, response, category) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $push: {
                questionnaireResponses: {
                    questionId,
                    response,
                    category,
                    createdAt: new Date()
                }
            },
            lastQuestionnaireDate: new Date()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
module.exports = {
    findPotentialFriends,
    findPotentialFriendsWithLearning,
    calculateLearningBasedScore,
    recordMatchFeedback,
    saveQuestionnaireResponse
};