import React, { useState, useEffect } from 'react';
import './LoginSignup.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [course, setCourse] = useState('Select course');
    const [branch, setBranch] = useState('Select branch');
    const [semester, setSemester] = useState('Select semester');
    const navigate = useNavigate();
    const BaseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/'); 
        }
    }, [navigate]);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const requestData = {
                username,
                email,
                password,
                course,
                branch,
                semester,
            };

            const response = await axios.post(`${BaseUrl}/signup`, requestData);

            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Signup error:', error);
            if (error.response && error.response.data) {
                setError(error.response.data.message || 'Signup failed. Please try again.');
            } else {
                setError('Signup failed. Please try again.');
            }
        }
    };

    const availableSemesters = course === 'Diploma'
        ? [1, 2, 3, 4, 5, 6]
        : [1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <div className="SignUP">
            <div className="Signup">
                <div className="heading">
                    <p>Sign Up</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="text-box">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <div className="text-box">
                        <input
                            type="email"
                            placeholder="Email"
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <i
                            className={passwordVisible ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}
                            onClick={togglePasswordVisibility}
                        ></i>
                    </div>
                    <div className="text-box">
                        <input
                            type={confirmPasswordVisible ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <i
                            className={confirmPasswordVisible ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}
                            onClick={toggleConfirmPasswordVisibility}
                        ></i>
                    </div>
                    <div className="select-box">
                        <select
                            name="course"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                        >
                            <option value="Select course">Select course</option>
                            <option value="Diploma">Diploma</option>
                            <option value="BE">Bachelor of Engineering</option>
                        </select>
                        <i className="bi bi-caret-down-fill"></i>
                    </div>
                    <div className="select-box">
                        <select
                            name="branch"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                        >
                            <option value="Select branch">Select branch</option>
                            <option value="CSE">Computer Science Engineering</option>
                            <option value="ECE">Electrical Engineering</option>
                            <option value="ME">Mechanical Engineering</option>
                            <option value="CE">Civil Engineering</option>
                        </select>
                        <i className="bi bi-caret-down-fill"></i>
                    </div>
                    <div className="select-box">
                        <select
                            name="semester"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                        >
                            <option value="Select semester">Select semester</option>
                            {availableSemesters.map((sem) => (
                                <option key={sem} value={sem}>
                                    {sem} Semester
                                </option>
                            ))}
                        </select>
                        <i className="bi bi-caret-down-fill"></i>
                    </div>
                    {message && <p className="message">{message}</p>}
                    {error && <p className="message">{error}</p>}
                    <div className="btn">
                        <button type="submit">Sign Up</button>
                        <p>
                            Already have an account?
                            <Link to="/login">&nbsp;Login</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;