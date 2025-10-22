import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const useAuth = () => {
    // Use the existing context that we've already set up
    return useContext(AuthContext);
};

export { useAuth };
export default useAuth;