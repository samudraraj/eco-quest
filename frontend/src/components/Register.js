// frontend/src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    // --- NEW STATE ---
    const [role, setRole] = useState('student');
    const [teacherCode, setTeacherCode] = useState('');

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // 1. Create the user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Get the Firebase ID token
            const token = await user.getIdToken();

            // 3. Call our backend to create the user profile with the selected role
            const profileResponse = await fetch('http://localhost:5001/api/profile/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    teacherCode: role === 'teacher' ? teacherCode : undefined
                })
            });

            if (!profileResponse.ok) {
                // If profile creation fails, we should ideally delete the Firebase user
                // For now, we'll just show an error.
                throw new Error("Failed to create user profile on our server.");
            }
            
            console.log("User registered and profile created successfully");
            navigate('/'); // Redirect to the dashboard

        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <h2>Create Your EcoQuest Account</h2>
            <form onSubmit={handleRegister}>
                {/* --- NEW ROLE SELECTOR --- */}
                <div className="form-group">
                    <label>I am a...</label>
                    <div className="role-selector">
                        <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>Student</button>
                        <button type="button" className={role === 'teacher' ? 'active' : ''} onClick={() => setRole('teacher')}>Teacher</button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6" />
                </div>

                {/* --- NEW TEACHER CODE FIELD --- */}
                {role === 'teacher' && (
                    <div className="form-group">
                        <label>Teacher Code</label>
                        <input type="text" value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} required />
                    </div>
                )}
                
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn-primary">Register</button>
            </form>
        </div>
    );
};

export default Register;