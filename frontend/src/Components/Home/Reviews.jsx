import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './Home.css';
import defaultProfilePic from '../Assets/profile_pic.svg';
import axios from 'axios';

const Reviews = () => {
    const location = useLocation();
    const message = location.state?.message || '';
    const [profilePicPreview, setProfilePicPreview] = useState(defaultProfilePic);
    const [user, setUser] = useState(null);
    const [commentText, setCommentText] = useState('');
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
                setComments(response.data);
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

    return (
        <>
            <Navbar />
            <div className="Home">

                <div className="Reviews" style={{ padding: "0 20px" }}>

                    <p className="Head" style={{ padding: "0 0 20px 0" }}>Reviews</p>

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

                </div>

            </div>
            {message && <div className='message'>{message}</div>}
            {error && <div className='message'>{error}</div>}
            {successMessage && <div className='message'>{successMessage}</div>}
            <Footer />
        </>
    );
};

export default Reviews;