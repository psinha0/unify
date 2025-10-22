import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from './Auth/Login';
import Register from './Auth/Register';
import PrivateRoute from './Auth/PrivateRoute';
import Dashboard from './Dashboard/Dashboard';
import ChatInterface from './Messaging/ChatInterface';
import Profile from './Profile/Profile';
import MatchAnalytics from './Profile/MatchAnalytics';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Switch>
                    <Route path="/" exact component={Login} />
                    <Route path="/register" component={Register} />
                    <PrivateRoute path="/dashboard" component={Dashboard} />
                    <PrivateRoute path="/profile/analytics" component={MatchAnalytics} />
                    <PrivateRoute path="/profile" component={Profile} />
                    <PrivateRoute path="/chat/:friendId" component={ChatInterface} />
                </Switch>
            </Router>
        </AuthProvider>
    );
};

export default App;