import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './Account.css';
import axios from 'axios';
import defaultProfilePic from '../Assets/profile_pic.svg';

const Account = () => {
    const [user, setUser] = useState({ name: '', course: '', branch: '', semester: '', profilePic: '', role: '' });
    const [profilePicPreview, setProfilePicPreview] = useState(defaultProfilePic);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isAddResources, setAddResources] = useState(false);
    const [isAddMaterial, setAddMaterial] = useState(false);
    const [pdfUploadMessage, setPdfUploadMessage] = useState('');
    const [materialUploadMessage, setMaterialUploadMessage] = useState('');
    const [formData, setFormData] = useState({
        course: '',
        branch: '',
        semester: '',
        subject_name: '',
        pdfFile: null,
    });
    const [materialData, setMaterialData] = useState({
        title: '',
        description: '',
        materialFile: null,
    });
    const navigate = useNavigate();
    const BaseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get(`${BaseUrl}/user`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.data.profilepic) {
                        setProfilePicPreview(`${BaseUrl}/uploads/${response.data.profilepic}`);
                    } else {
                        setProfilePicPreview(defaultProfilePic);
                    }
                    setUser(response.data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, []);

    const handleUserChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMaterialFormChange = (e) => {
        setMaterialData({ ...materialData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (e.target.name === 'profilePic') {
            setUser({ ...user, profilePic: file });
            setProfilePicPreview(URL.createObjectURL(file));
        } else if (e.target.name === 'pdfFile') {
            setFormData({ ...formData, pdfFile: file });
        } else {
            setMaterialData({ ...materialData, materialFile: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const data = new FormData();

        data.append('name', user.name);
        data.append('course', user.course);
        data.append('branch', user.branch);
        data.append('semester', user.semester);

        if (user.profilePic) {
            data.append('profilePic', user.profilePic);
        }

        try {
            const response = await axios.put(`${BaseUrl}/update-profile`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Profile updated successfully');
            setSuccessMessage(response.data.message);
        } catch (error) {
            setError('Error updating profile');
        }
        setIsEditing(!isEditing);
    };

    const handlePdfUpload = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('course', formData.course);
        data.append('branch', formData.branch);
        data.append('semester', formData.semester);
        data.append('subject_name', formData.subject_name);
        data.append('pdfFile', formData.pdfFile);

        try {
            const response = await axios.post('http://localhost:5000/upload-pdf', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setPdfUploadMessage('PDF uploaded successfully');
        } catch (error) {
            setPdfUploadMessage('Failed to upload PDF');
        }
        setAddResources(!isAddResources);
    };


    const handleMaterialUpload = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', materialData.title);
        data.append('description', materialData.description);
        data.append('materialFile', materialData.materialFile);
        data.append('username', user.name);

        try {
            const response = await axios.post('http://localhost:5000/upload-material', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMaterialUploadMessage('Material uploaded successfully');
        } catch (error) {
            setMaterialUploadMessage('Failed to upload material');
        }
        setAddMaterial(!isAddMaterial);
    };

    const availableSemesters = user.course === 'Diploma'
        ? [1, 2, 3, 4, 5, 6]
        : [1, 2, 3, 4, 5, 6, 7, 8];


    useEffect(() => {
        if (message || error || successMessage || pdfUploadMessage || materialUploadMessage) {
            const timer = setTimeout(() => {
                setMessage('');
                setError('');
                setSuccessMessage('');
                setPdfUploadMessage('');
                setMaterialUploadMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, error, successMessage, pdfUploadMessage, materialUploadMessage]);

    return (
        <>
            <Navbar />
            <div className="User-Account">
                <div className="Profile">
                    <img src={profilePicPreview} alt="Profile Preview" width="100" />
                    <p>{user.name}</p>
                </div>

                <div className="user-info">
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <p>Course: {user.course ? user.course : 'Select Course'}</p>
                    <p>Branch: {user.branch ? user.branch : 'Select Branch'}</p>
                    <p>Semester: {user.semester ? user.semester : 'Select Semester'}</p>
                </div>

                <div className="Account-btns">
                    <button id="edit-profile-btn" onClick={() => setIsEditing(!isEditing)}>Edit Profile</button>
                    <a href="/" onClick={() => {
                        localStorage.removeItem('token');
                        setUser(null);
                        navigate('/', { state: { message: 'Logged out successfully' } });
                    }}>Logout</a>
                </div>

                {user.role === 'admin' && (
                    <div className="btns">
                        <button id="edit-profile-btn" onClick={() => setAddResources(!isAddResources)}>Add Resources</button>
                        <button id="add-material-btn" onClick={() => setAddMaterial(!isAddMaterial)}>Upload Material</button>
                    </div>
                )}

            </div>

            {user.role === 'admin' && (

                <div className={`AddResources ${isAddResources ? 'show' : ''}`}>
                    <form onSubmit={handlePdfUpload} encType="multipart/form-data">
                        <h2>Edit Profile</h2>
                        <hr />
                        <label>Course:</label>
                        <select name="course" value={formData.course} onChange={handleFormChange} required>
                            <option value="">Select course</option>
                            <option value="Diploma">Diploma</option>
                            <option value="BE">Bachelor of Engineering</option>
                        </select>

                        <label>Branch:</label>
                        <select name="branch" value={formData.branch} onChange={handleFormChange} required>
                            <option value="">Select branch</option>
                            <option value="CSE">Computer Science Engineering</option>
                            <option value="ECE">Electrical Engineering</option>
                            <option value="ME">Mechanical Engineering</option>
                            <option value="CE">Civil Engineering</option>
                        </select>

                        <label>Semester:</label>
                        <select name="semester" value={formData.semester} onChange={handleFormChange} required>
                            <option value="">Select semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
                        </select>

                        <label>Subject Name:</label>
                        <input
                            type="text"
                            name="subject_name"
                            value={formData.subject_name}
                            onChange={handleFormChange}
                            required
                        />

                        <label>PDF File:</label>
                        <input
                            type="file"
                            name="pdfFile"
                            accept=".pdf"
                            onChange={handleFileChange}
                            required
                        />

                        <button type="submit">Upload PDF</button>
                        <span><a onClick={() => setAddResources(!isAddResources)}>Cancel</a></span>
                    </form>

                    <p>{pdfUploadMessage}</p>

                </div>
            )}

            {(user.role === 'admin' || user.role === 'contributor') && (
                <div className={`AddMaterial ${isAddMaterial ? 'show' : ''}`}>
                    <form onSubmit={handleMaterialUpload} encType="multipart/form-data">
                        <h2>Upload Material</h2>
                        <hr />
                        <label>Title:</label>
                        <input
                            type="text"
                            name="title"
                            value={materialData.title}
                            onChange={handleMaterialFormChange}
                            required
                        />

                        <label>Description:</label>
                        <textarea
                            name="description"
                            maxLength="700"
                            value={materialData.description}
                            onChange={handleMaterialFormChange}
                            required
                        />

                        <label>Material File:</label>
                        <input
                            type="file"
                            name="materialFile"
                            accept=".pdf"
                            onChange={handleFileChange}
                            required
                        />

                        <button type="submit">Upload Material</button>
                        <span><a onClick={() => setAddMaterial(!isAddMaterial)}>Cancel</a></span>
                        {materialUploadMessage && <p>{materialUploadMessage}</p>}
                    </form>
                </div>
            )}

            <div className={`Edit_profile ${isEditing ? 'show' : ''}`}>
                <form onSubmit={handleSubmit}>
                    <h2>Edit Profile</h2>
                    <hr />

                    <label>Username:</label>
                    <input
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleUserChange}
                    />

                    <label>Course:</label>
                    <select name="course" value={user.course} onChange={handleUserChange}>
                        <option value="Select course">Select course</option>
                        <option value="Diploma">Diploma</option>
                        <option value="BE">Bachelor of Engineering</option>
                    </select>

                    <label>Branch:</label>
                    <select name="branch" value={user.branch} onChange={handleUserChange}>
                        <option value="Select branch">Select branch</option>
                        <option value="CSE">Computer Science Engineering</option>
                        <option value="ECE">Electrical Engineering</option>
                        <option value="ME">Mechanical Engineering</option>
                        <option value="CE">Civil Engineering</option>
                    </select>

                    <label>Semester:</label>
                    <select name="semester" value={user.semester} onChange={handleUserChange}>
                        <option value="Select semester">Select semester</option>
                        {availableSemesters.map((sem) => (
                            <option key={sem} value={sem}>
                                {sem} Semester
                            </option>
                        ))}
                    </select>

                    <label>Profile Picture:</label>
                    <input
                        type="file"
                        name="profilePic"
                        onChange={handleFileChange}
                    />

                    <button type="submit">Save Changes</button>
                    <span><a onClick={() => setIsEditing(!isEditing)}>Cancel</a></span>
                </form>

            </div>

            <div className="messages">
                {message && <div className='message'>{message}</div>}
                {error && <div className='message'>{error}</div>}
                {pdfUploadMessage && <div className='message'>{pdfUploadMessage}</div>}
                {materialUploadMessage && <div className='message'>{materialUploadMessage}</div>}
            </div>

            <Footer />
        </>
    );
};

export default Account;