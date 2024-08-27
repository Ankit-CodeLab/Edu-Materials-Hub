import React, { useState, useEffect } from 'react';
import { Link , useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const BaseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${BaseUrl}/forgot-password`, { email });
            setMessage(response.data.message);
            setError('');
        } catch (error) {
            console.error('Error sending reset email:', error);
            if (error.response && error.response.data) {
                setError(error.response.data.message || 'Failed to send reset email.');
            } else {
                setError('Failed to send reset email.');
            }
            setMessage('');
        }
    };

    return (
        <div className="Login">
            <div className="login-box">
                <div className="heading">
                    <p>Forgot Password</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="text-box">
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <i className="bi bi-envelope-at-fill"></i>
                    </div>
                    {message && <p className="message">{message}</p>}
                    {error && <p className="message">{error}</p>}
                    <div className="btn">
                        <button type="submit">Send Reset Link</button>
                        <p>
                            Remembered your password ?&nbsp;<Link to="/login">Login</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;