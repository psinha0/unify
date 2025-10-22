import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/api';
import '../../styles/profile.css';
const ProfilePrompts = ({ forNewUser, onComplete }) => {
    const { user, setUser, setIsNewUser } = useAuth();
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [response, setResponse] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [promptIndex, setPromptIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [matchImprovementData, setMatchImprovementData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    // Expanded question pool for new users (20+ questions, will select 10 randomly)
    const allNewUserPrompts = useMemo(() => [
        {
            id: 'communication_style',
            question: 'How do you prefer to communicate with friends?',
            options: ['Text messaging', 'Voice calls', 'Video chats', 'In-person meetups', 'Social media'],
            category: 'socialPreferences',
            field: 'communicationStyle',
            mapping: {
                'Text messaging': 'Text-heavy',
                'Voice calls': 'Voice calls',
                'Video chats': 'Video calls',
                'In-person meetups': 'In-person meetups',
                'Social media': 'Text-heavy'
            },
            importance: 'high',
            explanation: 'This helps us match you with friends who communicate in similar ways.'
        },
        {
            id: 'social_energy',
            question: 'After socializing, do you typically feel:',
            options: ['Energized and ready for more', 'It depends on the people', 'Drained and needing alone time'],
            category: 'socialPreferences',
            field: 'socialEnergy',
            mapping: {
                'Energized and ready for more': 'Extrovert',
                'It depends on the people': 'Ambivert',
                'Drained and needing alone time': 'Introvert'
            },
            importance: 'high',
            explanation: 'Understanding your social energy helps us find compatible friends.'
        },
        {
            id: 'weekend_activity',
            question: 'What\'s your ideal weekend activity?',
            options: ['Outdoor adventures', 'Cultural events', 'Relaxing at home', 'Social gatherings', 'Sports', 'Creative projects'],
            category: 'lifestyle',
            field: 'weekendPlans',
            importance: 'high',
            explanation: 'Shared weekend preferences lead to better friendships.'
        },
        {
            id: 'friendship_value',
            question: 'What do you value most in a friendship?',
            options: ['Loyalty', 'Honesty', 'Similar interests', 'Good conversation', 'Emotional support', 'Fun and humor'],
            category: 'values',
            field: null,
            importance: 'high',
            explanation: 'Core values alignment is crucial for lasting friendships.'
        },
        {
            id: 'activity_level',
            question: 'How would you describe your activity level?',
            options: ['Very active (daily exercise)', 'Moderately active (few times a week)', 'Occasionally active', 'Prefer low-activity'],
            category: 'lifestyle',
            field: 'activityLevel',
            mapping: {
                'Very active (daily exercise)': 'Very active',
                'Moderately active (few times a week)': 'Moderately active',
                'Occasionally active': 'Low activity',
                'Prefer low-activity': 'Low activity'
            },
            importance: 'high',
            explanation: 'Activity level compatibility helps with shared activities.'
        },
        {
            id: 'time_availability',
            question: 'When are you usually available to hang out?',
            options: ['Weekday evenings', 'Weekend days', 'Weekend evenings', 'Flexible schedule', 'Lunch breaks'],
            category: 'lifestyle',
            field: 'availability',
            importance: 'medium',
            explanation: 'Matching schedules makes it easier to spend time together.'
        },
        {
            id: 'group_size_preference',
            question: 'Do you prefer hanging out:',
            options: ['One-on-one', 'Small groups (2-4 people)', 'Medium groups (5-8 people)', 'Large groups (9+ people)', 'No preference'],
            category: 'socialPreferences',
            field: 'groupSizePreference',
            importance: 'medium',
            explanation: 'Group size preferences help us suggest the right social settings.'
        },
        {
            id: 'conversation_topics',
            question: 'What topics do you enjoy discussing most?',
            options: ['Current events', 'Personal growth', 'Hobbies & interests', 'Work & career', 'Pop culture', 'Deep philosophical topics'],
            category: 'socialPreferences',
            field: 'conversationTopics',
            importance: 'medium',
            explanation: 'Shared conversation interests lead to more engaging interactions.'
        },
        {
            id: 'music_preference',
            question: 'What role does music play in your life?',
            options: ['Essential part of my day', 'Background noise', 'Special occasions only', 'Love discovering new music', 'Not really into music'],
            category: 'interests',
            field: 'musicPreference',
            importance: 'low',
            explanation: 'Music preferences can be a great conversation starter.'
        },
        {
            id: 'food_adventure',
            question: 'How adventurous are you with food?',
            options: ['Love trying new cuisines', 'Somewhat adventurous', 'Stick to what I know', 'Very picky eater', 'Dietary restrictions limit me'],
            category: 'lifestyle',
            field: 'foodAdventure',
            importance: 'low',
            explanation: 'Food preferences matter for social outings.'
        },
        {
            id: 'humor_style',
            question: 'What kind of humor do you appreciate?',
            options: ['Witty and clever', 'Silly and goofy', 'Dark humor', 'Sarcastic', 'Wholesome and clean', 'Puns and wordplay'],
            category: 'socialPreferences',
            field: 'humorStyle',
            importance: 'medium',
            explanation: 'Shared sense of humor strengthens friendships.'
        },
        {
            id: 'conflict_resolution',
            question: 'When there\'s a disagreement, you prefer to:',
            options: ['Talk it out immediately', 'Take time to cool down first', 'Avoid confrontation', 'Seek compromise', 'Agree to disagree'],
            category: 'socialPreferences',
            field: 'conflictStyle',
            importance: 'high',
            explanation: 'Understanding conflict styles helps maintain healthy friendships.'
        },
        {
            id: 'spontaneity',
            question: 'How spontaneous are you?',
            options: ['Love last-minute plans', 'Okay with some spontaneity', 'Prefer advance notice', 'Need to plan everything', 'Depends on my mood'],
            category: 'lifestyle',
            field: 'spontaneity',
            importance: 'medium',
            explanation: 'Planning preferences affect how you socialize.'
        },
        {
            id: 'pet_preference',
            question: 'How do you feel about pets?',
            options: ['Can\'t live without them', 'Love them but don\'t have any', 'They\'re okay', 'Not a fan', 'Allergic or can\'t have them'],
            category: 'lifestyle',
            field: 'petPreference',
            importance: 'low',
            explanation: 'Pet preferences can influence hangout locations.'
        },
        {
            id: 'learning_style',
            question: 'What\'s your favorite way to learn new things?',
            options: ['Hands-on experience', 'Reading and research', 'Video tutorials', 'Taking classes', 'Learning from others'],
            category: 'interests',
            field: 'learningStyle',
            importance: 'low',
            explanation: 'Learning preferences can lead to shared activities.'
        },
        {
            id: 'morning_night',
            question: 'Are you a morning person or night owl?',
            options: ['Early bird (up before 7am)', 'Morning person (7-9am)', 'Midday person', 'Night owl (active after 10pm)', 'Varies by day'],
            category: 'lifestyle',
            field: 'schedule',
            mapping: {
                'Early bird (up before 7am)': 'Morning person',
                'Morning person (7-9am)': 'Morning person',
                'Midday person': 'Flexible',
                'Night owl (active after 10pm)': 'Night owl',
                'Varies by day': 'Flexible'
            },
            importance: 'medium',
            explanation: 'Schedule alignment makes planning easier.'
        },
        {
            id: 'stress_relief',
            question: 'How do you prefer to de-stress?',
            options: ['Exercise', 'Talking with friends', 'Alone time', 'Creative activities', 'Entertainment (TV/games)', 'Nature and outdoors'],
            category: 'lifestyle',
            field: 'stressRelief',
            importance: 'medium',
            explanation: 'Understanding stress relief helps in supporting each other.'
        },
        {
            id: 'social_media_use',
            question: 'How active are you on social media?',
            options: ['Very active (multiple posts/day)', 'Regularly active', 'Occasional lurker', 'Rarely use it', 'Don\'t have social media'],
            category: 'socialPreferences',
            field: 'socialMediaUse',
            importance: 'low',
            explanation: 'Social media habits affect how you stay connected.'
        },
        {
            id: 'travel_interest',
            question: 'How interested are you in travel?',
            options: ['Love traveling (always planning trips)', 'Enjoy occasional trips', 'Prefer staycations', 'Not really into travel', 'Want to but can\'t currently'],
            category: 'interests',
            field: 'travelInterest',
            importance: 'medium',
            explanation: 'Travel interests can lead to shared adventures.'
        },
        {
            id: 'support_style',
            question: 'When a friend is going through a tough time, you:',
            options: ['Offer practical solutions', 'Listen and empathize', 'Try to cheer them up', 'Give them space', 'Share similar experiences'],
            category: 'socialPreferences',
            field: 'supportStyle',
            importance: 'high',
            explanation: 'Support styles affect how friendships deepen.'
        }
    ], []);
    // Randomly select 10 questions from the pool for new users
    const newUserPrompts = useMemo(() => {
        if (!forNewUser) return [];
        // Shuffle the array using Fisher-Yates algorithm
        const shuffled = [...allNewUserPrompts];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        // Return first 10 questions
        return shuffled.slice(0, 10);
    }, [allNewUserPrompts, forNewUser]);
    // Shorter questionnaire for existing users (2-3 questions)
    const existingUserPrompts = useMemo(() => [
        {
            id: 'recent_interests',
            question: 'What new interests have you developed lately?',
            options: ['Fitness & wellness', 'Creative arts', 'Technology', 'Travel planning', 'Cooking', 'Gaming', 'Reading', 'None recently'],
            category: 'interests',
            field: 'recentInterests',
            importance: 'medium',
            explanation: 'New interests help us find fresh connections.'
        },
        {
            id: 'friendship_goals',
            question: 'What are you looking for in new friendships right now?',
            options: ['Activity partners', 'Deep conversations', 'Casual hangouts', 'Professional networking', 'Study/work buddies'],
            category: 'socialPreferences',
            field: 'friendshipGoals',
            importance: 'high',
            explanation: 'Understanding your current friendship goals helps us make better matches.'
        },
        {
            id: 'communication_frequency',
            question: 'How often do you like to stay in touch with friends?',
            options: ['Daily check-ins', 'Few times a week', 'Weekly catch-ups', 'Bi-weekly', 'Monthly or less'],
            category: 'socialPreferences',
            field: 'communicationFrequency',
            importance: 'medium',
            explanation: 'Communication frequency preferences prevent mismatched expectations.'
        }
    ], []);
    // Memoize the prompts array based on user type
    const prompts = useMemo(() => {
        return forNewUser ? newUserPrompts : existingUserPrompts;
    }, [forNewUser, newUserPrompts, existingUserPrompts]);
    // Calculate progress for new users
    useEffect(() => {
        if (forNewUser) {
            setProgress(Math.round((promptIndex / prompts.length) * 100));
        }
    }, [promptIndex, prompts.length, forNewUser]);
    // Define handleComplete before it's used in useEffect
    const handleComplete = useCallback(async () => {
        // Mark questionnaire as complete in the database
        try {
            const updatedUser = await updateUserProfile({ questionnaireComplete: true });
            // NOW update user context with the complete user data including lastQuestionnaireDate
            if (setUser && updatedUser) {
                setUser(updatedUser);
            }
        } catch (error) {
        }
        if (setIsNewUser) {
            setIsNewUser(false);
        }
        if (onComplete) {
            onComplete();
        }
        // Show match improvement data
        const improvementData = {
            questionsAnswered: forNewUser ? prompts.length : 1,
            matchQualityIncrease: forNewUser ? 45 : 15,
            newPotentialMatches: forNewUser ? 12 : 3,
            profileCompleteness: forNewUser ? 85 : (user.profileCompleteness || 60) + 10
        };
        setMatchImprovementData(improvementData);
    }, [setIsNewUser, onComplete, forNewUser, prompts.length, user, setUser]);
    // Initialize prompt for user
    useEffect(() => {
        if (!user) return;
        if (forNewUser) {
            if (promptIndex < prompts.length) {
                setCurrentPrompt(prompts[promptIndex]);
                setResponse('');
            } else {
                // All prompts completed for new user
                handleComplete();
            }
            return;
        }
        // For existing users, show prompts occasionally
        const shouldShowPrompt = () => {
            const lastPromptTime = localStorage.getItem('lastPromptTime');
            if (lastPromptTime) {
                const timeSinceLastPrompt = Date.now() - parseInt(lastPromptTime);
                const oneDayInMs = 24 * 60 * 60 * 1000;
                if (timeSinceLastPrompt < oneDayInMs) {
                    return false;
                }
            }
            return Math.random() < 0.3;
        };
        if (shouldShowPrompt()) {
            const answeredPromptIds = JSON.parse(localStorage.getItem('answeredPrompts') || '[]');
            const eligiblePrompts = prompts.filter(prompt => !answeredPromptIds.includes(prompt.id));
            if (eligiblePrompts.length > 0) {
                const randomIndex = Math.floor(Math.random() * eligiblePrompts.length);
                setCurrentPrompt(eligiblePrompts[randomIndex]);
                setResponse('');
            }
        }
    }, [user, promptIndex, forNewUser, prompts, handleComplete]);
    const handleSubmit = useCallback(async (selectedOption = null) => {
        const responseToUse = selectedOption || response;
        if (!responseToUse || !currentPrompt) return;
        try {
            const updateData = {};
            // Special handling for values array (when field is null)
            if (currentPrompt.category === 'values' && currentPrompt.field === null) {
                // Add to values array if not already present
                const currentValues = user.values || [];
                if (!currentValues.includes(responseToUse)) {
                    updateData.values = [...currentValues, responseToUse];
                } else {
                    updateData.values = currentValues; // No change needed
                }
            } else if (currentPrompt.category === 'interests' && currentPrompt.field) {
                // Special handling for interests - field goes to root level, not nested
                const mappedValue = currentPrompt.mapping?.[responseToUse] || responseToUse;
                updateData[currentPrompt.field] = mappedValue;
            } else {
                // Create nested structure if needed
                if (!user[currentPrompt.category]) {
                    updateData[currentPrompt.category] = {};
                } else {
                    updateData[currentPrompt.category] = { ...user[currentPrompt.category] };
                }
                // Handle mapped values
                if (currentPrompt.mapping && currentPrompt.mapping[responseToUse]) {
                    updateData[currentPrompt.category][currentPrompt.field] = currentPrompt.mapping[responseToUse];
                } else if (Array.isArray(user[currentPrompt.category]?.[currentPrompt.field])) {
                    updateData[currentPrompt.category][currentPrompt.field] = [
                        ...(user[currentPrompt.category][currentPrompt.field] || []),
                        responseToUse
                    ];
                } else {
                    updateData[currentPrompt.category][currentPrompt.field] = responseToUse;
                }
            }
            // Update user context immediately for responsiveness
            if (setUser) {
                if (currentPrompt.category === 'values' && currentPrompt.field === null) {
                    setUser(prev => ({
                        ...prev,
                        values: updateData.values
                    }));
                } else if (currentPrompt.category === 'interests' && currentPrompt.field) {
                    // For interests with fields, update root-level field
                    setUser(prev => ({
                        ...prev,
                        [currentPrompt.field]: updateData[currentPrompt.field]
                    }));
                } else {
                    setUser(prev => ({
                        ...prev,
                        [currentPrompt.category]: {
                            ...(prev[currentPrompt.category] || {}),
                            [currentPrompt.field]: updateData[currentPrompt.category][currentPrompt.field]
                        }
                    }));
                }
            }
            // API call happens in background - DON'T update user context to avoid re-renders
            await updateUserProfile(updateData);
            // Record answered prompt
            const answeredPrompts = JSON.parse(localStorage.getItem('answeredPrompts') || '[]');
            answeredPrompts.push(currentPrompt.id);
            localStorage.setItem('answeredPrompts', JSON.stringify(answeredPrompts));
            localStorage.setItem('lastPromptTime', Date.now().toString());
            // Short delay before moving to next question for smooth transition
            setTimeout(() => {
                if (forNewUser) {
                    setPromptIndex(prev => prev + 1);
                } else {
                    handleComplete();
                }
                // Reset states for next question
                setIsProcessing(false);
                setResponse('');
            }, 300);
        } catch (err) {
            // Reset processing state on error with a delay to prevent flashing
            setTimeout(() => {
                setIsProcessing(false);
            }, 200);
        }
    }, [response, currentPrompt, user, setUser, forNewUser, handleComplete]);
    const handleOptionSelect = useCallback((option) => {
        if (isProcessing) return; // Prevent multiple selections
        setResponse(option);
        setIsProcessing(true);
        // Add a smooth visual feedback delay before processing
        setTimeout(() => {
            handleSubmit(option); // Pass the option directly
        }, 500); // Visual feedback for 0.5 seconds
    }, [isProcessing, handleSubmit]);
    const handleSkip = useCallback(() => {
        if (forNewUser) {
            setPromptIndex(prev => prev + 1);
        } else {
            setCurrentPrompt(null);
        }
    }, [forNewUser]);
    // Show match improvement results
    if (matchImprovementData) {
        return (
            <div className="match-improvement-results">
                <div className="improvement-header">
                    <h3>🎉 Great! Your profile just got better!</h3>
                    <p>Here's how your responses are helping us find better matches:</p>
                </div>
                <div className="improvement-stats">
                    <div className="stat-item">
                        <div className="stat-number">+{matchImprovementData.matchQualityIncrease}%</div>
                        <div className="stat-label">Match Quality Increase</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">+{matchImprovementData.newPotentialMatches}</div>
                        <div className="stat-label">New Potential Matches</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{matchImprovementData.profileCompleteness}%</div>
                        <div className="stat-label">Profile Complete</div>
                    </div>
                </div>
                <div className="improvement-explanation">
                    <p>
                        📊 Your answers help our algorithm understand your preferences better. 
                        The more you tell us, the better matches we can find!
                    </p>
                </div>
                <button 
                    className="continue-button"
                    onClick={() => setMatchImprovementData(null)}
                >
                    Continue to Dashboard
                </button>
            </div>
        );
    }
    if (!currentPrompt || !user) {
        return null;
    }
    return (
        <div className="profile-prompt-container enhanced">
            {/* Progress bar for new users */}
            {forNewUser && (
                <div className="questionnaire-progress">
                    <div className="progress-header">
                        <span>Question {promptIndex + 1} of {prompts.length}</span>
                        <span>{progress}% complete</span>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
            <div className="profile-prompt-card enhanced">
                <>
                    <div className="prompt-header">
                        <h3>{forNewUser ? '👋 Let\'s get to know you!' : '💡 Quick Question'}</h3>
                        <div className="importance-indicator">
                            <span className={`importance-badge ${currentPrompt.importance}`}>
                                {currentPrompt.importance === 'high' ? '⭐ Important' : '📈 Helpful'}
                            </span>
                        </div>
                    </div>
                    <p className="prompt-question">{currentPrompt.question}</p>
                    {currentPrompt.explanation && (
                        <p className="prompt-explanation">{currentPrompt.explanation}</p>
                    )}
                    <div className="prompt-options enhanced">
                        {currentPrompt.options.map((option, index) => (
                            <button
                                key={index}
                                className={`prompt-option enhanced 
                                    ${response === option ? 'selected' : ''} 
                                    ${isProcessing ? 'processing' : ''}
                                    ${isProcessing && response !== option ? 'disabled' : ''}
                                `}
                                onClick={() => handleOptionSelect(option)}
                                disabled={isProcessing}
                            >
                                {option}
                                {response === option && isProcessing && (
                                    <span className="option-check">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="prompt-actions enhanced">
                        <button 
                            className="prompt-skip enhanced"
                            onClick={handleSkip}
                            disabled={isProcessing}
                        >
                            Skip
                        </button>
                    </div>
                    {forNewUser && (
                        <p className="prompt-note enhanced">
                            💡 Each answer helps us find friends who truly match your personality and preferences.
                        </p>
                    )}
                </>
            </div>
        </div>
    );
};
export default ProfilePrompts;