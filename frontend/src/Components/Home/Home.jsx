import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './Home.css';
import Logo from '../Assets/Logo.png';
import defaultProfilePic from '../Assets/profile_pic.svg';
import axios from 'axios';

const Home = () => {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [message, setMessage] = useState(location.state?.message || '');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [comments, setComments] = useState([]);
    const BaseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get(`${BaseUrl}/user`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUser(null);
                }
            }
        };

        fetchUser();

        const fetchComments = async () => {
            try {
                const response = await axios.get(`${BaseUrl}/comments`);
                const latestComments = response.data.slice(0, 5);
                setComments(latestComments);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();

    }, []);

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        if (!user) {
            setError('You must be logged in to post a comment.');
            return;
        }
        try {
            const response = await axios.post(`${BaseUrl}/post-comment`, {
                comment: commentText
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setSuccessMessage('Comment posted successfully!');
            setError('');
            setCommentText('');
            window.location.reload();
        } catch (error) {
            console.error('Error posting comment:', error);
            setError('Failed to post comment.');
            setSuccessMessage('');
        }
    };

    useEffect(() => {
        if (message || error || successMessage) {
            const timer = setTimeout(() => {
                setMessage('');
                setError('');
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, error, successMessage]);

    return (
        <>
            <Navbar />
            <div className="Home">

                <div className="Head">

                    <img src={Logo} alt="" />
                    <p>Education Materials Hub</p>
                    <p>Connecting Students with Essential Resources</p>

                </div>

                <div className="Intro">

                    <p>
                        Welcome to EduMaterialsHub, your ultimate destination for educational resources and materials. At EduMaterialsHub, we are dedicated to connecting students, educators, and lifelong learners with the tools they need to excel in their academic and professional pursuits. Our platform offers a comprehensive selection of courses, study materials, and resources designed to support and enhance your learning experience. Whether you're seeking in-depth knowledge in a specific field or looking to explore new subjects, EduMaterialsHub provides easy access to a wealth of high-quality educational content. Join us today and take the next step towards achieving your educational goals with confidence and ease.
                    </p>

                </div>

                <div className="HowItWorks">

                    <p className="Head">How It Works</p>

                    <div className="Steps">

                        <div className="Step">
                            <h3>Step - 1: Register</h3>
                            <p>Create an account to get access to all our resources.</p>
                        </div>
                        <div className="Step">
                            <h3>Step - 2: Explore Courses</h3>
                            <p>Browse and select the courses that suit your needs.</p>
                        </div>
                        <div className="Step">
                            <h3>Step - 3: Start Learning</h3>
                            <p>Access course materials and start your learning journey.</p>
                        </div>

                        <div className="CTA">
                            <p>Ready to enhance your learning?</p>
                            <Link to="/Signup" className="cta-button">Get Started&nbsp;<p>➞</p></Link>
                        </div>

                    </div>

                </div>

                <div className="Courses">

                    <p className="Head">Courses</p>

                    <div className="Courses-list">

                        <div className="Course">

                            <p>Bachelor of Technology</p>

                        </div>

                        <div className="Course">

                            <p>Bachelor of Technology</p>

                        </div>

                        <div className="Course">

                            <p>Bachelor of Technology</p>

                        </div>

                    </div>

                </div>

                <div className="Reviews">

                    <p className="Head">What Our Users Say</p>

                    {comments.length === 0 ? (

                        <p>No comments yet.</p>

                    ) : (

                        <div className="Review">

                            {comments.map((comment, index) => (

                                <div className="user-reviews" key={index}>

                                    <div className="user">

                                        <img
                                            src={comment.profilepic ? `${BaseUrl}/profilePics/${comment.profilepic}` : defaultProfilePic}
                                            alt="Profile Preview"
                                            width="100"
                                        />
                                        <p>{comment.name}</p>
                                    </div>
                                    <hr />
                                    <div className="content">

                                        <p>{comment.commentText}</p>

                                    </div>

                                </div>

                            ))}

                        </div>
                    )}

                    <div className="V-Reveiw">
                        <Link to="/Reviews">View more&nbsp;<p>➞</p></Link>
                    </div>

                    <div className="Review-input">

                        <form onSubmit={handleCommentSubmit}>
                            <p><i className="bi bi-pencil-square"></i> Write your comment</p>
                            <textarea
                                name="commentText"
                                maxLength="700"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            {user ? (
                                <>
                                    <input type="submit" value="Post" />
                                </>
                            ) : (
                                <Link to="/login">Post</Link>
                            )}
                        </form>

                    </div>

                </div>

            </div>
            <div className="messages">
                {message && <div className='message'>{message}</div>}
                {error && <div className='message'>{error}</div>}
                {successMessage && <div className='message'>{successMessage}</div>}
            </div>
            <Footer />
        </>
    );
};

export default Home;