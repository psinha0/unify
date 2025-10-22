# UNify

**UNify** is an intelligent social networking platform that helps users discover and connect with compatible friends based on shared interests, lifestyle preferences, and personality traits. Using a sophisticated matching algorithm and Tinder-style swipe interface, the application makes finding meaningful friendships easy and engaging.

---

## Table of Contents

- [UNify](#unify)
  - [Table of Contents](#table-of-contents)
  - [Key Features](#key-features)
  - [Complete Setup Instructions](#complete-setup-instructions)
    - [Step 1: Install Required Software](#step-1-install-required-software)
      - [1.1 Install Node.js and npm](#11-install-nodejs-and-npm)
      - [1.2 Install MongoDB](#12-install-mongodb)
      - [1.3 Install Git (Optional, for cloning)](#13-install-git-optional-for-cloning)
    - [Step 2: Download the Project](#step-2-download-the-project)
      - [Option A: Using Git](#option-a-using-git)
      - [Option B: Download ZIP](#option-b-download-zip)
    - [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
      - [3.1 Server Configuration](#31-server-configuration)
      - [3.2 Client Configuration](#32-client-configuration)
    - [Step 4: Install Dependencies](#step-4-install-dependencies)
      - [4.1 Install Server Dependencies](#41-install-server-dependencies)
      - [4.2 Install Client Dependencies](#42-install-client-dependencies)
    - [Step 5: Seed the Database](#step-5-seed-the-database)
    - [Step 6: Start the Application](#step-6-start-the-application)
      - [6.1 Start the Server (Terminal 1)](#61-start-the-server-terminal-1)
      - [6.2 Start the Client (Terminal 2)](#62-start-the-client-terminal-2)
    - [Step 7: Login and Explore](#step-7-login-and-explore)
      - [Demo Account](#demo-account)
      - [Or Create New Account](#or-create-new-account)
  - [Using the Application](#using-the-application)
    - [Dashboard](#dashboard)
    - [Discovering Friends](#discovering-friends)
    - [Messaging](#messaging)
    - [Profile \& Analytics](#profile--analytics)
  - [Technology Stack](#technology-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Development Tools](#development-tools)
  - [Available Scripts](#available-scripts)
    - [Server Scripts](#server-scripts)
    - [Client Scripts](#client-scripts)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [Profile](#profile)
    - [Matching](#matching)
    - [Messaging](#messaging-1)
    - [Socket Events](#socket-events)
  - [Troubleshooting](#troubleshooting)
    - [MongoDB Connection Failed](#mongodb-connection-failed)
    - [Port Already in Use](#port-already-in-use)
    - [Cannot Send Messages](#cannot-send-messages)
    - [Login Not Working](#login-not-working)
    - ["Module not found" Errors](#module-not-found-errors)
  - [Demo Users](#demo-users)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)
  - [Support](#support)
    - [Running the Application](#running-the-application)
  - [Contributing](#contributing)
  - [License](#license-1)

---

## Key Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing and persistent sessions
- **Personality Assessment**: 10-question onboarding questionnaire covering communication preferences, social energy, lifestyle, and values, plus optional enhanced 15-question assessment
- **Intelligent Matching**: Multi-factor compatibility scoring (Interests 40%, Social Preferences 30%, Lifestyle 20%, Values 10%) with behavioral learning from swipe patterns
- **Tinder-Style Discovery**: Intuitive card-based swipe interface with match percentages, detailed compatibility breakdowns, and smart categorization
- **Real-Time Messaging**: Socket.IO-powered instant messaging with read receipts, typing indicators, and persistent chat history
- **Analytics Dashboard**: Three-tab interface showing profile completeness, match quality metrics, complete data transparency, and actionable improvement suggestions
- **Friend Management**: Complete friendship lifecycle including requests, acceptance, and easy navigation between conversations
- **Responsive Design**: Mobile-friendly interface with touch gestures and adaptive layouts
- **Database Seeding**: Pre-populated with 30 diverse user profiles, established friendships, and realistic conversation histories

---

## Complete Setup Instructions

Follow these steps to run UNify on your local machine. This guide assumes you're starting from scratch with no applications installed.

### Step 1: Install Required Software

#### 1.1 Install Node.js and npm
1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version for your operating system
3. Run the installer and follow the installation wizard
4. Accept default settings and complete installation
5. Verify installation by opening a terminal/command prompt and running:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (e.g., `v18.x.x` and `9.x.x`)

#### 1.2 Install MongoDB
1. Visit [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download **MongoDB Community Server** for your operating system
3. Run the installer:
   - **Windows**: Choose "Complete" installation, install as a Windows Service
   - **macOS**: Follow the installation prompts or use Homebrew: `brew install mongodb-community`
   - **Linux**: Follow instructions for your distribution at [MongoDB Linux Installation](https://docs.mongodb.com/manual/administration/install-on-linux/)
4. Verify MongoDB is running:
   - **Windows**: Check Services (Win+R, type `services.msc`, look for "MongoDB")
   - **macOS/Linux**: Run `mongod --version` in terminal

#### 1.3 Install Git (Optional, for cloning)
1. Visit [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Download and install Git for your operating system
3. Follow installation wizard with default settings

---

### Step 2: Download the Project

#### Option A: Using Git
```bash
git clone <repository-url>
cd unify
```

#### Option B: Download ZIP
1. Download the project ZIP file
2. Extract to a folder of your choice
3. Open terminal/command prompt in that folder

---

### Step 3: Configure Environment Variables

#### 3.1 Server Configuration
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a file named `.env` in the `server` folder

3. Add the following configuration (copy and paste):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/unify
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

4. **Important**: Change `JWT_SECRET` to a random string for security

#### 3.2 Client Configuration
1. Navigate to the client directory:
   ```bash
   cd ../client
   ```

2. Create a file named `.env` in the `client` folder

3. Add the following configuration:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

---

### Step 4: Install Dependencies

#### 4.1 Install Server Dependencies
```bash
cd server
npm install
```
Wait for all packages to download and install (this may take 1-3 minutes).

#### 4.2 Install Client Dependencies
```bash
cd ../client
npm install
```
Wait for all packages to download and install (this may take 2-5 minutes).

---

### Step 5: Seed the Database

This step populates your database with 30 sample users and message history.

```bash
cd ../server
node src/seed/production-30-users.js
```

You should see output confirming:
- 30 users created
- 5 friendships established for alex_example
- 23 messages created
- "SEED COMPLETED SUCCESSFULLY"

---

### Step 6: Start the Application

You need to run both the **server** and **client** simultaneously.

#### 6.1 Start the Server (Terminal 1)
```bash
cd server
npm start
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
Socket.IO server initialized
```

**Keep this terminal running** - do not close it.

#### 6.2 Start the Client (Terminal 2)
Open a **new terminal window/tab** and run:

```bash
cd client
npm start
```

The React development server will start and automatically open your browser to:
```
http://localhost:3000
```

If it doesn't open automatically, manually visit that URL in your browser.

---

### Step 7: Login and Explore

#### Demo Account
Use this pre-seeded account to explore the app:
- **Email**: `alex@example.com`
- **Password**: `password123`

This account has:
- Completed questionnaire
- 5 established friendships
- Message history with multiple friends
- High match scores with many users

#### Or Create New Account
1. Click "Register" on the login page
2. Fill in your details
3. Complete the 10-question onboarding questionnaire
4. Start discovering friends!

---

## Using the Application

### Dashboard
After logging in, you'll see three tabs:
- **Friends**: Your current friends with quick message access
- **Discover**: Tinder-style swipe interface to find new friends
- **Requests**: Pending friend requests you've received

### Discovering Friends
1. Go to the **Discover** tab
2. View the match percentage and compatibility reasons
3. Click "See Full Bio" to expand user details
4. Swipe right (Connect button) to send a friend request
5. Swipe left (Pass button) to see the next person
6. The algorithm learns from your choices!

### Messaging
1. Click on any friend from your Friends list
2. Start typing in the message box at the bottom
3. See real-time typing indicators when they respond
4. Messages show checkmark (sent) and double checkmark (read) status

### Profile & Analytics
1. Click your username in the navigation
2. **Profile Tab**: Update bio, interests, and questionnaire answers
3. **Analytics Tab**: View detailed insights about your matches
   - Overview: Match quality metrics
   - What We Know: All your profile data
   - Suggestions: Recommendations to improve matches

---

## Technology Stack

### Frontend
- **React 17**: Component-based UI framework
- **React Router 5**: Client-side routing
- **Socket.IO Client**: Real-time WebSocket communication
- **Axios**: HTTP client for API requests
- **React Icons**: Icon library

### Backend
- **Node.js**: JavaScript runtime
- **Express 4**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose 5**: MongoDB object modeling
- **Socket.IO 3**: Real-time bidirectional communication
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing

### Development Tools
- **nodemon**: Auto-restart server on changes
- **concurrently**: Run multiple npm scripts simultaneously

---

## Available Scripts

### Server Scripts
```bash
npm start          # Start production server
npm run dev        # Start with nodemon (auto-restart)
npm run seed       # Seed database with sample data
```

### Client Scripts
```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/current` - Get current user

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/questionnaire` - Submit questionnaire answers

### Matching
- `GET /api/matching/potential-friends` - Get match recommendations
- `POST /api/matching/record-swipe` - Record swipe for learning
- `POST /api/matching/friend-request` - Send friend request
- `GET /api/matching/analytics` - Get match analytics

### Messaging
- `GET /api/messages/friends` - Get friends list
- `GET /api/messages/chat/:friendId` - Get chat history
- `POST /api/messages/mark-read/:friendId` - Mark messages as read

### Socket Events
- `user_login` - Register user as online
- `private_message` - Send message
- `receive_message` - Receive message
- `typing` - Send typing indicator
- `user_typing` - Receive typing indicator
- `messages_read` - Messages marked as read
- `chatOpened` - User opened a chat

---

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running (check Services on Windows, or run `mongod` on Mac/Linux)
- Verify connection string in `server/.env`
- Try connecting manually: `mongosh mongodb://localhost:27017`

### Port Already in Use
- **Server (Port 5000)**: Change `PORT` in `server/.env`
- **Client (Port 3000)**: React will automatically prompt you to use port 3001

### Cannot Send Messages
- Check that both server and client are running
- Open browser console (F12) and check for errors
- Verify Socket.IO connection in Network tab

### Login Not Working
- Ensure database is seeded (`node src/seed/production-30-users.js`)
- Check that `JWT_SECRET` is set in `server/.env`
- Clear browser localStorage and try again

### "Module not found" Errors
- Delete `node_modules` folder
- Run `npm install` again in both client and server directories

---

## Demo Users

All demo users have the password: `password123`

**Main Demo Account**:
- Email: `alex@example.com` (5 friends, message history)

**Other Available Users**:
- `sarah@example.com` - Outdoor enthusiast
- `mike@example.com` - Mountain climber
- `emma@example.com` - Nature photographer
- `josh@example.com` - Adventure traveler
- `lisa@example.com` - Hiking enthusiast
- ...and 24 more diverse profiles!

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

Built as part of INFS3059 coursework, demonstrating modern web development practices including:
- Real-time communication with WebSockets
- JWT authentication and authorization
- Advanced matching algorithms
- Responsive React component architecture
- RESTful API design
- NoSQL database modeling

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review error messages in browser console (F12)
3. Check server terminal for backend errors
4. Ensure all dependencies are installed correctly

---

**UNify - Connecting People Through Intelligent Matching**

### Running the Application

1. Start the server:
   ```
   cd server
   npm start
   ```

2. Start the client:
   ```
   cd ../client
   npm start
   ```


4. Start the server:
   ```
   cd server
   npm start
   ```

5. Start the client:
   ```
   cd ../client
   npm start
   ```

The application should now be running on `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.