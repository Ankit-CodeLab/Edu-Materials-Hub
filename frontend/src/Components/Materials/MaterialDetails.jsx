// src/Components/MaterialDetails.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

const MaterialDetails = () => {
    const { materialId } = useParams(); 
    const [material, setMaterial] = useState(null);
    const [error, setError] = useState('');
    const BaseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const response = await axios.get(`${BaseUrl}/material/${materialId}`);
                setMaterial(response.data);
            } catch (error) {
                console.error('Error fetching material:', error);
                setError('Failed to fetch material');
            }
        };

        fetchMaterial();
    }, [materialId]);

    if (error) return <p>{error}</p>;
    if (!material) return <p>Loading...</p>;

    return (
        <>
            <Navbar />
            <div className="MaterialDetails">
                <div>
                <h1>{material.title}</h1>
                <p>{material.description}</p>
                {material.file && (

                    <iframe
                        src={`${BaseUrl}/materials/${material.file}`}
                        width="100%"
                        height="600px"
                        title={material.title}
                        style={{ border: 'none', marginBottom: '20px' }}
                    />
                )}
                <p>Uploaded by: {material.username}</p>
                </div>
            </div>
            
            <Footer />
        </>
    );
};

export default MaterialDetails;
