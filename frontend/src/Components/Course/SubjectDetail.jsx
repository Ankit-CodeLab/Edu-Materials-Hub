import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

const SubjectDetail = () => {
    const { subjectName } = useParams();
    const [pdfs, setPdfs] = useState([]);
    const [error, setError] = useState('');
    const BaseUrl = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const fetchPdfs = async () => {
            try {
                const response = await axios.get(`${BaseUrl}/pdfs`, {
                    params: { subjectName }
                });
                setPdfs(response.data);
            } catch (error) {
                console.error('Error fetching PDFs:', error);
                setError('Failed to fetch PDFs');
            }
        };

        fetchPdfs();
    }, [subjectName]);

    return (
        <>
            <Navbar />
            <div className='SubjectPDFs'>
                {error && <p>{error}</p>}
                <div>
                    {pdfs.length > 0 ? (
                        pdfs.map((pdf, index) => (
                            <div key={index}>
                                <h1>PDF - {index + 1}</h1>
                                <iframe
                                    src={`${BaseUrl}/pdfs/${pdf.pdf_url}`}
                                    width="100%"
                                    height="600px"
                                    title={subjectName}
                                    style={{ border: 'none', marginBottom: '20px' }}
                                />
                            </div>
                        ))
                    ) : (
                        <p>No PDFs available for this subject.</p>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default SubjectDetail;