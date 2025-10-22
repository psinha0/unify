import React, { useState } from 'react';
import { 
    FaHandshake, FaCalendarAlt, FaHeart, FaLocationArrow, 
    FaBrain, FaClock, FaComments, FaLightbulb
} from 'react-icons/fa';

const FriendCard = ({ friend, actionLabel, onAction, userInsights }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showInsights, setShowInsights] = useState(false);
    
    const toggleDetails = () => {
        setShowDetails(!showDetails);
        setShowInsights(false);
    };
    
    const toggleInsights = () => {
        setShowInsights(!showInsights);
        setShowDetails(false);
    };
    
    // Helper function to safely render possibly object values
    const safeRender = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
    };
    
    return (
        <div className="friend-card">
            <img 
                src={friend.profilePicture || 'https://via.placeholder.com/150'} 
                alt={`${friend.username || 'User'}'s profile`} 
                className="friend-avatar"
            />
            
            {/* Display match score if available */}
            {friend.matchScore !== undefined && (
                <div className="match-score">
                    <span>{friend.matchScore}% Match</span>
                </div>
            )}
            
            <h3>{friend.username || 'User'}</h3>
            <p>{friend.bio || 'No bio available'}</p>
            
            {/* Basic interests display */}
            <div className="interests">
                {friend.interests && friend.interests.slice(0, 5).map((interest, index) => (
                    <span key={index} className="interest-tag">{safeRender(interest)}</span>
                ))}
                {friend.interests && friend.interests.length > 5 && (
                    <span className="interest-tag">+{friend.interests.length - 5} more</span>
                )}
                {(!friend.interests || friend.interests.length === 0) && (
                    <span className="interest-tag muted">No interests shared</span>
                )}
            </div>
            
            {/* Location with icon */}
            {friend.location && (
                <div className="location">
                    <FaLocationArrow className="info-icon" />
                    <span>{safeRender(friend.location)}</span>
                </div>
            )}
            
            {/* Buttons to toggle details and insights */}
            <div className="friend-card-buttons">
                {friend.matchFactors && (
                    <button 
                        className={`match-details-button ${showDetails ? 'active' : ''}`}
                        onClick={toggleDetails}
                    >
                        <FaHandshake className="button-icon" />
                        {showDetails ? 'Hide Match Details' : 'Match Details'}
                    </button>
                )}
                
                {userInsights && (
                    <button 
                        className={`match-insights-button ${showInsights ? 'active' : ''}`}
                        onClick={toggleInsights}
                    >
                        <FaBrain className="button-icon" />
                        {showInsights ? 'Hide Insights' : 'Smart Insights'}
                    </button>
                )}
            </div>
            
            {/* Expanded match details */}
            {showDetails && friend.matchFactors && (
                <div className="match-details">
                    {friend.matchFactors.sharedInterests && (
                        <div className="match-factor">
                            <h4>Shared Interests</h4>
                            <div className="shared-items">
                                {friend.matchFactors.sharedInterests.map((item, i) => (
                                    <span key={i} className="shared-item">{safeRender(item)}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {friend.matchFactors.sharedFriendshipTypes && (
                        <div className="match-factor">
                            <h4><FaHandshake className="factor-icon" /> Friendship Style</h4>
                            <div className="shared-items">
                                {friend.matchFactors.sharedFriendshipTypes.map((item, i) => (
                                    <span key={i} className="shared-item">{safeRender(item)}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {friend.matchFactors.sharedWeekendPlans && (
                        <div className="match-factor">
                            <h4><FaCalendarAlt className="factor-icon" /> Weekend Activities</h4>
                            <div className="shared-items">
                                {friend.matchFactors.sharedWeekendPlans.map((item, i) => (
                                    <span key={i} className="shared-item">{safeRender(item)}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {friend.matchFactors.sharedValues && (
                        <div className="match-factor">
                            <h4><FaHeart className="factor-icon" /> Shared Values</h4>
                            <div className="shared-items">
                                {friend.matchFactors.sharedValues.map((item, i) => (
                                    <span key={i} className="shared-item">{safeRender(item)}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Insights section - showing learned/adaptive matching information */}
            {showInsights && userInsights && (
                <div className="match-insights">
                    <h4><FaBrain className="insights-icon" /> Smart Matching Insights</h4>
                    
                    {/* Communication compatibility */}
                    {userInsights.communicationCompatibility && (
                        <div className="insight-item">
                            <FaComments className="insight-icon" />
                            <div className="insight-content">
                                <h5>Communication Style</h5>
                                <p>{userInsights.communicationCompatibility}</p>
                                {userInsights.communicationNote && (
                                    <span className="insight-note">{userInsights.communicationNote}</span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Activity time compatibility */}
                    {userInsights.activityTimeMatch && (
                        <div className="insight-item">
                            <FaClock className="insight-icon" />
                            <div className="insight-content">
                                <h5>Active Hours Match</h5>
                                <p>{userInsights.activityTimeMatch}</p>
                                {userInsights.activityNote && (
                                    <span className="insight-note">{userInsights.activityNote}</span>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Topic recommendations */}
                    {userInsights.recommendedTopics && userInsights.recommendedTopics.length > 0 && (
                        <div className="insight-item">
                            <FaLightbulb className="insight-icon" />
                            <div className="insight-content">
                                <h5>Conversation Starters</h5>
                                <div className="topic-suggestions">
                                    {userInsights.recommendedTopics.map((topic, i) => (
                                        <span key={i} className="suggested-topic">{safeRender(topic)}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Learned compatibility */}
                    {userInsights.learnedCompatibility && (
                        <div className="insight-item learning-info">
                            <div className="learning-progress">
                                <div className="progress-bar" 
                                    style={{width: `${userInsights.confidenceScore || 60}%`}}>
                                </div>
                            </div>
                            <span className="learning-note">
                                Our system is {userInsights.confidenceScore || 60}% confident in these insights
                            </span>
                        </div>
                    )}
                </div>
            )}
            
            {/* Action button (Connect, etc.) */}
            {actionLabel && onAction && (
                <button 
                    className="friend-action-button"
                    onClick={() => onAction(friend._id)}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

const MatchFilterForm = ({ onApplyFilters }) => {
    const [filters, setFilters] = useState({
        minMatchScore: 50,
        interests: [],
        location: '',
        proximityPreference: 'Regional',
        communicationStyle: [],
        friendshipType: [],
        activityLevel: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, value, checked } = e.target;
        
        setFilters(prev => {
            if (checked) {
                return {
                    ...prev,
                    [name]: [...prev[name], value]
                };
            } else {
                return {
                    ...prev,
                    [name]: prev[name].filter(item => item !== value)
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onApplyFilters(filters);
    };

    return (
        <form className="match-filter-form" onSubmit={handleSubmit}>
            <h3>Refine Friend Matches</h3>
            
            <div className="filter-section">
                <label>Minimum Match Score</label>
                <input
                    type="range"
                    name="minMatchScore"
                    min="0"
                    max="100"
                    value={filters.minMatchScore}
                    onChange={handleChange}
                />
                <span>{filters.minMatchScore}%</span>
            </div>
            
            <div className="filter-section">
                <label>Communication Style</label>
                <div className="checkbox-group">
                    {['Text-heavy', 'Voice calls', 'Video calls', 'In-person meetups'].map(style => (
                        <label key={style} className="checkbox-label">
                            <input
                                type="checkbox"
                                name="communicationStyle"
                                value={style}
                                checked={filters.communicationStyle.includes(style)}
                                onChange={handleCheckboxChange}
                            />
                            {style}
                        </label>
                    ))}
                </div>
            </div>
            
            <div className="filter-section">
                <label>Friendship Type</label>
                <div className="checkbox-group">
                    {[
                        'Casual', 
                        'Deep conversations', 
                        'Activity partners', 
                        'Professional networking', 
                        'Online gaming buddies'
                    ].map(type => (
                        <label key={type} className="checkbox-label">
                            <input
                                type="checkbox"
                                name="friendshipType"
                                value={type}
                                checked={filters.friendshipType.includes(type)}
                                onChange={handleCheckboxChange}
                            />
                            {type}
                        </label>
                    ))}
                </div>
            </div>
            
            <div className="filter-section">
                <label>Activity Level</label>
                <div className="checkbox-group">
                    {['Very active', 'Moderately active', 'Low activity'].map(level => (
                        <label key={level} className="checkbox-label">
                            <input
                                type="checkbox"
                                name="activityLevel"
                                value={level}
                                checked={filters.activityLevel.includes(level)}
                                onChange={handleCheckboxChange}
                            />
                            {level}
                        </label>
                    ))}
                </div>
            </div>
            
            <div className="filter-section">
                <label>Location Radius</label>
                <select name="proximityPreference" value={filters.proximityPreference} onChange={handleChange}>
                    <option value="Local only">Local only (within 25 miles)</option>
                    <option value="Regional">Regional (within 100 miles)</option>
                    <option value="National">National</option>
                    <option value="Global">Global</option>
                </select>
            </div>
            
            <button type="submit" className="filter-apply-button">Apply Filters</button>
            <button type="button" className="filter-reset-button" onClick={() => setFilters({
                minMatchScore: 50,
                interests: [],
                location: '',
                proximityPreference: 'Regional',
                communicationStyle: [],
                friendshipType: [],
                activityLevel: []
            })}>Reset Filters</button>
        </form>
    );
};

const getMutualConnections = async (userId, potentialFriendId) => {
    const user = await User.findById(userId);
    const potentialFriend = await User.findById(potentialFriendId);
    
    if (!user || !potentialFriend) {
        throw new Error('User not found');
    }
    
    // Find mutual connections (friends that both users have in common)
    const userFriendIds = user.friends.map(id => id.toString());
    const potentialFriendFriendIds = potentialFriend.friends.map(id => id.toString());
    
    const mutualFriendIds = userFriendIds.filter(id => 
        potentialFriendFriendIds.includes(id)
    );
    
    if (mutualFriendIds.length === 0) {
        return [];
    }
    
    // Get details of mutual friends
    const mutualFriends = await User.find({
        _id: { $in: mutualFriendIds }
    }).select('username profilePicture');
    
    return mutualFriends;
};

export default FriendCard;