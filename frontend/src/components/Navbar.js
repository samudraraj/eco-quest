import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Navbar.css';

const Navbar = ({ user, profile }) => { // Receive both user and profile as props
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User logged out successfully");
            navigate('/login'); // Redirect to login page after logout
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <img src="/favicon.ico" alt="EcoQuest Logo" className="navbar-logo" />
                EcoQuest
            </Link>
            <div className="nav-links">
                {user ? (
                    // If a user is logged in...
                    <>
                        <Link to="/" className="nav-link">Dashboard</Link>
                        <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
                        <Link to="/quiz" className="nav-link">Quiz</Link>

                        {profile && profile.role === 'teacher' && (
                            <Link to="/add-question" className="nav-link">Add Question</Link>
                        )}
                        <span className="navbar-user-email">{user.email}</span>
                        <button onClick={handleLogout} className="nav-link-button">Logout</button>
                    </>
                ) : (
                    // If no user is logged in, show Register and Login links
                    <>
                        <Link to="/register" className="nav-link">Register</Link>
                        <Link to="/login" className="nav-link">Login</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;