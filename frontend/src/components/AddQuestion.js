// frontend/src/components/AddQuestion.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import './AddQuestion.css'; // We'll create this CSS file next

const AddQuestion = () => {
    const [questionText, setQuestionText] = useState('');
    const [answers, setAnswers] = useState([
        { text: '', correct: true },
        { text: '', correct: false },
        { text: '', correct: false },
        { text: '', correct: false },
    ]);
    const [topic, setTopic] = useState('General');
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index].text = value;
        setAnswers(newAnswers);
    };

    const handleCorrectAnswerChange = (index) => {
        const newAnswers = answers.map((answer, i) => ({
            ...answer,
            correct: i === index,
        }));
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback({ message: '', type: '' });

        if (!auth.currentUser) {
            setFeedback({ message: 'You must be logged in to add a question.', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch('http://localhost:5001/api/questions/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    question: questionText,
                    answers: answers,
                    topic: topic,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add question.');
            }

            setFeedback({ message: 'Question added successfully!', type: 'success' });
            // Reset form
            setQuestionText('');
            setAnswers([
                { text: '', correct: true }, { text: '', correct: false },
                { text: '', correct: false }, { text: '', correct: false },
            ]);
            setTopic('General');
        } catch (error) {
            setFeedback({ message: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-question-container">
            <div className="card">
                <h2 className="card-title">Add a New Quiz Question</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="topic">Topic</label>
                        <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="questionText">Question Text</label>
                        <textarea id="questionText" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Answers</label>
                        <p className="instructions">Select the radio button for the correct answer.</p>
                        {answers.map((answer, index) => (
                            <div key={index} className="answer-input-group">
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={answer.correct}
                                    onChange={() => handleCorrectAnswerChange(index)}
                                />
                                <input
                                    type="text"
                                    placeholder={`Answer ${index + 1}`}
                                    value={answer.text}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    {feedback.message && (
                        <div className={`feedback-message ${feedback.type}`}>
                            {feedback.message}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit Question'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddQuestion;