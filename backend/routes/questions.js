// backend/routes/questions.js
const router = require('express').Router();
const authMiddleware = require('../middleware/auth'); // Import our enhanced middleware
let Question = require('../models/question.model');

// This route remains public for anyone to play the quiz
router.get('/', (req, res) => {
    Question.find()
        .then(questions => res.json(questions))
        .catch(err => res.status(400).json('Error: ' + err));
});

// PROTECT THIS ROUTE: Only allow authenticated users with the 'teacher' role
router.post('/add', authMiddleware, (req, res) => {
    // Check the role from the profile attached by the middleware
    if (!req.profile || req.profile.role !== 'teacher') {
        return res.status(403).json({ message: "Forbidden: You do not have permission to add questions." });
    }

    // If the check passes, proceed with adding the question
    const { question, answers, topic } = req.body;
    const newQuestion = new Question({ question, answers, topic });

    newQuestion.save()
        .then(() => res.json('Question added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;