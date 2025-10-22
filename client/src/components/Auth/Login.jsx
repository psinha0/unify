import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import '../../styles/auth.css';
const Login = () => {
    const { login } = useAuth();
    const history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Create a mounted ref to track component mount state
        let isMounted = true;
        try {
            setError('');
            setLoading(true);
            const response = await login(email, password);
            // Only redirect if still mounted
            if (isMounted) {
                // Check if user needs to complete questionnaire using lastQuestionnaireDate
                // This is the single source of truth for questionnaire completion
                const needsQuestionnaire = !response.user.lastQuestionnaireDate;
                if (needsQuestionnaire) {
                    // User hasn't completed questionnaire, redirect to profile
                    history.push('/profile?newUser=true');
                } else {
                    // User has completed questionnaire, go to dashboard
                    history.push('/dashboard');
                }
            }
        } catch (err) {
            // Only update state if component is still mounted
            if (isMounted) {
                if (err && err.message) {
                    setError(err.message);
                } else {
                    setError('Login failed. Please check your email and password.');
                }
            }
        } finally {
            // Only update loading state if component is still mounted
            if (isMounted) {
                setLoading(false);
            }
        }
        // Cleanup function
        return () => {
            isMounted = false;
        };
    };
    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <div className="auth-footer">
                <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
        </div>
    );
};
export default Login;