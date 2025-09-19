// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON in request bodies

// --- MongoDB Connection ---
const uri = process.env.MONGO_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// --- API Routes ---
// We will create these files next
const questionRoutes = require('./routes/questions');
app.use('/api/questions', questionRoutes);

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

const leaderboardRoutes = require('./routes/leaderboard');
app.use('/api/leaderboard', leaderboardRoutes);

const communityEventRoutes = require('./routes/communityEvents');
app.use('/api/community-events', communityEventRoutes);

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});