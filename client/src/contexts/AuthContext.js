import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser } from '../services/api';
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const login = async (email, password) => {
        try {
            setLoading(true);
            // Use the API service to login
            const data = await loginUser({ email, password });
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            // Check if user is new (no questionnaire data) - use lastQuestionnaireDate
            const isUserNew = !data.user.lastQuestionnaireDate;
            setIsNewUser(isUserNew);
            // Set user info from response
            setUser(data.user);
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };
    const logout = async () => {
        try {
            setLoading(true);
            // Remove token from localStorage
            localStorage.removeItem('token');
            setUser(null);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };
    const register = async (userData) => {
        try {
            setLoading(true);
            // Use the API service to register
            const data = await registerUser(userData);
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };
    // Check if user is logged in when app loads
    useEffect(() => {
        let isMounted = true;
        const checkLoggedIn = async () => {
            try {
                if (isMounted) setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    if (isMounted) {
                        setUser(null);
                        setLoading(false);
                    }
                    return;
                }
                // Small delay to ensure server is ready
                await new Promise(resolve => setTimeout(resolve, 100));
                // Try to get user profile using the token
                try {
                    const API_URL = window.REACT_APP_API_URL || 'http://localhost:5000/api';
                    const response = await fetch(`${API_URL}/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        if (isMounted) {
                            setUser(userData);
                            // Check if user is new (no questionnaire data) - use lastQuestionnaireDate
                            const isUserNew = !userData.lastQuestionnaireDate;
                            setIsNewUser(isUserNew);
                        }
                    } else {
                        // Token is invalid or expired
                        localStorage.removeItem('token');
                        if (isMounted) {
                            setUser(null);
                            setIsNewUser(false);
                        }
                    }
                } catch (fetchError) {
                    localStorage.removeItem('token');
                    if (isMounted) {
                        setUser(null);
                        setIsNewUser(false);
                    }
                }
            } catch (error) {
                localStorage.removeItem('token');
                if (isMounted) {
                    setUser(null);
                    setIsNewUser(false);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        checkLoggedIn();
        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []);
    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout, register, isNewUser, setIsNewUser }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    return useContext(AuthContext);
};