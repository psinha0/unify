import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { registerUser } from '../../services/api';
import '../../styles/auth.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Create a mounted ref to track component mount state
        let isMounted = true;

        // Basic validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            await registerUser({ username, email, password });
            // Only redirect if still mounted
            if (isMounted) {
                // Redirect to the login page at root path
                history.push('/');
            }
        } catch (err) {
            console.error('Registration error:', err);
            // Display more specific error messages from the backend if available
            if (isMounted) {
                if (err && err.message) {
                    setError(err.message);
                } else {
                    setError('Registration failed. Please try again.');
                }
            }
        } finally {
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
        <div className="register-container">
            <h2>Register</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
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
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <div className="auth-footer">
                <p>Already have an account? <Link to="/">Login</Link></p>
            </div>
        </div>
    );
};

export default Register;