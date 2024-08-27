import React, { useState, useEffect } from 'react';
import './LoginSignup.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showResend, setShowResend] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const BaseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');  
        }
    }, [navigate]);

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${BaseUrl}/login`, {
                email,
                password,
            });
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                setMessage('Logged in successfully');
                setError('');
                navigate('/', { state: { message: 'Logged in successfully' } });
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data.message === 'Please verify your email before logging in') {
                setShowResend(true);
                setError('');
                setMessage('');
            } else {
                setShowResend(false);
                setError('Login failed. Please check your credentials and try again.');
                setMessage('');
            }
        }
    };

    const handleResend = async () => {
        try {
            const response = await axios.post(`${BaseUrl}/resend-verification`, { email });
            setMessage(response.data.message);
            setShowResend(false);
        } catch (error) {
            console.error(error);
            setError('Failed to resend verification email. Please try again later.');
        }
    };

    return (
        <div className="Login">
            <div className="login-box">
                <div className="heading">
                    <p>Login</p>
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
                    <div className="text-box">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <i
                            className={passwordVisible ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}
                            onClick={togglePasswordVisibility}
                        ></i>
                    </div>
                    {showResend && (
                        <div className="resend-email">
                            <p>Account not verified?</p>
                            <button type="button" onClick={handleResend}>
                                Resend Verification Email
                            </button>
                        </div>
                    )}
                    {message && <p className="message">{message}</p>}
                    {error && <p className="message">{error}</p>}
                    <div className="forgotpassword">
                        <Link to="/ForgotPassword">Forgot Password</Link>
                    </div>
                    <div className="btn">
                        <button type="submit" id="btn">Login</button>
                        <p>
                            Don't have an account? <Link to="/signup" id="btn">&nbsp;Register Here</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;