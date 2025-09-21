import React, { useState } from 'react';
import { auth } from '../firebase';
import './AddQuestion.css'; // Using our revamped CSS

const AddQuestion = () => {
    const [questionText, setQuestionText] = useState('');
    const [answers, setAnswers] = useState([
        { text: '', correct: true },
        { text: '', correct: false },
    ]);
    const [topic, setTopic] = useState('General');
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    // --- NEW: Dynamic Answer Handling ---
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

    const handleAddAnswer = () => {
        if (answers.length < 6) { // Limit to 6 answers
            setAnswers([...answers, { text: '', correct: false }]);
        }
    };

    const handleRemoveAnswer = (indexToRemove) => {
        if (answers.length > 2) { // Must have at least 2 answers
            let newAnswers = answers.filter((_, index) => index !== indexToRemove);
            // If the removed answer was the correct one, set the first one as correct
            if (!newAnswers.some(a => a.correct)) {
                newAnswers[0].correct = true;
            }
            setAnswers(newAnswers);
        }
    };

    // --- Form Submission Logic (same as before) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback({ message: '', type: '' });

        if (!auth.currentUser) {
            setFeedback({ message: 'You must be logged in.', type: 'error' });
            setIsLoading(false);
            return;
        }

        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/questions/add`, {
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
            setAnswers([{ text: '', correct: true }, { text: '', correct: false }]);
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
                <h2 className="card-title">Create a New Question</h2>
                <form onSubmit={handleSubmit} className="form-grid">
                    {/* --- Left Column --- */}
                    <div className="form-column">
                        <div className="form-group">
                            <label htmlFor="topic">Topic</label>
                            <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="questionText">Question Text</label>
                            <textarea id="questionText" value={questionText} onChange={(e) => setQuestionText(e.target.value)} required rows="5" />
                        </div>
                    </div>

                    {/* --- Right Column --- */}
                    <div className="form-column">
                        <div className="form-group">
                            <label>Answer Options</label>
                            <p className="instructions">Click the checkmark to set the correct answer. You must have between 2 and 6 answers.</p>
                            {answers.map((answer, index) => (
                                <div key={index} className={`answer-input-wrapper ${answer.correct ? 'is-correct' : ''}`}>
                                    <input
                                        type="text"
                                        placeholder={`Answer Option ${index + 1}`}
                                        value={answer.text}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        required
                                        className="answer-input"
                                    />
                                    <button type="button" className="correct-answer-btn" title="Mark as correct" onClick={() => handleCorrectAnswerChange(index)}>
                                        ✔
                                    </button>
                                    {answers.length > 2 && (
                                        <button type="button" className="remove-answer-btn" title="Remove answer" onClick={() => handleRemoveAnswer(index)}>
                                            ✖
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {answers.length < 6 && (
                             <button type="button" className="btn-add-answer" onClick={handleAddAnswer}>
                                + Add Another Answer
                            </button>
                        )}
                    </div>

                    {/* --- Full-Width Section --- */}
                    <div className="form-footer">
                        {feedback.message && (
                            <div className={`feedback-message ${feedback.type}`}>
                                {feedback.message}
                            </div>
                        )}
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddQuestion;