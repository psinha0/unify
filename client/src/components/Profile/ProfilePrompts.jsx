import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../services/api';
import '../../styles/profile.css';

const ProfilePrompts = ({ forNewUser, onComplete }) => {
    const { user, setUser, setIsNewUser } = useAuth();
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [response, setResponse] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [promptIndex, setPromptIndex] = useState(0); // For new users going through all prompts
    
    // Define a series of prompts that help us learn more about the user
    const possiblePrompts = [
        {
            id: 'communication_style',
            question: 'How do you prefer to communicate with friends?',
            options: ['Text messaging', 'Voice calls', 'Video chats', 'In-person meetups'],
            category: 'socialPreferences',
            field: 'communicationStyle',
            frequency: 'weekly', // How often this prompt can appear
        },
        {
            id: 'weekend_activity',
            question: 'What\'s your ideal weekend activity?',
            options: ['Outdoor adventures', 'Cultural events', 'Relaxing at home', 'Social gatherings', 'Sports'],
            category: 'lifestyle',
            field: 'weekendPlans',
            frequency: 'weekly',
        },
        {
            id: 'friendship_value',
            question: 'What do you value most in a friendship?',
            options: ['Loyalty', 'Honesty', 'Similar interests', 'Good conversation', 'Emotional support'],
            category: 'values',
            field: 'friendshipValues',
            frequency: 'monthly',
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
            frequency: 'monthly',
        }
    ];

    useEffect(() => {
        if (!user) return;
        
        // If this is for new users, show all prompts in sequence
        if (forNewUser) {
            if (promptIndex < possiblePrompts.length) {
                setCurrentPrompt(possiblePrompts[promptIndex]);
                setSubmitted(false);
            } else {
                // All prompts completed for new user
                if (setIsNewUser) {
                    setIsNewUser(false);
                }
                // Call onComplete callback if provided
                if (onComplete) {
                    onComplete();
                }
            }
            return;
        }
        
        // Regular flow for returning users - show occasional prompts
        const shouldShowPrompt = () => {
            // Check if user has recently answered a prompt (within last 24 hours)
            const lastPromptTime = localStorage.getItem('lastPromptTime');
            if (lastPromptTime) {
                const timeSinceLastPrompt = Date.now() - parseInt(lastPromptTime);
                const oneDayInMs = 24 * 60 * 60 * 1000;
                if (timeSinceLastPrompt < oneDayInMs) {
                    return false;
                }
            }
            
            // Show prompt with 30% probability when user loads profile page
            return Math.random() < 0.3;
        };
        
        const selectPrompt = () => {
            // Filter out prompts the user has already answered recently
            const answeredPromptIds = JSON.parse(localStorage.getItem('answeredPrompts') || '[]');
            const eligiblePrompts = possiblePrompts.filter(prompt => !answeredPromptIds.includes(prompt.id));
            
            if (eligiblePrompts.length === 0) return null;
            
            // Select a random prompt from eligible ones
            const randomIndex = Math.floor(Math.random() * eligiblePrompts.length);
            return eligiblePrompts[randomIndex];
        };
        
        if (shouldShowPrompt() && user) {
            const prompt = selectPrompt();
            if (prompt) {
                setCurrentPrompt(prompt);
                setSubmitted(false);
            }
        }
    }, [user, promptIndex, forNewUser, setIsNewUser, onComplete]);
    
    const handleOptionSelect = (option) => {
        setResponse(option);
    };
    
    const handleSubmit = async () => {
        if (!response || !currentPrompt) return;
        
        try {
            // Store answer in user profile
            const updateData = {};
            
            // Create nested structure if needed
            if (!user[currentPrompt.category]) {
                updateData[currentPrompt.category] = {};
            } else {
                updateData[currentPrompt.category] = { ...user[currentPrompt.category] };
            }
            
            // Handle mapped values (e.g., converting response to a categorical value)
            if (currentPrompt.mapping && currentPrompt.mapping[response]) {
                updateData[currentPrompt.category][currentPrompt.field] = currentPrompt.mapping[response];
            } 
            // Handle array fields (e.g., adding to a list of values)
            else if (Array.isArray(user[currentPrompt.category]?.[currentPrompt.field])) {
                updateData[currentPrompt.category][currentPrompt.field] = [
                    ...(user[currentPrompt.category][currentPrompt.field] || []),
                    response
                ];
            } 
            // Handle simple field update
            else {
                updateData[currentPrompt.category][currentPrompt.field] = response;
            }
            
            await updateUserProfile(updateData);
            
            // Update the user context
            if (setUser) {
                setUser(prev => ({
                    ...prev,
                    [currentPrompt.category]: {
                        ...(prev[currentPrompt.category] || {}),
                        [currentPrompt.field]: updateData[currentPrompt.category][currentPrompt.field]
                    }
                }));
            }
            
            // Record that this prompt has been answered
            const answeredPrompts = JSON.parse(localStorage.getItem('answeredPrompts') || '[]');
            answeredPrompts.push(currentPrompt.id);
            localStorage.setItem('answeredPrompts', JSON.stringify(answeredPrompts));
            localStorage.setItem('lastPromptTime', Date.now().toString());
            
            setSubmitted(true);
            
            // Hide prompt after 2 seconds
            // For new users, move to next prompt after delay
            setTimeout(() => {
                if (forNewUser) {
                    setPromptIndex(prevIndex => prevIndex + 1);
                } else {
                    setCurrentPrompt(null);
                }
                setResponse('');
            }, 2000);
            
        } catch (err) {
            console.error('Error updating profile with prompt response:', err);
        }
    };
    
    if (!currentPrompt || !user) return null;
    
    return (
        <div className="profile-prompt-container">
            <div className="profile-prompt-card">
                {!submitted ? (
                    <>
                        <h3>Quick Question</h3>
                        <p>{currentPrompt.question}</p>
                        
                        <div className="prompt-options">
                            {currentPrompt.options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`prompt-option ${response === option ? 'selected' : ''}`}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        
                        <div className="prompt-actions">
                            <button 
                                className="prompt-submit"
                                onClick={handleSubmit}
                                disabled={!response}
                            >
                                Save
                            </button>
                            <button 
                                className="prompt-skip"
                                onClick={() => setCurrentPrompt(null)}
                            >
                                Skip
                            </button>
                        </div>
                        <p className="prompt-note">Helps us find better matches for you</p>
                    </>
                ) : (
                    <div className="prompt-success">
                        <h3>Thanks for sharing!</h3>
                        <p>This helps us find better matches for you.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePrompts;