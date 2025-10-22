const User = require('../models/user.model.extended');
// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        // req.userId comes from the auth middleware
        const userId = req.userId;
        // Find user by ID but exclude password
        let user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
// Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { 
            bio, location, interests, profilePicture, 
            socialPreferences, lifestyle, values, personalityTraits,
            // Additional questionnaire fields
            musicPreference, foodAdventure, learningStyle, travelInterest,
            questionnaireComplete 
        } = req.body;
        // Validate data
        const updateData = {};
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (interests !== undefined) updateData.interests = interests;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        // Handle questionnaire fields
        if (socialPreferences !== undefined) updateData.socialPreferences = socialPreferences;
        if (lifestyle !== undefined) updateData.lifestyle = lifestyle;
        if (values !== undefined) updateData.values = values;
        if (personalityTraits !== undefined) updateData.personalityTraits = personalityTraits;
        // Handle additional questionnaire fields (top-level)
        if (musicPreference !== undefined) updateData.musicPreference = musicPreference;
        if (foodAdventure !== undefined) updateData.foodAdventure = foodAdventure;
        if (learningStyle !== undefined) updateData.learningStyle = learningStyle;
        if (travelInterest !== undefined) updateData.travelInterest = travelInterest;
        // ONLY set lastQuestionnaireDate when explicitly told questionnaire is complete
        if (questionnaireComplete === true) {
            updateData.lastQuestionnaireDate = new Date();
        }
        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, select: '-password' } // Return updated user without password
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};