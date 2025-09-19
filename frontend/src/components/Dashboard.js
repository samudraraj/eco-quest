import React, { useState, useEffect } from 'react';
import './Dashboard.css'; // Make sure you have the corresponding CSS file

const Dashboard = ({ user, profile, setProfile }) => { // We'll need setProfile to update the UI instantly
    // State for community events
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Effect to fetch community events when the component loads
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/community-events');
                if (!response.ok) {
                    throw new Error('Failed to fetch community events');
                }
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingEvents(false);
            }
        };
        fetchEvents();
    }, []);

    // Function to handle event completion
    const handleCompleteEvent = async (eventId) => {
        if (!user) return;

        try {
            const token = await user.getIdToken();
            const response = await fetch(`http://localhost:5001/api/community-events/complete/${eventId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to complete event.');
            }

            const result = await response.json();
            // Update the profile state in App.js to reflect the new XP, coins, and badges instantly!
            setProfile(result.userProfile); 
            alert(result.message); // Simple alert for user feedback

        } catch (error) {
            console.error("Error completing event:", error);
            alert(error.message);
        }
    };

    // --- Placeholder data for UI elements we haven't made dynamic yet ---
    const quickModules = [
        { title: "Photosynthesis Module", duration: "20 min", type: "Lesson" },
        { title: "Biodiversity Quiz", details: "10 Q", type: "Quiz" },
    ];
    // --- End of placeholder data ---

    return (
        <div className="dashboard-layout">
            {/* Left Column */}
            <div className="dashboard-column left-column">
                <div className="card quick-modules-card">
                    <h3 className="card-title">Quick Modules</h3>
                    {profile && (
                        <div className="user-stats">
                            <div className="stat-item">XP: <span className="stat-value">{profile.xp}</span></div>
                            <div className="stat-item">Coins: <span className="stat-value">{profile.coins}</span></div> {/* Added Coins */}
                            <div className="stat-item">Badges: <span className="stat-value">{profile.badges.length}</span></div>
                        </div>
                    )}
                    <div className="module-list">
                        {quickModules.map((module, index) => (
                            <div key={index} className="module-card">
                                <h4>{module.title}</h4>
                                {module.duration && <p className="module-detail">Est. {module.duration}</p>}
                                {module.details && <p className="module-detail">{module.details}</p>}
                                <span className={`module-type ${module.type.toLowerCase()}`}>{module.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- NEW Community Events Panel --- */}
                <div className="card community-events-card">
                    <h3 className="card-title">Community Events</h3>
                    {loadingEvents ? <p>Loading events...</p> : (
                        <div className="events-list">
                            {events.map(event => (
                                <div key={event._id} className="event-card">
                                    <h4>{event.title}</h4>
                                    <p className="event-description">{event.description}</p>
                                    <div className="event-rewards">
                                        <span>XP: {event.xpReward}</span>
                                        <span>Coins: {event.coinReward}</span>
                                        {event.badgeReward && <span>Badge: {event.badgeReward}</span>}
                                    </div>
                                    <button 
                                        className="btn-participate" 
                                        onClick={() => handleCompleteEvent(event._id)}
                                        disabled={profile?.completedEvents?.includes(event._id)}
                                    >
                                        {profile?.completedEvents?.includes(event._id) ? 'Completed' : 'Complete Event'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column */}
            <div className="dashboard-column right-column">
                {/* --- UPDATED Achievements/Badges Panel --- */}
                <div className="card badges-card">
                    <h3 className="card-title">Achievements & Badges</h3>
                    {profile && (
                        <div className="badge-list">
                            {/* Display badges from user's profile */}
                            {profile.badges.map((badge, index) => (
                                <span key={index} className="badge-item">{badge}</span>
                            ))}
                            {/* Display achievements from user's profile */}
                            {profile.achievements.map((achievement, index) => (
                                <span key={index} className="badge-item achievement">{achievement}</span>
                            ))}
                        </div>
                    )}
                    <p className="badge-motivation">Complete modules and events to earn more rewards!</p>
                </div>
                
                <div className="card analytics-card">
                    <h3 className="card-title">Analytics</h3>
                    <div className="placeholder-chart"></div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;