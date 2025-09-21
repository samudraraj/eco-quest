import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Game.css'; 

// The 'user' prop is passed down from App.js and contains the logged-in user's info from Firebase
function Game({ user }) {
    // State for fetching questions
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for managing gameplay
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isQuizFinished, setIsQuizFinished] = useState(false);

    // New state to handle the process of submitting the score
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    // Effect hook to fetch questions when the component loads
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/questions`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                // Let's just use 5 questions for a shorter quiz to make testing faster
                setQuestions(data.slice(0, 5)); 
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []); // Empty dependency array means this runs once on mount

    // Effect hook that runs when the quiz is finished to save the score
    useEffect(() => {
        const handleQuizCompletion = async () => {
            if (!isQuizFinished || !user) return; // Only run if quiz is finished and user is logged in

            setIsSubmitting(true);
            setSubmitMessage('Saving your score...');

            try {
                const token = await user.getIdToken();
                const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/profile/quiz/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ score: score }),
                });

                if (!response.ok) {
                    throw new Error('Failed to save score.');
                }

                const result = await response.json();
                console.log(result.message);
                setSubmitMessage(`Score saved successfully! You earned ${score} XP!`);

            } catch (err) {
                console.error(err);
                setSubmitMessage('Error saving score. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        };

        handleQuizCompletion();
    }, [isQuizFinished, score, user]); // Dependencies: runs when these values change

    // --- Gameplay Functions ---

    const handleAnswerClick = (answer) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);
        if (answer.correct) {
            setScore(prevScore => prevScore + 10);
        }
    };

    const handleNextQuestion = () => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            setIsQuizFinished(true); // This triggers the useEffect for quiz completion
        }
    };
    
    const handleRestartQuiz = () => {
        // This would restart the quiz, but for now we'll just link back to the dashboard
        // A full restart would require re-fetching or resetting questions, score, etc.
        // For now, let's keep it simple. The main goal is to return to the dashboard to see XP.
        setIsQuizFinished(false);
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsAnswered(false);
        setSelectedAnswer(null);
    };

    // --- Render Logic ---

    if (loading) return <div>Loading questions...</div>;
    if (error) return <div>Error: {error}</div>;
    if (questions.length === 0) return <div>No questions found in the database. Add some questions to play!</div>;

    if (isQuizFinished) {
        return (
            <div className="quiz-container">
                <h1>Quiz Complete!</h1>
                <p>Your final score is: {score}</p>
                
                <p className="submit-message">{submitMessage}</p>

                {/* Use our new container and button classes */}
                <div className="quiz-actions">
                    <button onClick={handleRestartQuiz} className="btn-secondary" disabled={isSubmitting}>
                        Play Again
                    </button>
                    <Link to="/" className="btn-primary" style={{textDecoration: 'none'}}>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Render this screen for the active quiz
    const currentQuestion = questions[currentQuestionIndex];
    
    const getButtonClass = (answer) => {
        if (!isAnswered) return 'btn-answer';
        if (answer.correct) return 'btn-answer correct';
        if (answer === selectedAnswer && !answer.correct) return 'btn-answer incorrect';
        return 'btn-answer';
    };

    return (
        <div className="quiz-container">
            <h1>EcoQuest Quiz</h1>
            <div className="hud">
                <p>Question {currentQuestionIndex + 1} / {questions.length}</p>
                <p>Score: {score}</p>
            </div>
            
            <h2 className="question-text">{currentQuestion.question}</h2>
            
            <div className="answer-grid">
                {currentQuestion.answers.map((answer, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerClick(answer)}
                        className={getButtonClass(answer)}
                        disabled={isAnswered}
                    >
                        {answer.text}
                    </button>
                ))}
            </div>

            {isAnswered && (
                <div className="feedback-section">
                    <p className={selectedAnswer.correct ? 'feedback-correct' : 'feedback-incorrect'}>
                        {selectedAnswer.correct ? "Correct!" : "Sorry, that's not right."}
                    </p>
                    <button onClick={handleNextQuestion} className="btn-primary">Next Question</button>
                </div>
            )}
        </div>
    );
}

export default Game;