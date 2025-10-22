import axios from 'axios';
// Define API URL without relying on process.env
// In production, you would use environment variables properly
const API_URL = window.REACT_APP_API_URL || 'http://localhost:5000/api';
// Add axios interceptor to handle 401 responses globally
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is expired or invalid, clear it and redirect to login
            localStorage.removeItem('token');
            // Redirect to root (login page) if not already there
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw error.response.data;
        } else if (error.request) {
            // The request was made but no response was received
            throw { message: 'Server is not responding. Please try again later.' };
        } else {
            // Something happened in setting up the request
            throw { message: 'Error setting up request. Please try again.' };
        }
    }
};
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw error.response.data;
        } else if (error.request) {
            // The request was made but no response was received
            throw { message: 'Server is not responding. Please try again later.' };
        } else {
            // Something happened in setting up the request
            throw { message: 'Error setting up request. Please try again.' };
        }
    }
};
// Fetch the user's friends
export const fetchFriends = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/matching/friends`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
};
// Fetch potential friends for matching
export const fetchPotentialFriends = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/matching/potential-friends`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
};
// Send a friend request to another user
export const sendFriendRequest = async (friendId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/matching/match`, 
            { friendId },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
};
// Get pending friend requests
export const getFriendRequests = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/matching/requests`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
};
// Accept a friend request
export const acceptFriendRequest = async (requestId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${API_URL}/matching/requests/${requestId}/accept`, 
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
};
export const sendMessage = async (messageData) => {
    try {
        const response = await axios.post(`${API_URL}/messaging/send`, messageData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
// Get current user's profile
export const getUserProfile = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
};
// Update user's profile
export const updateUserProfile = async (profileData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_URL}/profile`, profileData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
};
// Get friend details by ID
export const getFriendById = async (friendId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/matching/friends/${friendId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
};
// Get chat history with a friend
export const getChatHistory = async (friendId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/messaging/history/${friendId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
};
// Mark messages from a friend as read
export const markMessagesAsRead = async (friendId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }
        const response = await axios.put(`${API_URL}/messaging/read/${friendId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error('Network error');
    }
};