import React, { useState } from 'react';
import './LoginSignup.css';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const token = new URLSearchParams(location.search).get('token');
    const BaseUrl = process.env.REACT_APP_BASE_URL;

    const toggleNewPasswordVisibility = () => {
        setNewPasswordVisible(!newPasswordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post(`${BaseUrl}/reset-password`, { token, newPassword });
            setMessage(response.data.message);
            setError('');
            navigate('/login', { state: { message: 'Password reset successfully' } });
        } catch (error) {
            console.error(error);
            setError('Error resetting password. Please try again.');
            setMessage('');
        }
    };

    return (
        <div className="Login">
            <div className="login-box">
                <div className="heading">
                    <p>Reset Password</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="text-box">
                        <input
                            type={newPasswordVisible ? "text" : "password"}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <i
                            className={newPasswordVisible ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}
                            onClick={toggleNewPasswordVisibility}
                        ></i>
                    </div>
                    <div className="text-box">
                        <input
                            type={confirmPasswordVisible ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <i
                            className={confirmPasswordVisible ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}
                            onClick={toggleConfirmPasswordVisibility}
                        ></i>
                    </div>
                    {message && <p className="message">{message}</p>}
                    {error && <p className="message">{error}</p>}
                    <div className="btn">
                        <button type="submit">Submit</button>
                        <Link to="/login" className="FP-Cancel">Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
