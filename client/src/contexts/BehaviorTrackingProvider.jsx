import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
    initializeBehaviorTracking, 
    trackMessageSent, 
    trackMessageReceived 
} from '../../services/behaviorTracking';

const BehaviorTrackingProvider = ({ children }) => {
    const { user } = useAuth();
    const [trackingInitialized, setTrackingInitialized] = useState(false);

    useEffect(() => {
        // Only initialize if we have a user
        if (user && user.id && !trackingInitialized) {
            // Initialize the behavior tracking service
            initializeBehaviorTracking(user.id);
            setTrackingInitialized(true);
            console.log('Behavior tracking initialized for user:', user.id);
        }
    }, [user, trackingInitialized]);

    return <>{children}</>;
};

export default BehaviorTrackingProvider;