const User = require('../models/user.model.extended');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.username === username 
                    ? 'Username already exists' 
                    : 'Email already in use' 
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Add some default interests to make matching more effective
        const defaultInterests = ['Travel', 'Music', 'Movies', 'Food', 'Technology'];
        // Randomly select 2-4 interests from the default list
        const numberOfInterests = Math.floor(Math.random() * 3) + 2; // 2 to 4
        const randomInterests = [];
        while (randomInterests.length < numberOfInterests) {
            const randomIndex = Math.floor(Math.random() * defaultInterests.length);
            const interest = defaultInterests[randomIndex];
            if (!randomInterests.includes(interest)) {
                randomInterests.push(interest);
            }
        }
        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword,
            interests: randomInterests,
            bio: `Hi, I'm ${username}! I'm new to Friend Finder and looking to connect with people who share my interests.`,
            location: 'Australia' // Default location
            // Note: lastQuestionnaireDate is intentionally NOT set - user is new and needs to complete it
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email or username
        const user = await User.findOne({ 
            $or: [
                { email: email },
                { username: email } // Allow login with either email or username
            ] 
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        // Return full user info (without password) and token
        // Use toObject() to get a plain object, then remove password
        const userObject = user.toObject();
        delete userObject.password;
        res.status(200).json({ user: userObject, token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
exports.logout = async (req, res) => {
    try {
        // JWT is stateless, so we don't actually need to do anything server-side
        // The client is responsible for removing the token
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out', error });
    }
};
exports.getCurrentUser = async (req, res) => {
    try {
        // req.userId is set by the auth middleware
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
};