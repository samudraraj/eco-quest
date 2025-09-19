// backend/models/communityEvent.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communityEventSchema = new Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    xpReward: { type: Number, required: true, default: 0 },
    coinReward: { type: Number, required: true, default: 0 },
    badgeReward: { type: String }, // Optional badge name to award
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
});

const CommunityEvent = mongoose.model('CommunityEvent', communityEventSchema);
module.exports = CommunityEvent;