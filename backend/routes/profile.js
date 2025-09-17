// backend/routes/profile.js
const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
let UserProfile = require('../models/userProfile.model');

// The secret code to become a teacher
const TEACHER_CODE = "ECO-TEACHER-2025";

// This route now handles initial profile creation with role assignment
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { teacherCode } = req.body;
        const { uid, email } = req.user;

        let userProfile = await UserProfile.findOne({ firebaseUid: uid });
        if (userProfile) {
            return res.status(200).json(userProfile); // Profile already exists
        }

        let userRole = 'student';
        if (teacherCode && teacherCode === TEACHER_CODE) {
            userRole = 'teacher';
        }

        const newUserProfile = new UserProfile({
            firebaseUid: uid,
            email: email,
            role: userRole,
            xp: 120, // Default starting values
            badges: ["Eco Starter"],
            rank: 5,
        });

        await newUserProfile.save();
        res.status(201).json(newUserProfile);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating user profile." });
    }
});

// Route to get the user's profile (remains largely the same)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userProfile = await UserProfile.findOne({ firebaseUid: req.user.uid });
        if (!userProfile) {
            // This case is now less likely but good as a fallback
            return res.status(404).json({ message: "Profile not found. Please complete registration." });
        }
        res.json(userProfile);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user profile." });
    }
});

// A protected route to update score/XP
router.post('/quiz/complete', authMiddleware, async (req, res) => {
    const { score } = req.body;
    const xpGained = score; // e.g., 10 points = 10 XP

    try {
        const userProfile = await UserProfile.findOneAndUpdate(
            { firebaseUid: req.user.uid },
            { $inc: { xp: xpGained } }, // Atomically increment the XP
            { new: true, upsert: true } // Options: return the new doc, and create if it doesn't exist
        );
        res.json({ message: `Score saved! You earned ${xpGained} XP!`, userProfile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating user XP." });
    }
});

module.exports = router;