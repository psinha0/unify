import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import './MatchAnalytics.css';
const MatchAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('overview'); // overview, profile, suggestions
    const history = useHistory();
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Fetch both analytics and user profile
            const [analyticsRes, profileRes] = await Promise.all([
                axios.get('http://localhost:5000/api/matching/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            
            setAnalytics(analyticsRes.data);
            setUserProfile(profileRes.data);
            setError(null);
        } catch (err) {
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };
    const handleQuickAction = async (action) => {
        switch (action) {
            case 'add_bio':
                history.push('/profile?section=bio');
                break;
            case 'add_location':
                history.push('/profile?section=location');
                break;
            case 'add_interests':
                history.push('/profile?section=interests');
                break;
            case 'take_questionnaire':
                history.push('/profile?questionnaire=true');
                break;
            case 'update_profile':
                history.push('/profile');
                break;
            default:
                break;
        }
    };
    const getActionForRecommendation = (recommendation) => {
        if (recommendation.includes('bio')) return 'add_bio';
        if (recommendation.includes('location')) return 'add_location';
        if (recommendation.includes('interests')) return 'add_interests';
        if (recommendation.includes('communication')) return 'update_communication';
        if (recommendation.includes('questionnaire') || recommendation.includes('questions')) return 'take_questionnaire';
        return null;
    };
    const getActionLabel = (action) => {
        const labels = {
            'add_bio': 'Add Bio',
            'add_location': 'Add Location',
            'add_interests': 'Update Interests',
            'take_questionnaire': 'Take Questionnaire',
            'update_communication': 'Update Preferences'
        };
        return labels[action] || 'Take Action';
    };
    if (loading) {
        return (
            <div className="analytics-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your profile analytics...</p>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="analytics-container">
                <div className="error-message">
                    <h3>Unable to Load Analytics</h3>
                    <p>{error}</p>
                    <button onClick={fetchData} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    if (!analytics || !userProfile) {
        return (
            <div className="analytics-container">
                <p>No data available</p>
            </div>
        );
    }
    const getScoreColor = (score) => {
        if (score >= 80) return '#4CAF50';
        if (score >= 60) return '#FFC107';
        if (score >= 40) return '#FF9800';
        return '#F44336';
    };
    const getProgressBarWidth = (score) => {
        return Math.max(5, Math.min(100, score));
    };
    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h2>📊 Your Match Analytics</h2>
                <p className="analytics-subtitle">
                    Understanding your profile and improving your matches
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="analytics-tabs">
                <button 
                    className={`tab-button ${activeSection === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveSection('overview')}
                >
                    📈 Overview
                </button>
                <button 
                    className={`tab-button ${activeSection === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveSection('profile')}
                >
                    👤 What We Know
                </button>
                <button 
                    className={`tab-button ${activeSection === 'suggestions' ? 'active' : ''}`}
                    onClick={() => setActiveSection('suggestions')}
                >
                    💡 Suggestions
                </button>
            </div>

            {/* Overview Section */}
            {activeSection === 'overview' && (
                <>
                    <div className="analytics-grid">
                        {/* Profile Completeness */}
                        <div className="analytics-card">
                            <div className="card-header">
                                <h3>Profile Strength</h3>
                                <div className="score-badge" style={{ backgroundColor: getScoreColor(analytics.profileCompleteness) }}>
                                    {analytics.profileCompleteness}%
                                </div>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ 
                                        width: `${getProgressBarWidth(analytics.profileCompleteness)}%`,
                                        backgroundColor: getScoreColor(analytics.profileCompleteness)
                                    }}
                                ></div>
                            </div>
                            <p className="card-description">
                                A complete profile helps others understand you better and improves match quality.
                            </p>
                        </div>

                        {/* Questionnaire Completion */}
                        <div className="analytics-card">
                            <div className="card-header">
                                <h3>Questionnaire Progress</h3>
                                <div className="score-badge" style={{ backgroundColor: getScoreColor(analytics.questionnaireCompletion) }}>
                                    {analytics.questionnaireCompletion}%
                                </div>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ 
                                        width: `${getProgressBarWidth(analytics.questionnaireCompletion)}%`,
                                        backgroundColor: getScoreColor(analytics.questionnaireCompletion)
                                    }}
                                ></div>
                            </div>
                            <p className="card-description">
                                {analytics.answeredQuestions} of {analytics.totalQuestions} questions completed. 
                                More answers = better matches!
                            </p>
                        </div>

                        {/* Match Quality */}
                        <div className="analytics-card">
                            <div className="card-header">
                                <h3>Average Match Score</h3>
                                <div className="score-badge" style={{ backgroundColor: getScoreColor(analytics.averageMatchScore) }}>
                                    {analytics.averageMatchScore}%
                                </div>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ 
                                        width: `${getProgressBarWidth(analytics.averageMatchScore)}%`,
                                        backgroundColor: getScoreColor(analytics.averageMatchScore)
                                    }}
                                ></div>
                            </div>
                            <p className="card-description">
                                Your current compatibility score with potential friends.
                            </p>
                        </div>

                        {/* High Quality Matches */}
                        <div className="analytics-card">
                            <div className="card-header">
                                <h3>High-Quality Matches</h3>
                                <div className="score-badge" style={{ backgroundColor: '#2196F3' }}>
                                    {analytics.highQualityMatches}
                                </div>
                            </div>
                            <div className="match-ratio">
                                <span className="ratio-text">
                                    {analytics.highQualityMatches} out of {analytics.totalPotentialMatches} potential friends
                                </span>
                                <div className="ratio-bar">
                                    <div 
                                        className="ratio-fill"
                                        style={{ 
                                            width: `${analytics.totalPotentialMatches > 0 ? (analytics.highQualityMatches / analytics.totalPotentialMatches) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <p className="card-description">
                                Friends with 60%+ compatibility scores (excellent matches).
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* What We Know Section */}
            {activeSection === 'profile' && (
                <div className="profile-knowledge-section">
                    <h3>🧠 What We Know About You</h3>
                    <p className="section-subtitle">This is the information we use to find your best matches</p>

                    {/* Basic Info */}
                    <div className="knowledge-category">
                        <h4>📋 Basic Information</h4>
                        <div className="knowledge-items">
                            <div className="knowledge-item">
                                <span className="label">Username:</span>
                                <span className="value">{userProfile.username || 'Not set'}</span>
                            </div>
                            <div className="knowledge-item">
                                <span className="label">Location:</span>
                                <span className="value">{userProfile.location || 'Not set'}</span>
                            </div>
                            <div className="knowledge-item">
                                <span className="label">Bio:</span>
                                <span className="value bio-text">{userProfile.bio || 'Not set'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Interests */}
                    {userProfile.interests && userProfile.interests.length > 0 && (
                        <div className="knowledge-category">
                            <h4>🎯 Your Interests ({userProfile.interests.length})</h4>
                            <div className="interest-tags">
                                {userProfile.interests.map((interest, idx) => (
                                    <span key={idx} className="interest-tag">{interest}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Social Preferences */}
                    {userProfile.socialPreferences && (
                        <div className="knowledge-category">
                            <h4>💬 Social Preferences</h4>
                            <div className="knowledge-items">
                                {userProfile.socialPreferences.communicationStyle && (
                                    <div className="knowledge-item">
                                        <span className="label">Communication Style:</span>
                                        <span className="value">{userProfile.socialPreferences.communicationStyle}</span>
                                    </div>
                                )}
                                {userProfile.socialPreferences.socialEnergy && (
                                    <div className="knowledge-item">
                                        <span className="label">Social Energy:</span>
                                        <span className="value">{userProfile.socialPreferences.socialEnergy}</span>
                                    </div>
                                )}
                                {userProfile.socialPreferences.friendshipType && userProfile.socialPreferences.friendshipType.length > 0 && (
                                    <div className="knowledge-item">
                                        <span className="label">Friendship Types:</span>
                                        <span className="value">{userProfile.socialPreferences.friendshipType.join(', ')}</span>
                                    </div>
                                )}
                                {userProfile.socialPreferences.responseTime && (
                                    <div className="knowledge-item">
                                        <span className="label">Response Time:</span>
                                        <span className="value">{userProfile.socialPreferences.responseTime}</span>
                                    </div>
                                )}
                                {userProfile.socialPreferences.communicationFrequency && (
                                    <div className="knowledge-item">
                                        <span className="label">Communication Frequency:</span>
                                        <span className="value">{userProfile.socialPreferences.communicationFrequency}</span>
                                    </div>
                                )}
                                {userProfile.socialPreferences.groupSizePreference && (
                                    <div className="knowledge-item">
                                        <span className="label">Group Size Preference:</span>
                                        <span className="value">{userProfile.socialPreferences.groupSizePreference}</span>
                                    </div>
                                )}
                                {userProfile.socialPreferences.conversationTopics && (
                                    <div className="knowledge-item">
                                        <span className="label">Conversation Topics:</span>
                                        <span className="value">{userProfile.socialPreferences.conversationTopics}</span>
                                    </div>
                                )}
                                {userProfile.socialPreferences.friendshipGoals && (
                                    <div className="knowledge-item">
                                        <span className="label">Friendship Goals:</span>
                                        <span className="value">{userProfile.socialPreferences.friendshipGoals}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Lifestyle */}
                    {userProfile.lifestyle && (
                        <div className="knowledge-category">
                            <h4>🏃 Lifestyle</h4>
                            <div className="knowledge-items">
                                {userProfile.lifestyle.schedule && (
                                    <div className="knowledge-item">
                                        <span className="label">Schedule:</span>
                                        <span className="value">{userProfile.lifestyle.schedule}</span>
                                    </div>
                                )}
                                {userProfile.lifestyle.activityLevel && (
                                    <div className="knowledge-item">
                                        <span className="label">Activity Level:</span>
                                        <span className="value">{userProfile.lifestyle.activityLevel}</span>
                                    </div>
                                )}
                                {userProfile.lifestyle.weekendPlans && userProfile.lifestyle.weekendPlans.length > 0 && (
                                    <div className="knowledge-item">
                                        <span className="label">Weekend Plans:</span>
                                        <span className="value">{userProfile.lifestyle.weekendPlans.join(', ')}</span>
                                    </div>
                                )}
                                {userProfile.lifestyle.availability && (
                                    <div className="knowledge-item">
                                        <span className="label">Availability:</span>
                                        <span className="value">{userProfile.lifestyle.availability}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Values */}
                    {userProfile.values && userProfile.values.length > 0 && (
                        <div className="knowledge-category">
                            <h4>❤️ Your Values</h4>
                            <div className="value-tags">
                                {userProfile.values.map((value, idx) => (
                                    <span key={idx} className="value-tag">{value}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="knowledge-footer">
                        <p>💡 All this information helps us find friends who truly match your personality and preferences!</p>
                        <button 
                            className="update-profile-btn"
                            onClick={() => history.push('/profile')}
                        >
                            ✏️ Update Your Profile
                        </button>
                    </div>
                </div>
            )}

            {/* Suggestions Section */}
            {activeSection === 'suggestions' && (
                <>
                    {/* Improvement Potential */}
                    {analytics.potentialImprovement > 0 && (
                        <div className="improvement-section">
                            <div className="improvement-card">
                                <h3>🚀 Improvement Potential</h3>
                                <div className="improvement-score">
                                    +{analytics.potentialImprovement}% better matches possible
                                </div>
                                <p>Complete more questionnaire questions to unlock better friend matches!</p>
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {analytics.recommendations && analytics.recommendations.length > 0 && (
                        <div className="recommendations-section">
                            <h3>💡 Smart Recommendations</h3>
                            <p className="recommendations-subtitle">Take action on these suggestions to improve your matches</p>
                            <div className="recommendations-list">
                                {analytics.recommendations.map((recommendation, index) => {
                                    const action = getActionForRecommendation(recommendation);
                                    return (
                                        <div key={index} className="recommendation-item">
                                            <div className="recommendation-content">
                                                <div className="recommendation-icon">💡</div>
                                                <span className="recommendation-text">{recommendation}</span>
                                            </div>
                                            {action && (
                                                <button 
                                                    className="recommendation-action-btn"
                                                    onClick={() => handleQuickAction(action)}
                                                >
                                                    {getActionLabel(action)}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="bulk-actions">
                                <button 
                                    className="bulk-action-btn primary"
                                    onClick={() => handleQuickAction('take_questionnaire')}
                                >
                                    🚀 Complete Full Questionnaire
                                </button>
                                <button 
                                    className="bulk-action-btn secondary"
                                    onClick={() => history.push('/profile')}
                                >
                                    ✏️ Edit Profile
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Questionnaire Impact */}
                    <div className="impact-section">
                        <h3>📊 How Questionnaires Help</h3>
                        <div className="impact-grid">
                            <div className="impact-item">
                                <div className="impact-icon">🎯</div>
                                <h4>Better Targeting</h4>
                                <p>Match with people who share your communication style and interests</p>
                            </div>
                            <div className="impact-item">
                                <div className="impact-icon">⚡</div>
                                <h4>Quality over Quantity</h4>
                                <p>Find fewer but more meaningful connections</p>
                            </div>
                            <div className="impact-item">
                                <div className="impact-icon">💬</div>
                                <h4>Better Conversations</h4>
                                <p>Start conversations with shared topics and values</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="analytics-footer">
                <button onClick={fetchData} className="refresh-button">
                    🔄 Refresh Analytics
                </button>
                <p className="analytics-note">
                    Analytics update in real-time as you complete your profile and questionnaire.
                </p>
            </div>
        </div>
    );
};
export default MatchAnalytics;