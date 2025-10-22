import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile, getUserProfile } from '../../services/api';
import ProfilePromptsEnhanced from './ProfilePromptsEnhanced';

import '../../styles/profile.css';
const Profile = () => {
    const { user, setUser, isNewUser, setIsNewUser } = useAuth();
    const history = useHistory();
    const routerLocation = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const questionnaireInitialized = useRef(false);
    // Profile data
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [userLocation, setUserLocation] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    // Interests
    const [interests, setInterests] = useState([]);
    const [newInterest, setNewInterest] = useState('');
    // Popular interests suggestions
    const popularInterests = [
        'Travel', 'Music', 'Movies', 'Reading', 'Cooking', 
        'Fitness', 'Gaming', 'Photography', 'Art', 'Sports',
        'Technology', 'Fashion', 'Hiking', 'Dance', 'Writing',
        'Yoga', 'Meditation', 'Cycling', 'Swimming', 'Running'
    ];
    // SINGLE EFFECT to control questionnaire display with clear logic
    useEffect(() => {
        // Skip if we've already initialized
        if (questionnaireInitialized.current) {
            return;
        }
        // Skip if user data not loaded yet
        if (!user || loading) {
            return;
        }
        // Check query parameters
        const params = new URLSearchParams(routerLocation.search);
        const isNewUserParam = params.get('newUser') === 'true';
        const questionnaireParam = params.get('questionnaire') === 'true';
        const sectionParam = params.get('section');
        // Auto-focus specific sections based on analytics recommendations
        if (sectionParam) {
            setTimeout(() => {
                const element = document.querySelector(`[data-section="${sectionParam}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus();
                }
            }, 500);
        }
        // PRIMARY CHECK: Has user completed questionnaire?
        if (user.lastQuestionnaireDate) {
            setShowQuestionnaire(false);
            if (isNewUser && setIsNewUser) {
                setIsNewUser(false);
            }
            questionnaireInitialized.current = true;
            return;
        }
        // SECONDARY CHECK: Should we show questionnaire?
        const shouldShow = (isNewUser || isNewUserParam || questionnaireParam);
        if (shouldShow) {
            setShowQuestionnaire(true);
        } else {
            setShowQuestionnaire(false);
        }
        // Mark as initialized
        questionnaireInitialized.current = true;
    }, [user, loading, isNewUser, routerLocation, setIsNewUser]);
    // Handle completed questionnaire
    const handleQuestionnaireComplete = () => {
        setShowQuestionnaire(false);
        questionnaireInitialized.current = true; // Ensure it's marked as initialized
        if (setIsNewUser) {
            setIsNewUser(false);
        }
    };
    useEffect(() => {
        let isMounted = true;
        const loadUserProfile = async () => {
            if (!user) {
                // The PrivateRoute component will handle redirects now
                return;
            }
            try {
                setLoading(true);
                const profileData = await getUserProfile();
                if (isMounted) {
                    // Fill form with user data
                    setUsername(profileData.username || '');
                    setEmail(profileData.email || '');
                    setBio(profileData.bio || '');
                    setUserLocation(profileData.location || '');
                    setProfilePicture(profileData.profilePicture || '');
                    setInterests(profileData.interests || []);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load your profile. Please try again.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        loadUserProfile();
        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [user]);
    const handleAddInterest = (interest = newInterest) => {
        if (!interest.trim()) return;
        // Check if interest already exists (case insensitive)
        if (interests.some(i => i.toLowerCase() === interest.toLowerCase())) {
            return;
        }
        setInterests([...interests, interest.trim()]);
        setNewInterest('');
    };
    const handleRemoveInterest = (indexToRemove) => {
        setInterests(interests.filter((_, index) => index !== indexToRemove));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            setLoading(true);
            const profileData = {
                bio,
                location: userLocation,
                profilePicture,
                interests
            };
            await updateUserProfile(profileData);
            // Update local user state with new profile data
            if (setUser) {
                setUser(prev => ({
                    ...prev,
                    bio,
                    location: userLocation,
                    profilePicture,
                    interests
                }));
            }
            setSuccess('Profile updated successfully!');
            // Success message disappears after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update your profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    if (loading && !user) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }
    return (
        <div className="profile-page">
            <div className="profile-container">
                <h2>Edit Your Profile</h2>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="profile-section">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                disabled
                                className="disabled-input"
                            />
                            <small>Username cannot be changed</small>
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="disabled-input"
                            />
                            <small>Email cannot be changed</small>
                        </div>
                        <div className="form-group" data-section="bio">
                            <label>Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us about yourself..."
                                rows="4"
                            />
                        </div>
                        <div className="form-group" data-section="location">
                            <label>Location</label>
                            <input
                                type="text"
                                value={userLocation}
                                onChange={(e) => setUserLocation(e.target.value)}
                                placeholder="Where are you from?"
                            />
                        </div>
                        <div className="form-group">
                            <label>Profile Picture URL</label>
                            <input
                                type="url"
                                value={profilePicture}
                                onChange={(e) => setProfilePicture(e.target.value)}
                                placeholder="https://example.com/your-photo.jpg"
                            />
                            {profilePicture && (
                                <div className="profile-preview">
                                    <img src={profilePicture} alt="Profile" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="profile-section" data-section="interests">
                        <h3>Interests</h3>
                        <p className="section-description">
                            Add interests to help us find better matches for you
                        </p>
                        <div className="interests-container">
                            <div className="interest-input-container">
                                <input
                                    type="text"
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                    placeholder="Add a new interest..."
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddInterest();
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="add-interest-btn"
                                    onClick={() => handleAddInterest()}
                                >
                                    Add
                                </button>
                            </div>
                            <div className="interests-list">
                                {interests.map((interest, index) => (
                                    <div key={index} className="interest-tag">
                                        {interest}
                                        <button
                                            type="button"
                                            className="remove-interest"
                                            onClick={() => handleRemoveInterest(index)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="suggested-interests">
                            <p className="small-text">Suggested interests:</p>
                            {popularInterests
                                .filter(interest => !interests.some(
                                    i => i.toLowerCase() === interest.toLowerCase()
                                ))
                                .slice(0, 10)
                                .map((interest, index) => (
                                    <span
                                        key={index}
                                        className="suggested-interest"
                                        onClick={() => handleAddInterest(interest)}
                                    >
                                        {interest}
                                    </span>
                                ))}
                        </div>
                        <div className="popular-interests">
                            <h4>Popular Interests</h4>
                            <div className="interests-container">
                                {popularInterests.map((interest, index) => (
                                    <div
                                        key={index}
                                        className={`interest-tag suggestion ${
                                            interests.some(i => i.toLowerCase() === interest.toLowerCase())
                                                ? 'selected'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            if (interests.some(i => i.toLowerCase() === interest.toLowerCase())) {
                                                handleRemoveInterest(
                                                    interests.findIndex(
                                                        i => i.toLowerCase() === interest.toLowerCase()
                                                    )
                                                );
                                            } else {
                                                handleAddInterest(interest);
                                            }
                                        }}
                                    >
                                        {interest}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="profile-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                        <button
                            type="button"
                            className="analytics-button"
                            onClick={() => history.push('/profile/analytics')}
                        >
                            📊 View Match Analytics
                        </button>
                        <button
                            type="button"
                            className="questionnaire-button"
                            onClick={() => setShowQuestionnaire(true)}
                        >
                            📝 Retake Questionnaire
                        </button>
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => history.push('/dashboard')}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            {/* New User Questionnaire Overlay */}
            {showQuestionnaire && (
                <div className="onboarding-prompt-overlay">
                    <div className="onboarding-prompt-container">
                        <h2>Welcome to Friend Finder!</h2>
                        <p>Let's get to know you better so we can find you the perfect friends.</p>
                        <ProfilePromptsEnhanced forNewUser={true} onComplete={() => setShowQuestionnaire(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};
export default Profile;
