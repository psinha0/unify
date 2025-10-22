const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    interests: {
        type: [String],
        default: []
    },
    bio: {
        type: String,
        default: ''
    },
    location: {
        city: String,
        state: String,
        country: String,
        coordinates: {
            type: [Number],  // [longitude, latitude]
            index: '2dsphere' // Enables geospatial queries
        },
        proximityPreference: {
            type: String,
            enum: ['Local only', 'Regional', 'National', 'Global'],
            default: 'Regional'
        }
    },
    profilePicture: {
        type: String,
        default: ''
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    socialPreferences: {
        communicationStyle: {
            type: String,
            enum: ['Text messaging', 'Voice calls', 'Video chats', 'In-person meetups', 'Social media'],
            default: ''
        },
        socialEnergy: {
            type: String,
            enum: ['Introvert', 'Extrovert', 'Ambivert'],
            default: ''
        },
        friendshipType: {
            type: [String],
            enum: ['Casual', 'Deep conversations', 'Activity partners', 'Professional networking', 'Online gaming buddies'],
            default: []
        },
        communicationFrequency: {
            type: String,
            enum: ['Daily check-ins', 'Few times a week', 'Weekly catch-ups', 'Bi-weekly', 'Monthly or less'],
            default: ''
        },
        groupSizePreference: {
            type: String,
            enum: ['One-on-one', 'Small groups (2-4 people)', 'Medium groups (5-8 people)', 'Large groups (9+ people)', 'No preference'],
            default: ''
        },
        friendshipGoals: {
            type: String,
            enum: ['Activity partners', 'Deep conversations', 'Casual hangouts', 'Professional networking', 'Study/work buddies'],
            default: ''
        },
        conversationTopics: {
            type: String,
            enum: ['Current events', 'Personal growth', 'Hobbies & interests', 'Work & career', 'Pop culture', 'Deep philosophical topics'],
            default: ''
        }
    },
    lifestyle: {
        schedule: {
            type: String,
            enum: ['Morning person', 'Night owl', 'Flexible'],
            default: 'Flexible'
        },
        activityLevel: {
            type: String,
            enum: ['Very active (daily exercise)', 'Moderately active (few times a week)', 'Occasionally active', 'Prefer low-activity'],
            default: ''
        },
        weekendPlans: {
            type: [String],
            enum: ['Outdoor adventures', 'Cultural events', 'Relaxing at home', 'Social gatherings', 'Sports', 'Creative projects'],
            default: []
        },
        availability: {
            type: String,
            enum: ['Weekday evenings', 'Weekend days', 'Weekend evenings', 'Flexible schedule', 'Lunch breaks'],
            default: ''
        }
    },
    values: {
        friendshipValues: {
            type: String,
            enum: ['Loyalty', 'Honesty', 'Similar interests', 'Good conversation', 'Emotional support', 'Fun and humor'],
            default: ''
        },
        general: {
            type: [String],
            default: []  // e.g., ['Environmentalism', 'Family', 'Career growth', 'Creativity', 'Education']
        }
    },
    languagesSpoken: {
        type: [String],
        default: []
    },
    personalityTraits: {
        openness: { type: Number, min: 1, max: 5, default: 3 },
        conscientiousness: { type: Number, min: 1, max: 5, default: 3 },
        extraversion: { type: Number, min: 1, max: 5, default: 3 },
        agreeableness: { type: Number, min: 1, max: 5, default: 3 },
        neuroticism: { type: Number, min: 1, max: 5, default: 3 }
    },
    personalityQuestions: [{
        question: String,
        answer: String
    }],
    swipeHistory: [{
        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        action: {
            type: String,
            enum: ['like', 'pass'],
            required: true
        },
        matchScore: Number,
        matchFactors: mongoose.Schema.Types.Mixed,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    inferredPreferences: {
        preferredMatchScore: Number,
        importantFactors: mongoose.Schema.Types.Mixed,
        lastUpdated: Date
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;