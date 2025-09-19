// backend/models/achievement.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const achievementSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String }, // e.g., a URL or an icon name
    xpReward: { type: Number, default: 0 },
}, {
    timestamps: true,
});

const Achievement = mongoose.model('Achievement', achievementSchema);
module.exports = Achievement;