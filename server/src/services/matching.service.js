const User = require('../models/user.model.extended');
const findPotentialFriends = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    // Get IDs of users who have sent friend requests
    const receivedRequestIds = user.friendRequests.map(request => request.from.toString());
    // Find potential friends, excluding current user, existing friends, and request senders
    const potentialFriends = await User.find({
        _id: { 
            $ne: userId,
            $nin: [...user.friends, ...receivedRequestIds]
        }
    })
    .select('-password -friendRequests')
    .limit(20);
    // Enhanced match scoring system
    const scoredFriends = potentialFriends.map(friend => {
        let matchScore = 0;
        let matchFactors = {};
        // Calculate interest match score
        const friendInterests = friend.interests || [];
        const userInterests = user.interests || [];
        if (userInterests.length > 0 && friendInterests.length > 0) {
            const sharedInterests = friendInterests.filter(interest => 
                userInterests.includes(interest)
            );
            const interestScore = Math.floor((sharedInterests.length / Math.max(userInterests.length, 1)) * 100);
            matchScore += interestScore * 0.4; // Interests weighted at 40%
            matchFactors.sharedInterests = sharedInterests;
            matchFactors.interestScore = interestScore;
        }
        // Calculate social preferences match (enhanced with new questionnaire data)
        if (user.socialPreferences && friend.socialPreferences) {
            let socialScore = 0;
            // Communication style match
            if (user.socialPreferences.communicationStyle === friend.socialPreferences.communicationStyle) {
                socialScore += 20;
                matchFactors.communicationMatch = true;
            }
            // Communication frequency match (new)
            if (user.socialPreferences.communicationFrequency && friend.socialPreferences.communicationFrequency) {
                if (user.socialPreferences.communicationFrequency === friend.socialPreferences.communicationFrequency) {
                    socialScore += 15;
                    matchFactors.communicationFrequencyMatch = true;
                } else {
                    // Partial match for adjacent frequencies
                    const frequencies = ['Daily check-ins', 'Few times a week', 'Weekly catch-ups', 'Bi-weekly', 'Monthly or less'];
                    const userIndex = frequencies.indexOf(user.socialPreferences.communicationFrequency);
                    const friendIndex = frequencies.indexOf(friend.socialPreferences.communicationFrequency);
                    if (Math.abs(userIndex - friendIndex) === 1) {
                        socialScore += 8;
                        matchFactors.communicationFrequencyPartialMatch = true;
                    }
                }
            }
            // Group size preference match (new)
            if (user.socialPreferences.groupSizePreference && friend.socialPreferences.groupSizePreference) {
                if (user.socialPreferences.groupSizePreference === friend.socialPreferences.groupSizePreference ||
                    user.socialPreferences.groupSizePreference === 'No preference' ||
                    friend.socialPreferences.groupSizePreference === 'No preference') {
                    socialScore += 12;
                    matchFactors.groupSizeMatch = true;
                }
            }
            // Friendship goals alignment (new)
            if (user.socialPreferences.friendshipGoals && friend.socialPreferences.friendshipGoals) {
                if (user.socialPreferences.friendshipGoals === friend.socialPreferences.friendshipGoals) {
                    socialScore += 18; // High weight for current goals
                    matchFactors.friendshipGoalsMatch = true;
                }
            }
            // Conversation topics match (new)
            if (user.socialPreferences.conversationTopics && friend.socialPreferences.conversationTopics) {
                if (user.socialPreferences.conversationTopics === friend.socialPreferences.conversationTopics) {
                    socialScore += 14;
                    matchFactors.conversationTopicsMatch = true;
                }
            }
            // Social energy compatibility
            if (user.socialPreferences.socialEnergy === friend.socialPreferences.socialEnergy) {
                socialScore += 15;
            } else if (
                (user.socialPreferences.socialEnergy === 'Ambivert') || 
                (friend.socialPreferences.socialEnergy === 'Ambivert')
            ) {
                socialScore += 10;
            }
            // Friendship type match
            if (user.socialPreferences.friendshipType && friend.socialPreferences.friendshipType) {
                const sharedTypes = friend.socialPreferences.friendshipType.filter(type => 
                    user.socialPreferences.friendshipType.includes(type)
                );
                if (sharedTypes.length > 0) {
                    socialScore += Math.min(15, sharedTypes.length * 5);
                    matchFactors.sharedFriendshipTypes = sharedTypes;
                }
            }
            matchScore += socialScore * 0.3; // Social preferences weighted at 30%
            matchFactors.socialScore = socialScore;
        }
        // Calculate lifestyle compatibility (enhanced)
        if (user.lifestyle && friend.lifestyle) {
            let lifestyleScore = 0;
            // Activity level match (enhanced weighting)
            if (user.lifestyle.activityLevel && friend.lifestyle.activityLevel) {
                if (user.lifestyle.activityLevel === friend.lifestyle.activityLevel) {
                    lifestyleScore += 15; // Increased from 10
                    matchFactors.activityLevelMatch = true;
                } else {
                    const activityLevels = ['Prefer low-activity', 'Occasionally active', 'Moderately active (few times a week)', 'Very active (daily exercise)'];
                    const userIndex = activityLevels.indexOf(user.lifestyle.activityLevel);
                    const friendIndex = activityLevels.indexOf(friend.lifestyle.activityLevel);
                    if (Math.abs(userIndex - friendIndex) === 1) {
                        lifestyleScore += 8; // Adjacent activity levels
                        matchFactors.activityLevelPartialMatch = true;
                    }
                }
            }
            // Time availability match (new)
            if (user.lifestyle.availability && friend.lifestyle.availability) {
                if (user.lifestyle.availability === friend.lifestyle.availability ||
                    user.lifestyle.availability === 'Flexible schedule' ||
                    friend.lifestyle.availability === 'Flexible schedule') {
                    lifestyleScore += 12;
                    matchFactors.availabilityMatch = true;
                }
            }
            // Schedule compatibility
            if (user.lifestyle.schedule === friend.lifestyle.schedule) {
                lifestyleScore += 10;
            } else if (
                (user.lifestyle.schedule === 'Flexible') || 
                (friend.lifestyle.schedule === 'Flexible')
            ) {
                lifestyleScore += 5;
            }
            // Weekend plans match
            if (user.lifestyle.weekendPlans && friend.lifestyle.weekendPlans) {
                const sharedPlans = friend.lifestyle.weekendPlans.filter(plan => 
                    user.lifestyle.weekendPlans.includes(plan)
                );
                if (sharedPlans.length > 0) {
                    lifestyleScore += Math.min(10, sharedPlans.length * 3);
                    matchFactors.sharedWeekendPlans = sharedPlans;
                }
            }
            matchScore += lifestyleScore * 0.2; // Lifestyle weighted at 20%
            matchFactors.lifestyleScore = lifestyleScore;
        }
        // Calculate value alignment
        if (user.values?.friendshipValues && friend.values?.friendshipValues) {
            // Check if both users have the same friendship values
            if (user.values.friendshipValues === friend.values.friendshipValues) {
                const valueScore = 10;
                matchScore += valueScore * 0.1; // Values weighted at 10%
                matchFactors.sharedFriendshipValues = user.values.friendshipValues;
                matchFactors.valueScore = valueScore;
            }
        }
        // Also check general values if they exist (for backward compatibility)
        if (user.values?.general && friend.values?.general && 
            Array.isArray(user.values.general) && Array.isArray(friend.values.general)) {
            const sharedValues = friend.values.general.filter(value => 
                user.values.general.includes(value)
            );
            if (sharedValues.length > 0) {
                const valueScore = Math.min(5, sharedValues.length * 2);
                matchScore += valueScore * 0.05; // General values weighted at 5%
                matchFactors.sharedGeneralValues = sharedValues;
                matchFactors.generalValueScore = valueScore;
            }
        }
        // Return friend with calculated match score and match factors
        return {
            ...friend.toObject(),
            matchScore: Math.round(matchScore), // Round to nearest whole number
            matchFactors
        };
    });
    // Sort by match score (highest first)
    return scoredFriends.sort((a, b) => b.matchScore - a.matchScore);
};
const getMatchAnalytics = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Calculate profile completeness
        let completenessScore = 0;
        const maxScore = 100;
        // Basic profile (30 points)
        if (user.bio) completenessScore += 10;
        if (user.location) completenessScore += 10;
        if (user.interests && user.interests.length > 0) completenessScore += 10;
        // Social preferences (40 points)
        if (user.socialPreferences) {
            if (user.socialPreferences.communicationStyle) completenessScore += 6;
            if (user.socialPreferences.socialEnergy) completenessScore += 6;
            if (user.socialPreferences.communicationFrequency) completenessScore += 5;
            if (user.socialPreferences.groupSizePreference) completenessScore += 5;
            if (user.socialPreferences.friendshipGoals) completenessScore += 6;
            if (user.socialPreferences.conversationTopics) completenessScore += 6;
            if (user.socialPreferences.friendshipType && user.socialPreferences.friendshipType.length > 0) completenessScore += 6;
        }
        // Lifestyle (25 points)
        if (user.lifestyle) {
            if (user.lifestyle.activityLevel) completenessScore += 8;
            if (user.lifestyle.availability) completenessScore += 6;
            if (user.lifestyle.weekendPlans && user.lifestyle.weekendPlans.length > 0) completenessScore += 6;
            if (user.lifestyle.schedule) completenessScore += 5;
        }
        // Values (15 points)
        if (user.values) {
            if (user.values.friendshipValues) completenessScore += 15;
        }
        // Get potential matches and analyze improvement
        const allUsers = await User.find({ _id: { $ne: userId } }).select('-password');
        let highQualityMatches = 0;
        let averageMatchScore = 0;
        let totalMatches = 0;
        for (const otherUser of allUsers) {
            // Skip if already friends
            if (user.friends.includes(otherUser._id)) continue;
            let matchScore = 0;
            // Calculate match score using the same logic as findPotentialFriends
            // Interest match
            const friendInterests = otherUser.interests || [];
            const userInterests = user.interests || [];
            if (userInterests.length > 0 && friendInterests.length > 0) {
                const sharedInterests = friendInterests.filter(interest => 
                    userInterests.includes(interest)
                );
                const interestScore = Math.floor((sharedInterests.length / Math.max(userInterests.length, 1)) * 100);
                matchScore += interestScore * 0.4;
            }
            // Social preferences match
            if (user.socialPreferences && otherUser.socialPreferences) {
                let socialScore = 0;
                if (user.socialPreferences.communicationStyle === otherUser.socialPreferences.communicationStyle) {
                    socialScore += 20;
                }
                if (user.socialPreferences.socialEnergy === otherUser.socialPreferences.socialEnergy) {
                    socialScore += 15;
                }
                matchScore += socialScore * 0.3;
            }
            totalMatches++;
            averageMatchScore += matchScore;
            if (matchScore >= 60) {
                highQualityMatches++;
            }
        }
        if (totalMatches > 0) {
            averageMatchScore = Math.round(averageMatchScore / totalMatches);
        }
        // Calculate questionnaire impact - updated to match actual questionnaire
        const questionnaireQuestions = [
            'socialPreferences.communicationStyle',
            'socialPreferences.socialEnergy', 
            'lifestyle.weekendPlans',
            'values.friendshipValues',
            'lifestyle.activityLevel',
            'lifestyle.availability',
            'socialPreferences.groupSizePreference',
            'socialPreferences.conversationTopics'
        ];
        let answeredQuestions = 0;
        questionnaireQuestions.forEach(path => {
            const keys = path.split('.');
            let value = user;
            for (const key of keys) {
                value = value?.[key];
            }
            // Check if value exists and is not empty
            if (value && (typeof value === 'string' ? value.trim() !== '' : value.length > 0)) {
                answeredQuestions++;
            }
        });
        const questionnaireCompletion = Math.round((answeredQuestions / questionnaireQuestions.length) * 100);
        // Estimate improvement potential
        const potentialImprovement = Math.min(50, (100 - questionnaireCompletion) * 0.6);
        return {
            profileCompleteness: completenessScore,
            questionnaireCompletion,
            averageMatchScore,
            highQualityMatches,
            totalPotentialMatches: totalMatches,
            answeredQuestions,
            totalQuestions: questionnaireQuestions.length,
            potentialImprovement: Math.round(potentialImprovement),
            recommendations: generateRecommendations(user, completenessScore, questionnaireCompletion)
        };
    } catch (error) {
        throw error;
    }
};
const generateRecommendations = (user, completenessScore, questionnaireCompletion) => {
    const recommendations = [];
    if (!user.bio) {
        recommendations.push("Add a bio to help others understand your personality (+10% profile strength)");
    }
    if (!user.location) {
        recommendations.push("Add your location to find nearby friends (+10% profile strength)");
    }
    if (!user.interests || user.interests.length < 3) {
        recommendations.push("Add more interests to improve matching accuracy (+15% match quality)");
    }
    if (!user.socialPreferences?.communicationStyle) {
        recommendations.push("Answer communication style questions to find compatible friends (+20% match quality)");
    }
    if (!user.socialPreferences?.friendshipGoals) {
        recommendations.push("Share your friendship goals to get more relevant matches (+18% match quality)");
    }
    if (!user.lifestyle?.activityLevel) {
        recommendations.push("Tell us about your activity level to find activity partners (+15% match quality)");
    }
    if (questionnaireCompletion < 70) {
        recommendations.push("Complete more questionnaire questions to unlock better matches");
    }
    return recommendations.slice(0, 3); // Return top 3 recommendations
};
const sendFriendRequest = async (userId, friendId) => {
    const user = await User.findById(friendId);
    if (!user) {
        throw new Error('User not found');
    }
    // Check if request already exists
    const existingRequest = user.friendRequests.find(
        request => request.from.toString() === userId.toString()
    );
    if (existingRequest) {
        throw new Error('Friend request already sent');
    }
    // Add request to recipient's friendRequests
    user.friendRequests.push({
        from: userId,
        status: 'pending',
        createdAt: new Date()
    });
    await user.save();
    return { message: 'Friend request sent successfully' };
};
const acceptFriendRequest = async (userId, requestId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const requestIndex = user.friendRequests.findIndex(
        request => request._id.toString() === requestId
    );
    if (requestIndex === -1) {
        throw new Error('Friend request not found');
    }
    const request = user.friendRequests[requestIndex];
    // Update request status
    request.status = 'accepted';
    // Add each user to the other's friends list
    user.friends.push(request.from);
    const otherUser = await User.findById(request.from);
    otherUser.friends.push(userId);
    await Promise.all([user.save(), otherUser.save()]);
    return { message: 'Friend request accepted' };
};
const recordSwipe = async (userId, swipeData) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Initialize swipeHistory if it doesn't exist
        if (!user.swipeHistory) {
            user.swipeHistory = [];
        }
        // Add the swipe data to user's history
        user.swipeHistory.push({
            targetUserId: swipeData.targetUserId,
            action: swipeData.action, // 'like' or 'pass'
            matchScore: swipeData.matchScore,
            matchFactors: swipeData.matchFactors,
            timestamp: new Date(swipeData.timestamp)
        });
        // Keep only the last 100 swipes to prevent bloat
        if (user.swipeHistory.length > 100) {
            user.swipeHistory = user.swipeHistory.slice(-100);
        }
        // Save without validation to avoid enum issues with legacy data
        await user.save({ validateBeforeSave: false });
        // Analyze preferences and update user profile
        await updateUserPreferencesFromSwipes(userId, user.swipeHistory);
        return { message: 'Swipe recorded successfully' };
    } catch (error) {
        throw error;
    }
};
const updateUserPreferencesFromSwipes = async (userId, swipeHistory) => {
    // Analyze recent swipes to learn preferences
    const recentSwipes = swipeHistory.slice(-20); // Last 20 swipes
    const likes = recentSwipes.filter(s => s.action === 'like');
    if (likes.length < 5) return; // Need at least 5 likes to analyze
    // Analyze what user likes and update their inferred preferences
    const user = await User.findById(userId);
    // Example: Learn preferred match score range
    const likedMatchScores = likes.map(l => l.matchScore);
    const avgPreferredScore = likedMatchScores.reduce((a, b) => a + b, 0) / likedMatchScores.length;
    // Example: Learn which match factors are important
    const importantFactors = {};
    likes.forEach(like => {
        if (like.matchFactors) {
            Object.keys(like.matchFactors).forEach(factor => {
                importantFactors[factor] = (importantFactors[factor] || 0) + 1;
            });
        }
    });
    // Update user's inferred preferences (you could add this to user model)
    if (!user.inferredPreferences) {
        user.inferredPreferences = {};
    }
    user.inferredPreferences.preferredMatchScore = avgPreferredScore;
    user.inferredPreferences.importantFactors = importantFactors;
    user.inferredPreferences.lastUpdated = new Date();
    await user.save();
};
module.exports = {
    findPotentialFriends,
    sendFriendRequest,
    acceptFriendRequest,
    getMatchAnalytics,
    recordSwipe
};