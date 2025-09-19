// backend/models/userProfile.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProfileSchema = new Schema({
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: {
        type: String,
        required: true,
        enum: ['student', 'teacher'],
        default: 'student'
    },
    xp: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    badges: [{ type: String }],
    // --- NEW FIELDS ---
    coins: { type: Number, default: 0 }, // New: for a virtual currency
    completedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CommunityEvent' }], // New: to track completed events
    achievements: [{ type: String }], // New: to track specific achievements unlocked
}, {
    timestamps: true,
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
module.exports = UserProfile;