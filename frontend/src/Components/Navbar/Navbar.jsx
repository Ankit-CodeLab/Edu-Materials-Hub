import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import defaultProfilePic from '../Assets/profile_pic_white.svg';
import axios from 'axios';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(defaultProfilePic);
  const [isNavbar, setNavbar] = useState(false);
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
          if (response.data.profilepic) {
            setProfilePic(`${BaseUrl}/uploads/${response.data.profilepic}`);
          } else {
            setProfilePic(defaultProfilePic);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setProfilePic(defaultProfilePic);
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <nav>
      <i onClick={() => setNavbar(!isNavbar)} className="bi bi-list"></i>
      <div className={`nav-left ${isNavbar ? 'show' : ''}`}>
        <NavLink to="/">Edu Materials Hub</NavLink>
        <hr />
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Home
        </NavLink>
        {user ? (
          <NavLink
            to="/Course"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Course & Resources
          </NavLink>
        ) : null}
        <NavLink
          to="/Materials"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Materials
        </NavLink>
        <NavLink
          to="/AboutUs"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          About Us
        </NavLink>
      </div>

      <div className="nav-right">
        {user ? (
          <NavLink to="/Account" className="Account">
            <p>{user.name}</p>
            <img src={profilePic} alt="Profile Preview" width="100" />
          </NavLink>
        ) : (
          <NavLink to="/login" onClick={() => {
            localStorage.removeItem('token');
          }}>Login</NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;