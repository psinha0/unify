const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth.routes');
const matchingRoutes = require('./routes/matching.routes');
const messagingRoutes = require('./routes/messaging.routes');
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/messaging', messagingRoutes);
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../../client/build')));
    // Any route that is not api will be redirected to index.html
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../client/build/index.html'));
    });
}
// Make socket.io instance available to API routes
app.set('socketio', io);
// Socket.io setup for real-time messaging
const socketSetup = require('./socket')(io);
// Store online users map in the app so it can be accessed from routes
app.set('socketData', {
    onlineUsers: socketSetup.onlineUsers
});
// Database connection
mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});