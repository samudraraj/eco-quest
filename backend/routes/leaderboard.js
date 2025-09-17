// backend/routes/leaderboard.js
const router = require('express').Router();
let UserProfile = require('../models/userProfile.model');

// Path: GET /api/leaderboard/
// Description: Gets the top 10 users ranked by XP
router.get('/', async (req, res) => {
    try {
        const leaderboard = await UserProfile.find()
            .sort({ xp: -1 }) // Sort by XP in descending order (-1)
            .limit(10)        // Limit to the top 10 users
            .select('email xp badges'); // Only select public-facing data

        res.json(leaderboard);
    } catch (err) {
        console.error("Error fetching leaderboard:", err);
        res.status(500).json({ message: "Error fetching leaderboard data." });
    }
});

module.exports = router;