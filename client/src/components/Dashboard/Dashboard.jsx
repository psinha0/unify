import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useHistory } from 'react-router-dom';
import { 
    fetchFriends, 
    sendFriendRequest, 
    getFriendRequests,
    acceptFriendRequest
} from '../../services/api';
import FriendCard from '../Matching/FriendCard';
import SwipeDiscovery from '../Discovery/SwipeDiscovery';
import './Dashboard.css';
const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const history = useHistory();
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('friends');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Fetch friends data
    useEffect(() => {
        let isMounted = true;
        const loadFriends = async () => {
            if (authLoading || !user) return;
            try {
                if (isMounted) setLoading(true);
                const data = await fetchFriends();
                if (isMounted) setFriends(data);
            } catch (err) {
                if (isMounted) setError('Failed to load your friends. Please try again later.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadFriends();
        // Cleanup function to prevent state updates after unmounting
        return () => {
            isMounted = false;
        };
    }, [user, authLoading]);
    // Fetch friend requests
    useEffect(() => {
        let isMounted = true;
        const loadFriendRequests = async () => {
            if (authLoading || !user || activeTab !== 'requests') return;
            try {
                if (isMounted) setLoading(true);
                const data = await getFriendRequests();
                if (isMounted) setFriendRequests(data);
            } catch (err) {
                if (isMounted) setError('Failed to load friend requests. Please try again later.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadFriendRequests();
        // Cleanup function to prevent state updates after unmounting
        return () => {
            isMounted = false;
        };
    }, [activeTab, user, authLoading]);
    // Handler for accepting friend request
    const handleAcceptRequest = async (requestId) => {
        try {
            await acceptFriendRequest(requestId);
            // Remove this request from the list after accepting
            setFriendRequests(prev => prev.filter(req => req._id !== requestId));
            // Refresh friends list
            const updatedFriends = await fetchFriends();
            setFriends(updatedFriends);
        } catch (err) {
            setError('Failed to accept friend request. Please try again.');
        }
    };
    if (authLoading || !user) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }
    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1>Welcome, {user.username || user.email || 'Friend'}!</h1>
                <div className="profile-summary">
                    <Link to="/profile">
                        <img 
                            src={user.profilePicture || 'https://via.placeholder.com/50'} 
                            alt="Profile" 
                            className="profile-pic"
                            style={{ cursor: 'pointer' }}
                        />
                    </Link>
                    <Link to="/profile" className="edit-profile-link">Edit Profile</Link>
                </div>
            </header>
            <nav className="dashboard-nav">
                <button 
                    className={activeTab === 'friends' ? 'active' : ''} 
                    onClick={() => setActiveTab('friends')}
                >
                    My Friends
                </button>
                <button 
                    className={activeTab === 'discover' ? 'active' : ''} 
                    onClick={() => setActiveTab('discover')}
                >
                    Discover
                </button>
                <button 
                    className={activeTab === 'requests' ? 'active' : ''} 
                    onClick={() => setActiveTab('requests')}
                >
                    Requests
                </button>
            </nav>
            {error && <div className="error-message">{error}</div>}
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="dashboard-content">
                    {activeTab === 'friends' && (
                        <>
                            <h2>Your Friends</h2>
                            <div className="friend-list">
                                {friends && friends.length > 0 ? (
                                    friends.map(friend => (
                                        <FriendCard 
                                            key={friend._id} 
                                            friend={{
                                                ...friend,
                                                // Convert objects to strings to avoid React rendering errors
                                                proximityPreference: friend.proximityPreference ? friend.proximityPreference.toString() : undefined,
                                                socialPreferences: friend.socialPreferences ? {...friend.socialPreferences} : undefined,
                                                lifestyle: friend.lifestyle ? {...friend.lifestyle} : undefined,
                                                values: friend.values ? {...friend.values} : undefined
                                            }}
                                            actionLabel="Message"
                                            onAction={(friendId) => history.push(`/chat/${friendId}`)}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>You haven't connected with any friends yet!</p>
                                        <button onClick={() => setActiveTab('discover')}>
                                            Find Friends
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {activeTab === 'discover' && (
                        <SwipeDiscovery />
                    )}
                    {activeTab === 'requests' && (
                        <>
                            <h2>Friend Requests</h2>
                            <div className="friend-list">
                                {friendRequests && friendRequests.length > 0 ? (
                                    friendRequests.map(request => (
                                        <FriendCard 
                                            key={request._id} 
                                            friend={{
                                                ...request.from,
                                                // Convert objects to strings to avoid React rendering errors
                                                proximityPreference: request.from.proximityPreference ? request.from.proximityPreference.toString() : undefined,
                                                socialPreferences: request.from.socialPreferences ? {...request.from.socialPreferences} : undefined,
                                                lifestyle: request.from.lifestyle ? {...request.from.lifestyle} : undefined,
                                                values: request.from.values ? {...request.from.values} : undefined
                                            }}
                                            actionLabel="Accept"
                                            onAction={() => handleAcceptRequest(request._id)}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No pending friend requests.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
export default Dashboard;