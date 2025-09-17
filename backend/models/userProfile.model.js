// backend/models/userProfile.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProfileSchema = new Schema({
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    // ADD THIS FIELD
    role: {
        type: String,
        required: true,
        enum: ['student', 'teacher'], // Role must be one of these
        default: 'student' // Default role for new users
    },
    xp: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    badges: [{ type: String }],
}, {
    timestamps: true,
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
module.exports = UserProfile;