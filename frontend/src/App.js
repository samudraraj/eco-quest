import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import backgroundVideo from './rainforest-bg.mp4'; 
// Import all necessary components
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Game from './Game';
import Register from './components/Register';
import Login from './components/Login';
import AddQuestion from './components/AddQuestion';
import TeacherRoute from './components/TeacherRoute';
import Leaderboard from './components/Leaderboard';

// Import CSS
import './Auth.css';
import './index.css';
import './App.css';

function App() {
  // State for the Firebase user object
  const [user, setUser] = useState(null);
  // State for the user profile data from our MongoDB
  const [profile, setProfile] = useState(null);
  // State to handle initial loading
  const [loading, setLoading] = useState(true);

  // This effect hook is the core of our authentication system
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser); // Set the Firebase user

      // If a user is logged in, fetch their profile from our backend
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const response = await fetch(`http://${process.env.REACT_APP_API_URL}/api/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          // Check if the profile was found or created successfully
          if (response.ok) {
            const profileData = await response.json();
            setProfile(profileData);
          } else if (response.status === 404) {
            // This can happen if a user registered but profile creation failed.
            // We'll handle this by clearing the local profile state.
            console.warn("User profile not found in our database yet.");
            setProfile(null);
          } else {
             // Handle other errors
             throw new Error('Failed to fetch profile.');
          }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setProfile(null);
        }
      } else {
        // If no user is logged in, clear the profile state
        setProfile(null);
      }

      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []); // The empty array ensures this effect runs only once on mount

  if (loading) {
    return (
        <div className="loading-screen">
            Loading EcoQuest...
        </div>
    );
  }

  return (
    <div className="App">
    <video autoPlay loop muted playsInline className="background-video">
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Pass both the Firebase user and our DB profile to the Navbar */}
      <Navbar user={user} profile={profile} />
      <main className="main-content">
        <Routes>
          {/* The Dashboard now receives the profile to display stats */}
           <Route path="/" element={user ? <Dashboard user={user} profile={profile} setProfile={setProfile} /> : <Login />} />
          <Route path="/quiz" element={user ? <Game user={user} /> : <Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* This is our new protected route for teachers */}
          <Route
            path="/add-question"
            element={
              <TeacherRoute profile={profile}>
                <AddQuestion />
              </TeacherRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;