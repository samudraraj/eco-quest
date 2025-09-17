// frontend/src/components/TeacherRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const TeacherRoute = ({ children, profile }) => {
    // If profile is still loading, you might want to show a loading spinner
    if (!profile) {
        return <div>Loading user permissions...</div>;
    }
    
    // If user is a teacher, render the children (the protected page). 
    // Otherwise, redirect them to the home page.
    return profile.role === 'teacher' ? children : <Navigate to="/" />;
};

export default TeacherRoute;