import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = ({ component: Component, ...rest }) => {
    const { user, loading } = useAuth();
    
    return (
        <Route
            {...rest}
            render={(props) => {
                // Show loading while checking auth state
                if (loading) {
                    return (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading...</p>
                        </div>
                    );
                }
                
                // Redirect to login if not authenticated
                if (!user) {
                    return <Redirect to={{ pathname: "/", state: { from: props.location } }} />;
                }
                
                // Render the protected component
                return <Component {...props} />;
            }}
        />
    );
};

export default PrivateRoute;