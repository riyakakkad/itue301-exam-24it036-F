import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      login(data);
      navigate('/events');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (roleType) => {
    if (roleType === 'attendee') {
      setEmail('rahul@example.com');
      setPassword('password123');
    } else if (roleType === 'organizer') {
      setEmail('alice@eventhub.com');
      setPassword('password123');
    }
    setErrorMessage('');
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎟️</div>
          <h2>Welcome to EventHub</h2>
          <p className="login-subtitle">
            ITUE301 Advanced Web Development Frameworks - Practical Exam SET F
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to EventHub'}
          </button>
        </form>

        <div className="quick-fill-section">
          <p className="quick-fill-title">Exam Test Credentials (Click to Auto-fill):</p>
          <div className="quick-fill-buttons">
            <button
              type="button"
              className="btn-quick-fill"
              onClick={() => fillQuickCredentials('attendee')}
            >
              👤 Attendee: rahul@example.com
            </button>
            <button
              type="button"
              className="btn-quick-fill"
              onClick={() => fillQuickCredentials('organizer')}
            >
              🏢 Organizer: alice@eventhub.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
