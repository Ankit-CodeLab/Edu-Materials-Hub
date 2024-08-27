import React from "react";
import './AboutUs.css';
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

const AboutUs = () => {

    return (

        <>

            <Navbar />
            <div className="AboutUs">

                <h2>Our Mission</h2>
                <p>At EduMaterialsHub, our mission is to empower students, educators, and lifelong learners by providing easy access to high-quality educational resources and materials. We are committed to fostering a thriving community of learners who are equipped with the tools they need to succeed academically and professionally.</p>

                <h2>Who We Are</h2>
                <p>EduMaterialsHub was founded with a simple goal in mind: to bridge the gap between students and the educational resources they need. Our team is passionate about education and dedicated to creating a platform that supports diverse learning needs. With a user-friendly interface and a vast repository of materials, we strive to make learning accessible and enjoyable for everyone.</p>

                <h2>Our Values</h2>
                <div>
                    <p><b> Accessibility:&nbsp;</b>We believe that education should be accessible to everyone, regardless of their location or background.</p>
                    <p><b>Quality:&nbsp;</b>We are committed to providing high-quality materials and resources that meet the highest standards.</p>
                    <p><b>Innovation:&nbsp;</b>We continuously strive to innovate and improve our platform to better serve our users.</p>
                    <p><b>Community:&nbsp;</b>We value the feedback and contributions of our community and work to create a supportive and inclusive environment.</p>
                </div>

                <h2>Contact Us</h2>
                <p>Have questions or feedback? We'd love to hear from you! Reach out to us at [<a href="mailto:ankitkushwaha.dce22@sltiet.edu.in">ankitkushwaha.dce22@sltiet.edu.in</a>] for more information.</p>
            </div>
            <Footer />

        </>

    )

}

export default AboutUs;