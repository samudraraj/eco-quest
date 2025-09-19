// backend/routes/communityEvents.js
const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
let CommunityEvent = require('../models/communityEvent.model');
let UserProfile = require('../models/userProfile.model'); // Need UserProfile to update

// --- Public Route: Get all active community events ---
router.get('/', async (req, res) => {
    try {
        const activeEvents = await CommunityEvent.find({ endDate: { $gte: new Date() }, isActive: true });
        res.json(activeEvents);
    } catch (err) {
        console.error("Error fetching community events:", err);
        res.status(500).json({ message: "Error fetching community events." });
    }
});

// --- Protected Route (Teacher Only): Add a new community event ---
router.post('/add', authMiddleware, async (req, res) => {
    if (!req.profile || req.profile.role !== 'teacher') {
        return res.status(403).json({ message: "Forbidden: Only teachers can add community events." });
    }

    const { title, description, xpReward, coinReward, badgeReward, startDate, endDate } = req.body;

    const newEvent = new CommunityEvent({
        title, description, xpReward, coinReward, badgeReward, startDate, endDate, isActive: true
    });

    try {
        await newEvent.save();
        res.status(201).json({ message: "Community event added!", event: newEvent });
    } catch (err) {
        console.error("Error adding community event:", err);
        res.status(400).json({ message: "Error adding community event.", error: err.message });
    }
});

// --- Protected Route (Student/Teacher): Complete a community event ---
router.post('/complete/:eventId', authMiddleware, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.uid; // Firebase UID from authMiddleware

        // 1. Find the user profile
        const userProfile = await UserProfile.findOne({ firebaseUid: userId });
        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found." });
        }

        // 2. Find the event
        const event = await CommunityEvent.findById(eventId);
        if (!event || !event.isActive || event.endDate < new Date()) {
            return res.status(404).json({ message: "Event not found or not active." });
        }

        // 3. Check if user already completed this event
        if (userProfile.completedEvents.includes(event._id)) {
            return res.status(400).json({ message: "You have already completed this event." });
        }

        // 4. Update user profile
        userProfile.xp += event.xpReward;
        userProfile.coins += event.coinReward;
        userProfile.completedEvents.push(event._id);

        let newBadgesAwarded = [];
        if (event.badgeReward && !userProfile.badges.includes(event.badgeReward)) {
            userProfile.badges.push(event.badgeReward);
            newBadgesAwarded.push(event.badgeReward);
        }

        // Add a generic achievement for completing a community event
        const eventCompletionAchievement = "Community Contributor";
        if (!userProfile.achievements.includes(eventCompletionAchievement)) {
            userProfile.achievements.push(eventCompletionAchievement);
            // Optionally, add XP/coins for the achievement itself
            userProfile.xp += 10;
        }


        await userProfile.save();

        res.json({
            message: `Event '${event.title}' completed! You earned ${event.xpReward} XP and ${event.coinReward} Coins.`,
            userProfile,
            newBadgesAwarded
        });

    } catch (err) {
        console.error("Error completing event:", err);
        res.status(500).json({ message: "Error completing event.", error: err.message });
    }
});

module.exports = router;