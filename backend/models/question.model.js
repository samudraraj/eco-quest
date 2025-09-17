// backend/models/question.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
    text: { type: String, required: true },
    correct: { type: Boolean, required: true }
});

const questionSchema = new Schema({
    question: { type: String, required: true },
    answers: [answerSchema],
    topic: { type: String, required: true, default: 'General' }
}, {
    timestamps: true,
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;