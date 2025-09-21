// frontend/src/components/Leaderboard.js
import React, { useState, useEffect } from 'react';
import './Leaderboard.css'; // We'll create this file next

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/leaderboard`);
                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }
                const data = await response.json();
                setLeaderboardData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []); // Runs once when the component mounts

    if (loading) return <div className="loading-screen">Loading Leaderboard...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="leaderboard-container">
            <div className="card">
                <h1 className="card-title">🏆 Eco-Warriors Leaderboard 🏆</h1>
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>XP</th>
                            <th>Badges</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.map((user, index) => (
                            <tr key={user._id} className={index < 3 ? `rank-${index + 1}` : ''}>
                                <td className="rank-cell">{index + 1}</td>
                                <td className="player-cell">{user.email}</td>
                                <td className="xp-cell">{user.xp}</td>
                                <td className="badges-cell">{user.badges.length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;