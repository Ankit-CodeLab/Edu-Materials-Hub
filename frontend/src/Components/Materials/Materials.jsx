import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './Materials.css';

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const BaseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const response = await axios.get(`${BaseUrl}/materials`);
                setMaterials(response.data);
            } catch (error) {
                console.error('Error fetching materials:', error);
                setError('Failed to fetch materials');
            }
        };

        fetchMaterials();
    }, []);

    const handleMaterialClick = (materialId) => {
        navigate(`/material/${materialId}`);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredMaterials = materials.filter(material =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Navbar />
            <div className="Materials">
                <p className="head">Materials</p>
                {error && <p>{error}</p>}
                <div className="search-material">
                    <input
                        type="text"
                        name="search"
                        id="search"
                        placeholder="Search by title, description, or username"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                {filteredMaterials.map((material) => (
                    <div key={material.id} className="Material" onClick={() => handleMaterialClick(material.id)}>
                        <p className="title">{material.title}</p>
                        <p className="desc">{material.description}</p>
                        <p className="username">Uploaded by: {material.username}</p>
                    </div>
                ))}
            </div>
            <Footer />
        </>
    );
};

export default Materials;
