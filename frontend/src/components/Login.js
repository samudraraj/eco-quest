// frontend/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Use the Firebase function to sign in
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in successfully:", userCredential.user);
            
            // On success, navigate to the main game page
            navigate('/');
        } catch (err) {
            console.error("Firebase login error:", err);
            // Provide more user-friendly error messages
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else {
                setError('Failed to log in. Please try again.');
            }
        }
    };

    return (
        <div className="auth-container">
            <h2>Login to Your Account</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn-primary">Login</button>
            </form>
        </div>
    );
};

export default Login;