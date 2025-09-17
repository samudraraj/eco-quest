import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // Make sure you have the corresponding CSS file

// We receive the 'user' object from Firebase via props from App.js
const Dashboard = ({ user }) => {
    // State to hold profile data fetched from OUR backend
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // This effect runs when the component mounts or when the user object changes
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return; // Don't fetch if user is not logged in
            }

            try {
                // Get the unique ID token from the currently logged-in Firebase user
                const token = await user.getIdToken();

                // Make a request to our protected backend route to get/create the user profile
                const response = await fetch('http://localhost:5001/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Send the token in the Authorization header
                    },
                });

                if (!response.ok) {
                    throw new Error('Could not fetch user profile.');
                }

                const data = await response.json();
                setProfile(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]); // The dependency array ensures this effect re-runs if the user logs in or out

    // --- Placeholder data for UI elements we haven't made dynamic yet ---
    const quickModules = [
        { title: "Photosynthesis Module", duration: "20 min", type: "Lesson", category: "Lessons" },
        { title: "Biodiversity Quiz", details: "10 Q", type: "Quiz", category: "Quizzes" },
        { title: "Campus Clean-up", duration: "2 hrs", type: "Challenge", category: "Eco Challenges" },
        { title: "Water Cycle Module", duration: "15 min", type: "Lesson", category: "Lessons" },
    ];
    // --- End of placeholder data ---

    if (loading) {
        return <div className="loading-screen">Loading your dashboard...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="dashboard-layout">
            {/* Left Column */}
            <div className="dashboard-column left-column">
                {/* Quick Modules Section */}
                <div className="card quick-modules-card">
                    <h3 className="card-title">Quick Modules</h3>
                    {/* This part is now DYNAMIC and uses the 'profile' state */}
                    {profile && (
                        <div className="user-stats">
                            <div className="stat-item">XP: <span className="stat-value">{profile.xp}</span></div>
                            <div className="stat-item">Badges: <span className="stat-value">{profile.badges.length}</span></div>
                            <div className="stat-item">Rank: <span className="stat-value">{profile.rank}</span></div>
                        </div>
                    )}

                    {/* This part is still static for now */}
                    <div className="kanban-summary">
                        <span className="kanban-item">Lessons <span className="kanban-count">2</span></span>
                        <span className="kanban-item">Quizzes <span className="kanban-count">1</span></span>
                        <span className="kanban-item">Eco Challenges <span className="kanban-count">1</span></span>
                        <span className="kanban-item">Done <span className="kanban-count">0</span></span>
                    </div>

                    <div className="module-list">
                        {quickModules.map((module, index) => (
                            <div key={index} className="module-card">
                                <h4>{module.title}</h4>
                                {module.duration && <p className="module-detail">Est. {module.duration}</p>}
                                {module.details && <p className="module-detail">{module.details}</p>}
                                <span className={`module-type ${module.type.toLowerCase().replace(' ', '-')}`}>{module.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Badges Section */}
                <div className="card badges-card">
                    <h3 className="card-title">Badges</h3>
                    {/* This part is also DYNAMIC */}
                    {profile && (
                        <div className="badge-list">
                            {profile.badges.map((badge, index) => (
                                <span key={index} className="badge-item">{badge}</span>
                            ))}
                        </div>
                    )}
                    <p className="badge-motivation">Complete modules to earn more badges. Move a card to Done to claim XP.</p>
                </div>
            </div>

            {/* Right Column (Still using placeholders) */}
            <div className="dashboard-column right-column">
                <div className="card analytics-card">
                    <h3 className="card-title">Analytics</h3>
                    <div className="placeholder-chart"></div>
                </div>
                <div className="card chat-card">
                    <h3 className="card-title">Class Chat</h3>
                    <div className="placeholder-chat-content"></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;