import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import illustration from '../assets/images/login-illustration.png';
import emblem from '../assets/images/emblem.png';

const LoginPage = () => {
  const [role, setRole] = useState('citizen'); // 'citizen' or 'admin'
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login and redirect to landing
    navigate('/landing');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Branding Side */}
        <div className="branding-side">
          <div className="branding-content">
            <div className="branding-logo">
              <img src={emblem} alt="National Emblem" className="mini-emblem" />
              <h1>Yojana Sarthi</h1>
            </div>
            <p className="branding-tagline">
              Connecting you with the benefits you deserve. 
              Secure, Transparent, and Efficient.
            </p>
            <div className="illustration-container">
              <img src={illustration} alt="Portal Illustration" className="login-illustration" />
            </div>
          </div>
        </div>

        {/* Right Auth Side */}
        <div className="auth-side">
          <div className="auth-card">
            <div className="role-selector">
              <button 
                className={`role-btn ${role === 'citizen' ? 'active' : ''}`}
                onClick={() => setRole('citizen')}
              >
                Citizen
              </button>
              <button 
                className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                Administrator
              </button>
            </div>

            <div className="auth-header">
              <h2>{mode === 'login' ? 'Welcome Back' : 'Join Us'}</h2>
              <p>
                {mode === 'login' 
                  ? `Please login to your ${role} account` 
                  : `Register as a ${role} to get started`}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Enter your full name" required />
                </div>
              )}
              
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" placeholder="name@example.com" required />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" required />
              </div>

              {mode === 'signup' && (
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="••••••••" required />
                </div>
              )}

              {mode === 'login' && (
                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" /> Remember me
                  </label>
                  <a href="#reset" className="forgot-password">Forgot password?</a>
                </div>
              )}

              <button type="submit" className="submit-btn primary-btn">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mode-switch">
              {mode === 'login' ? (
                <>
                  Don't have an account? 
                  <button onClick={() => setMode('signup')}>Sign Up</button>
                </>
              ) : (
                <>
                  Already have an account? 
                  <button onClick={() => setMode('login')}>Sign In</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
