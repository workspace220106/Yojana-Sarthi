import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Lock, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, FileText, CreditCard } from 'lucide-react';
import emblem from '../assets/images/emblem.png';
import './LoginPage.css';

const LoginPage = () => {
  const [role, setRole] = useState('citizen'); // 'citizen' or 'admin'
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        
        // Local simulation for registration
        const savedUsersRaw = localStorage.getItem('yojana_sarthi_mock_users') || '[]';
        const mockUsers = JSON.parse(savedUsersRaw);
        
        if (mockUsers.some(u => u.email === email && u.role === role)) {
          throw new Error("User with this email is already registered for this portal.");
        }
        
        const newUser = {
          uid: 'mock-' + Math.random().toString(36).substr(2, 9),
          fullName: fullName || (role === 'citizen' ? 'Citizen' : 'Administrator'),
          email,
          password,
          role,
          createdAt: new Date().toISOString()
        };
        
        mockUsers.push(newUser);
        localStorage.setItem('yojana_sarthi_mock_users', JSON.stringify(mockUsers));
        
        // Save current active user profile
        localStorage.setItem('yojana_sarthi_current_user', JSON.stringify(newUser));

        if (role === 'citizen') {
          const defaultProfile = {
            fullName: fullName || 'Citizen',
            aadhaar: '',
            phone: '',
            address: '',
            age: '',
            income: '',
            occupation: 'All',
            category: 'All',
            gender: 'All'
          };
          localStorage.setItem('yojana_sarthi_profile', JSON.stringify(defaultProfile));
        }
      } else {
        // Sign In simulation
        const savedUsersRaw = localStorage.getItem('yojana_sarthi_mock_users') || '[]';
        const mockUsers = JSON.parse(savedUsersRaw);
        
        let user = mockUsers.find(u => u.email === email && u.password === password && u.role === role);
        
        // Auto-create account during sign-in to prevent any user lockouts
        if (!user) {
          user = {
            uid: 'mock-' + Math.random().toString(36).substr(2, 9),
            fullName: role === 'citizen' ? 'Citizen' : 'Administrator',
            email,
            password,
            role,
            createdAt: new Date().toISOString()
          };
          mockUsers.push(user);
          localStorage.setItem('yojana_sarthi_mock_users', JSON.stringify(mockUsers));
        }

        localStorage.setItem('yojana_sarthi_current_user', JSON.stringify(user));

        if (role === 'citizen') {
          const savedProfile = localStorage.getItem('yojana_sarthi_profile');
          let currentProfile = savedProfile ? JSON.parse(savedProfile) : {};
          currentProfile.fullName = user.fullName || currentProfile.fullName || 'Citizen';
          localStorage.setItem('yojana_sarthi_profile', JSON.stringify(currentProfile));
        }
      }

      // Successful login/registration simulation, proceed to portal
      navigate('/landing');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Branding Side */}
        <div className="branding-side">
          <div className="branding-content">
            <div className="branding-top">
              <div className="branding-logo">
                <div className="emblem-wrapper">
                  <img src={emblem} alt="Yojana Sarthi Emblem" className="mini-emblem" />
                </div>
                <div className="branding-text">
                  <h1>Yojana Sarthi</h1>
                  <span className="branding-badge">Official Portal</span>
                </div>
              </div>

              <p className="branding-tagline">
                Connecting every citizen with state and central welfare schemes. Secure, transparent, and instant eligibility matching.
              </p>
            </div>

            <div className="branding-features">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <ShieldCheck size={20} />
                </div>
                <div className="feature-text">
                  <h4>Aadhaar & DigiLocker Integration</h4>
                  <p>Secure instant document verification for fast scheme approvals.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <FileText size={20} />
                </div>
                <div className="feature-text">
                  <h4>Instant Eligibility Matcher</h4>
                  <p>Calculates your category, age, and income eligibility rules automatically.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <CreditCard size={20} />
                </div>
                <div className="feature-text">
                  <h4>Direct Benefit Tracker</h4>
                  <p>Monitor DBT payments, application progress, and subsidy disbursements.</p>
                </div>
              </div>
            </div>

            <div className="trust-footer">
              <CheckCircle2 size={16} />
              <span>End-to-End Encryption • Government Standards Compliant</span>
            </div>
          </div>
        </div>

        {/* Right Auth Side */}
        <div className="auth-side">
          <div className="auth-card">
            <div className="role-selector">
              <button 
                type="button"
                className={`role-btn ${role === 'citizen' ? 'active' : ''}`}
                onClick={() => { setRole('citizen'); setError(''); }}
              >
                <UserCheck size={16} />
                <span>Citizen Portal</span>
              </button>
              <button 
                type="button"
                className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => { setRole('admin'); setError(''); }}
              >
                <Lock size={16} />
                <span>Administrator</span>
              </button>
            </div>

            <div className="auth-header">
              <h2>{mode === 'login' ? 'Sign In to Yojana Sarthi' : 'Create Portal Account'}</h2>
              <p>
                {mode === 'login' 
                  ? `Access your secure ${role} account` 
                  : `Register as a ${role} to configure credentials`}
              </p>
            </div>

            {error && (
              <div className="auth-error-block">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
              )}
              
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              {mode === 'signup' && (
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" defaultChecked /> Remember session
                  </label>
                  <a href="#reset" className="forgot-password">Forgot password?</a>
                </div>
              )}

              <button type="submit" className="submit-btn primary-btn" disabled={loading}>
                <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Continue to Dashboard' : 'Complete Registration'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mode-switch">
              {mode === 'login' ? (
                <>
                  New to Yojana Sarthi? 
                  <button type="button" onClick={() => { setMode('signup'); setError(''); }}>Register Now</button>
                </>
              ) : (
                <>
                  Already registered? 
                  <button type="button" onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
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
