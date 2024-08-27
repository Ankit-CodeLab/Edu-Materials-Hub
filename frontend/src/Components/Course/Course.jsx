import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './Course.css';

const Course = () => {
    const [subjects, setSubjects] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
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
            } else {
                navigate('/login');
            }
        };

        fetchUser();
    }, [navigate]);

    useEffect(() => {
        if (user) {
            const fetchSubjects = async () => {
                try {
                    const response = await axios.get(`${BaseUrl}/subjects`, {
                        params: {
                            course: user.course,
                            branch: user.branch,
                            semester: user.semester
                        }
                    });
                    setSubjects(response.data);
                } catch (error) {
                    console.error('Error fetching subjects:', error);
                    setError('Failed to fetch subjects');
                }
            };

            fetchSubjects();
        }
    }, [user]);

    const handleSubjectClick = (subjectName) => {
        navigate(`/Subject/${subjectName}`);
    };

    if (!user) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="Subjects">
                <h1>{user.course}</h1>
                {error && <p>{error}</p>}
                <ul>
                    {subjects.map((subject, index) => (
                        <li key={`${subject.id}-${index}`} onClick={() => handleSubjectClick(subject.subject_name)}>
                            {subject.subject_name}
                        </li>
                    ))}
                </ul>
            </div>
            <Footer />
        </>
    );
};

export default Course;
