import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            axios.get(`${process.env.REACT_APP_BASE_URL}/verify-email?token=${token}`)
                .then(response => {
                    setMessage(response.data);
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000); 
                })
                .catch(error => {
                    setMessage('Error verifying email: ' + (error.response?.data?.message || error.message));
                });
        } else {
            setMessage('Invalid token.');
        }
    }, [location, navigate]);

    return (
        <div>
            <h2>Email Verification</h2>
            <p>{message}</p>
        </div>
    );
};

export default VerifyEmail;