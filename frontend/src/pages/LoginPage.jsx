import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCheck, Lock, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, FileText, CreditCard } from 'lucide-react';
import emblem from '../assets/images/emblem.png';
import './LoginPage.css';
import { supabase } from '../supabase';

const LoginPage = () => {
  const [role, setRole] = useState('citizen'); // 'citizen' or 'admin'
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [residentialState, setResidentialState] = useState('Maharashtra');
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
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        if (!mobileNumber.match(/^\d{10}$/)) {
          throw new Error("Mobile number must be a valid 10-digit number");
        }
        
        // 1. Create account in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
        });
        if (authError) throw authError;
        const user = authData.user;
        
        if (role === 'citizen' && user) {
          const defaultProfile = {
            id: user.id,
            full_name: fullName || 'Citizen',
            aadhaar: '',
            phone: mobileNumber,
            state: residentialState,
            address: '',
            age: null,
            income: null,
            occupation: 'All',
            category: 'All',
            gender: 'All',
            verification_status: 'Unverified',
            data_sources: ['User Input'],
            documents: []
          };
          
          // 2. Save profile structure to Supabase citizens table
          const { error: dbError } = await supabase.from('citizens').upsert(defaultProfile);
          if (dbError) throw dbError;
        }

        alert('Account created successfully! Please sign in using your new credentials to link your DigiLocker.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } else {
        // 1. Sign In using Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (authError) throw authError;
        const user = authData.user;
        
        const userData = {
          uid: user.id,
          fullName: role === 'citizen' ? 'Citizen' : 'Administrator',
          email,
          role,
          createdAt: new Date().toISOString()
        };

        localStorage.setItem('yojana_sarthi_current_user', JSON.stringify(userData));

        if (role === 'citizen') {
          // 2. Fetch profile from Supabase
          const { data: profileData, error: dbError } = await supabase
            .from('citizens')
            .select('*')
            .eq('id', user.id)
            .single();
          
          let currentProfile = {};
          if (profileData && !dbError) {
            currentProfile = {
              fullName: profileData.full_name || 'Citizen',
              aadhaar: profileData.aadhaar || '',
              phone: profileData.phone || '',
              state: profileData.state || 'Maharashtra',
              address: profileData.address || '',
              age: profileData.age ? String(profileData.age) : '',
              income: profileData.income ? String(profileData.income) : '',
              occupation: profileData.occupation || 'All',
              category: profileData.category || 'All',
              gender: profileData.gender || 'All',
              verification_status: profileData.verification_status || 'Unverified',
              data_sources: profileData.data_sources || ['User Input'],
              documents: profileData.documents || []
            };
          } else {
            // Fallback profile if document doesn't exist yet
            currentProfile = {
              fullName: user.email.split('@')[0],
              aadhaar: '',
              phone: '',
              state: 'Maharashtra',
              address: '',
              age: '',
              income: '',
              occupation: 'All',
              category: 'All',
              gender: 'All',
              verification_status: 'Unverified',
              data_sources: ['User Input'],
              documents: []
            };
            await supabase.from('citizens').upsert({
              id: user.id,
              full_name: currentProfile.fullName,
              state: currentProfile.state,
              verification_status: currentProfile.verification_status,
              data_sources: currentProfile.data_sources,
              documents: currentProfile.documents
            });
          }
          
          localStorage.setItem('yojana_sarthi_profile', JSON.stringify(currentProfile));
          
          // Sync documents vault
          localStorage.setItem('yojana_sarthi_docs', JSON.stringify(currentProfile.documents || []));

          // Dispatch custom profileUpdate event
          window.dispatchEvent(new Event('profileUpdate'));

          // 3. Immediately launch Cashfree DigiLocker redirect flow as part of login
          try {
            const res = await fetch('/api/verification/digilocker/url', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                redirect_url: window.location.origin + '/profile'
              })
            });

            if (!res.ok) throw new Error('API server returned error');
            const data = await res.json();

            if (data.url) {
              localStorage.setItem('yojana_sarthi_cf_ver_id', data.verification_id);
              // Redirect browser to Cashfree SecureID DigiLocker Gateway
              window.location.href = data.url;
              return;
            } else {
              throw new Error('Verification URL not generated');
            }
          } catch (cfErr) {
            console.error(cfErr);
            if (window.confirm('Login successful, but unable to initialize Cashfree DigiLocker Gateway. Would you like to proceed to your dashboard anyway and link it later?')) {
              navigate('/landing');
            }
            return;
          }
        } else {
          // For admin, go straight to landing
          navigate('/landing');
        }
      }
    } catch (err) {
      console.error(err);
      let errorMsg = err.message || 'Authentication failed.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMsg = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      }
      setError(errorMsg);
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
              <Link to="/" className="branding-logo-link" title="Back to Welcome Page">
                <div className="branding-logo">
                  <div className="emblem-wrapper">
                    <img src={emblem} alt="Yojana Sarthi Emblem" className="mini-emblem" />
                  </div>
                  <div className="branding-text">
                    <h1>Yojana Sarthi</h1>
                    <span className="branding-badge">Official Portal</span>
                  </div>
                </div>
              </Link>

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
                <label>Email Address (Gmail)</label>
                <input 
                  type="email" 
                  placeholder="name@gmail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              {mode === 'signup' && (
                <>
                  <div className="input-group">
                    <label>Mobile Number (10 digits)</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210" 
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required 
                    />
                  </div>

                  <div className="input-group">
                    <label>Residential State</label>
                    <select 
                      value={residentialState}
                      onChange={(e) => setResidentialState(e.target.value)}
                      required
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Other">Other State</option>
                    </select>
                  </div>
                </>
              )}

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
