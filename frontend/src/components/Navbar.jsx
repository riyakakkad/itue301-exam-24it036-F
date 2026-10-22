import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { attendee, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/events" className="nav-brand">
          <span className="brand-icon">🎟️</span>
          <span className="brand-name">EventHub</span>
        </NavLink>

        {isAuthenticated ? (
          <div className="nav-links">
            <NavLink
              to="/events"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Events
            </NavLink>
            <NavLink
              to="/my-tickets"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              My Tickets
            </NavLink>
            <NavLink
              to="/organizer"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Organizer Panel
            </NavLink>

            <div className="nav-user-section">
              <span className={`role-badge role-${role}`}>{role}</span>
              <span className="user-name">{attendee?.name || 'User'}</span>
              <button onClick={handleLogout} className="btn-logout" title="Sign out">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Login
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
