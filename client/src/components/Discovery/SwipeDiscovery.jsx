import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import './SwipeDiscovery.css';
const SwipeDiscovery = () => {
    const { user } = useAuth();
    const [potentialFriends, setPotentialFriends] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [swipeHistory, setSwipeHistory] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [expandedBio, setExpandedBio] = useState(false);
    const [showConnectionDetails, setShowConnectionDetails] = useState(false);
    const cardRef = React.useRef(null);
    useEffect(() => {
        fetchPotentialFriends();
    }, []);
    const fetchPotentialFriends = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/matching/potential-friends', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setPotentialFriends(response.data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };
    const handleSwipe = useCallback(async (direction, friend) => {
        if (isAnimating) return;
        setIsAnimating(true);
        // Record the swipe for preference learning
        const swipeData = {
            targetUserId: friend._id,
            action: direction, // 'like' or 'pass'
            matchScore: friend.matchScore,
            matchFactors: friend.matchFactors,
            timestamp: new Date().toISOString()
        };
        setSwipeHistory(prev => [...prev, swipeData]);
        try {
            // Send swipe data to backend for preference learning
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/matching/record-swipe', swipeData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // If it's a like, send friend request
            if (direction === 'like') {
                await axios.post('http://localhost:5000/api/matching/friend-request', {
                    friendId: friend._id
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
        }
        // Move to next card
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setIsAnimating(false);
            // Reset UI states for next card
            setExpandedBio(false);
            setShowConnectionDetails(false);
            // Reset scroll position
            if (cardRef.current) {
                cardRef.current.scrollTop = 0;
            }
        }, 300);
    }, [isAnimating]);
    const currentFriend = potentialFriends[currentIndex];
    if (loading) {
        return (
            <div className="swipe-discovery">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Finding amazing people for you...</p>
                </div>
            </div>
        );
    }
    if (!currentFriend) {
        return (
            <div className="swipe-discovery">
                <div className="no-more-cards">
                    <h3>🎉 You've seen everyone!</h3>
                    <p>Check back later for new potential friends, or expand your preferences.</p>
                    <button onClick={fetchPotentialFriends} className="refresh-btn">
                        Refresh
                    </button>
                </div>
            </div>
        );
    }
    // Generate quick match summary for image overlay (Tinder-style)
    const getQuickMatchSummary = (friend, factors) => {
        if (!factors || !friend) return 'Great potential match!';
        const summaries = [];
        // Check for shared interests
        if (factors.sharedInterests?.length >= 3) {
            summaries.push(`${factors.sharedInterests.length} shared interests`);
        } else if (factors.sharedInterests?.length > 0) {
            summaries.push(`Loves ${factors.sharedInterests[0]}`);
        }
        // Check communication style
        if (factors.communicationMatch && friend.socialPreferences?.communicationStyle) {
            summaries.push('Similar communication style');
        }
        // Check social energy compatibility
        if (friend.socialPreferences?.socialEnergy && user.socialPreferences?.socialEnergy) {
            if (friend.socialPreferences.socialEnergy === user.socialPreferences.socialEnergy) {
                summaries.push(`Both ${friend.socialPreferences.socialEnergy.toLowerCase()}s`);
            }
        }
        // Check location proximity
        if (factors.proximityScore > 0.7 && friend.location) {
            summaries.push(`Lives in ${friend.location}`);
        }
        // Return a concise summary (max 2 items joined by bullet)
        if (summaries.length === 0) {
            return 'Exciting potential connection!';
        }
        return summaries.slice(0, 2).join(' • ');
    };
    const getDetailedConnectionReasons = (friend, factors) => {
        if (!factors || typeof factors !== 'object') {
            return [];
        }
        const reasons = [];
        // Shared interests with specifics
        if (factors.sharedInterests?.length > 0) {
            const interestList = factors.sharedInterests.slice(0, 4).join(', ');
            const remaining = factors.sharedInterests.length > 4 ? ` and ${factors.sharedInterests.length - 4} more` : '';
            reasons.push({
                icon: '🎯',
                title: 'Shared Interests',
                detail: `You both enjoy: ${interestList}${remaining}`,
                strength: 'high'
            });
        }
        // Communication style match
        if (factors.communicationMatch) {
            const style = friend.socialPreferences?.communicationStyle || 'similar ways';
            reasons.push({
                icon: '💬',
                title: 'Communication Compatibility',
                detail: `You both prefer ${style.toLowerCase()} - making conversations flow naturally`,
                strength: 'high'
            });
        }
        // Activity level compatibility
        if (factors.activityLevelMatch) {
            const level = friend.lifestyle?.activityLevel || 'similar activity levels';
            reasons.push({
                icon: '⚡',
                title: 'Activity Level Match',
                detail: `Both ${level.toLowerCase()} - perfect for planning activities together`,
                strength: 'medium'
            });
        }
        // Social energy compatibility
        if (friend.socialPreferences?.socialEnergy && user.socialPreferences?.socialEnergy) {
            if (friend.socialPreferences.socialEnergy === user.socialPreferences.socialEnergy) {
                const energy = friend.socialPreferences.socialEnergy;
                reasons.push({
                    icon: '🌟',
                    title: 'Social Energy Match',
                    detail: `You're both ${energy.toLowerCase()}s - you'll understand each other's social needs`,
                    strength: 'high'
                });
            }
        }
        // Weekend plans alignment
        if (factors.sharedWeekendPlans?.length > 0) {
            const plans = factors.sharedWeekendPlans.join(', ');
            reasons.push({
                icon: '🎉',
                title: 'Weekend Vibes Align',
                detail: `You both love: ${plans}`,
                strength: 'medium'
            });
        }
        // Shared values
        if (factors.sharedValues?.length > 0) {
            const values = factors.sharedValues.slice(0, 3).join(', ');
            reasons.push({
                icon: '💎',
                title: 'Core Values Match',
                detail: `You both value: ${values}`,
                strength: 'high'
            });
        }
        // Personality compatibility
        if (factors.personalityMatch && factors.personalityMatch > 0.6) {
            const percentage = Math.round(factors.personalityMatch * 100);
            reasons.push({
                icon: '🧠',
                title: 'Personality Compatibility',
                detail: `${percentage}% personality alignment based on your traits and preferences`,
                strength: 'medium'
            });
        }
        // Location proximity
        if (factors.proximityScore > 0.7 && friend.location) {
            reasons.push({
                icon: '📍',
                title: 'Location Convenient',
                detail: `You're both in ${friend.location} - easy to meet up!`,
                strength: 'medium'
            });
        }
        // Friendship type compatibility
        if (friend.socialPreferences?.friendshipType?.length > 0 && user.socialPreferences?.friendshipType?.length > 0) {
            const commonTypes = friend.socialPreferences.friendshipType.filter(type => 
                user.socialPreferences.friendshipType.includes(type)
            );
            if (commonTypes.length > 0) {
                reasons.push({
                    icon: '🤝',
                    title: 'Friendship Style Match',
                    detail: `You both seek: ${commonTypes.join(', ')}`,
                    strength: 'high'
                });
            }
        }
        // Schedule compatibility
        if (friend.lifestyle?.schedule === user.lifestyle?.schedule) {
            const schedule = friend.lifestyle.schedule;
            reasons.push({
                icon: '⏰',
                title: 'Schedule Compatibility',
                detail: `You're both ${schedule.toLowerCase()}s - easier to sync hangout times`,
                strength: 'low'
            });
        }
        return reasons;
    };
    return (
        <div className="swipe-discovery">
            <div className="swipe-header">
                <h2>Discover Friends</h2>
                <div className="match-count">
                    {potentialFriends.length - currentIndex} people to discover
                </div>
            </div>
            <div className="card-container">
                <div 
                    className={`friend-card ${isAnimating ? 'animating' : ''}`} 
                    ref={cardRef}
                >
                    <div 
                        className="card-image"
                        style={{
                            backgroundImage: `url(${currentFriend.profilePicture || '/default-avatar.png'})`
                        }}
                    >
                        <div className="match-score">
                            {currentFriend.matchScore}% match
                        </div>
                        {/* Tinder-style user info overlay */}
                        <div className="card-image-info">
                            <h3>{currentFriend.username}</h3>
                            <p className="match-reason">
                                {getQuickMatchSummary(currentFriend, currentFriend.matchFactors)}
                            </p>
                        </div>
                        <button 
                            className="see-bio-btn" 
                            onClick={(e) => {
                                // Find the friend-card div (the scrollable container)
                                const friendCard = e.target.closest('.friend-card');
                                const cardImage = friendCard?.querySelector('.card-image');
                                if (friendCard && cardImage) {
                                    // Get the actual height of the image container
                                    const imageHeight = cardImage.offsetHeight;
                                    // Scroll the entire card down by the image height minus some offset
                                    // This creates a smooth parallax effect
                                    friendCard.scrollTo({ 
                                        top: imageHeight - 80, 
                                        behavior: 'smooth' 
                                    });
                                }
                            }}
                        >
                            See Full Profile ↓
                        </button>
                    </div>
                    <div className={`card-content ${expandedBio ? 'expanded' : ''}`}>
                        <div className="card-header">
                            <div>
                                <h3>{currentFriend.username}</h3>
                                <span className="location">
                                    📍 {currentFriend.location || 'Location not set'}
                                </span>
                            </div>
                        </div>
                        <div className={`bio ${expandedBio ? 'expanded' : ''}`}>
                            <strong>About:</strong>
                            <p>{currentFriend.bio || 'No bio available'}</p>
                        </div>
                        <div className="interests">
                            <strong>Interests:</strong>
                            <div className="interest-tags">
                                {currentFriend.interests?.map((interest, index) => (
                                    <span key={index} className="interest-tag">
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="match-factors">
                            <div className="match-factors-header" onClick={() => setShowConnectionDetails(!showConnectionDetails)}>
                                <h4>🌟 Why you might connect</h4>
                                <span className="expand-icon">{showConnectionDetails ? '▼' : '▶'}</span>
                            </div>
                            {!showConnectionDetails ? (
                                <div className="match-factors-summary">
                                    {getDetailedConnectionReasons(currentFriend, currentFriend.matchFactors)
                                        .slice(0, 2)
                                        .map((reason, index) => (
                                            <div key={index} className="reason-summary">
                                                <span className="reason-icon">{reason.icon}</span>
                                                <span className="reason-title">{reason.title}</span>
                                            </div>
                                        ))}
                                    <button className="show-more-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        setShowConnectionDetails(true);
                                    }}>
                                        Show all reasons
                                    </button>
                                </div>
                            ) : (
                                <div className="match-factors-detailed">
                                    {getDetailedConnectionReasons(currentFriend, currentFriend.matchFactors).map((reason, index) => (
                                        <div key={index} className={`reason-card strength-${reason.strength}`}>
                                            <div className="reason-header">
                                                <span className="reason-icon">{reason.icon}</span>
                                                <span className="reason-title">{reason.title}</span>
                                            </div>
                                            <p className="reason-detail">{reason.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="swipe-actions">
                <button 
                    className="swipe-btn pass"
                    onClick={() => handleSwipe('pass', currentFriend)}
                    disabled={isAnimating}
                >
                    <span className="btn-icon">✕</span>
                    Pass
                </button>
                <button 
                    className="swipe-btn like"
                    onClick={() => handleSwipe('like', currentFriend)}
                    disabled={isAnimating}
                >
                    <span className="btn-icon">💙</span>
                    Connect
                </button>
            </div>
            <div className="swipe-instructions">
                <p>💡 Swipe or click to make choices. We'll learn your preferences to find better matches!</p>
            </div>
        </div>
    );
};
export default SwipeDiscovery;