const mongoose = require('mongoose');

// Extended schema to support learning and adaptation
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
    // Basic profile fields
    interests: {
        type: [String],
        default: []
    },
    // Additional interest tracking fields (separate from interests array)
    musicPreference: {
        type: String,
        default: ''
    },
    foodAdventure: {
        type: String,
        default: ''
    },
    learningStyle: {
        type: String,
        default: ''
    },
    travelInterest: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    
    // Enhanced profile fields for better matching
    socialPreferences: {
        communicationStyle: {
            type: String,
            enum: ['Text-heavy', 'Voice calls', 'Video calls', 'In-person meetups', 'All of the above'],
            default: 'All of the above'
        },
        socialEnergy: {
            type: String,
            enum: ['Introvert', 'Extrovert', 'Ambivert'],
            default: 'Ambivert'
        },
        friendshipType: {
            type: [String],
            enum: ['Casual', 'Deep conversations', 'Activity partners', 'Professional networking', 'Online gaming buddies'],
            default: []
        },
        responseTime: {
            type: String,
            enum: ['Quick responder', 'Regular communicator', 'Thoughtful communicator'],
            default: 'Regular communicator'
        },
        // Additional questionnaire fields
        groupSizePreference: String,
        conversationTopics: String,
        humorStyle: String,
        conflictStyle: String,
        socialMediaUse: String,
        supportStyle: String
    },
    
    lifestyle: {
        schedule: {
            type: String,
            enum: ['Morning person', 'Night owl', 'Flexible'],
            default: 'Flexible'
        },
        activityLevel: {
            type: String,
            enum: ['Very active', 'Moderately active', 'Low activity'],
            default: 'Moderately active'
        },
        weekendPlans: {
            type: [String],
            enum: ['Outdoor adventures', 'Cultural events', 'Relaxing at home', 'Social gatherings', 'Sports'],
            default: []
        },
        // Additional questionnaire fields
        availability: String,
        foodAdventure: String,
        spontaneity: String,
        petPreference: String,
        stressRelief: String
    },
    
    values: {
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
    
    // Learned/inferred user attributes
    inferred: {
        // Topics the user discusses frequently in messages
        topicInterests: {
            type: [String],
            default: []
        },
        // When the user is most active on the platform
        activeHours: [{
            type: Number,
            min: 0,
            max: 23
        }],
        // Communication patterns
        communicationStyle: {
            type: String,
            default: 'Regular communicator'
        },
        // Friends the user interacts with most
        favoriteContacts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        // Learned interests based on interactions
        inferredInterests: {
            type: [String],
            default: []
        }
    },
    
    // Feedback from interactions to refine matches
    feedbackHistory: [{
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        feedbackType: {
            type: String,
            enum: ['skip', 'connect', 'message', 'block'],
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Questionnaire responses
    questionnaireResponses: [{
        questionId: {
            type: String,
            required: true
        },
        response: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Connection data
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
    
    // Learning progress tracking
    profileCompleteness: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    
    lastQuestionnaireDate: {
        type: Date,
        default: null
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    lastActive: {
        type: Date,
        default: Date.now
    }
});

// Method to calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function() {
    let score = 0;
    const totalFields = 15; // Total number of key profile fields
    
    // Basic profile fields
    if (this.bio && this.bio.length > 10) score++;
    if (this.location) score++;
    if (this.profilePicture) score++;
    if (this.interests && this.interests.length >= 3) score++;
    
    // Social preferences
    if (this.socialPreferences?.communicationStyle) score++;
    if (this.socialPreferences?.socialEnergy) score++;
    if (this.socialPreferences?.friendshipType?.length > 0) score++;
    
    // Lifestyle
    if (this.lifestyle?.schedule) score++;
    if (this.lifestyle?.activityLevel) score++;
    if (this.lifestyle?.weekendPlans?.length > 0) score++;
    
    // Values and personality
    if (this.values && this.values.length > 0) score++;
    if (this.personalityTraits?.openness !== 3) score++; // Check if it's been customized
    
    // Questionnaire participation
    if (this.questionnaireResponses?.length >= 3) score++;
    
    // Inferred data
    if (this.inferred?.topicInterests?.length > 0) score++;
    if (this.inferred?.inferredInterests?.length > 0) score++;
    
    // Calculate percentage
    return Math.floor((score / totalFields) * 100);
};

// Middleware to update profile completeness before saving
userSchema.pre('save', function(next) {
    this.profileCompleteness = this.calculateProfileCompleteness();
    this.lastActive = new Date();
    next();
});

// Middleware to update last active timestamp
userSchema.pre('findOneAndUpdate', function(next) {
    this.update({}, { $set: { lastActive: new Date() } });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;