import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserCheck, Lock, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, FileText, CreditCard, KeyRound } from 'lucide-react';
import emblem from '../assets/images/emblem.png';
import './LoginPage.css';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

  // New detailed profile state
  const [aadhaar, setAadhaar] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [income, setIncome] = useState('');
  const [occupation, setOccupation] = useState('Farmer / Agriculture');
  const [category, setCategory] = useState('General');

  // OTP Verification flow state
  const [verificationStep, setVerificationStep] = useState('signup'); // 'signup' or 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSimulatedOTP, setIsSimulatedOTP] = useState(false); // Default to live OTP flow for users
  const [otpError, setOtpError] = useState('');
  
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        }
      });
    }
  };

  const handleInitiateSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setOtpError('');
    
    // Validations
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    if (!mobileNumber.match(/^\d{10}$/)) {
      setError("Mobile number must be a valid 10-digit number");
      return;
    }
    if (aadhaar && !aadhaar.match(/^\d{12}$/)) {
      setError("Aadhaar number must be a 12-digit number");
      return;
    }
    if (age && (parseInt(age) <= 0 || parseInt(age) > 120)) {
      setError("Please enter a valid age");
      return;
    }
    if (income && parseInt(income) < 0) {
      setError("Please enter a valid annual income");
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = `+91${mobileNumber}`;
      
      if (isSimulatedOTP) {
        // Simulated Flow
        setVerificationStep('otp');
      } else {
        // Live Firebase Flow
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(confirmation);
        setVerificationStep('otp');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndCreateUser = async (e) => {
    e.preventDefault();
    setOtpError('');
    setLoading(true);

    try {
      let user;

      if (isSimulatedOTP) {
        if (otpCode !== '123456') {
          throw new Error("Invalid simulated OTP. Enter 123456.");
        }
        // 1. Create Email/Password user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      } else {
        // Live flow: verify OTP first (signs user in with phone number)
        const phoneCredential = await confirmationResult.confirm(otpCode);
        user = phoneCredential.user;

        // Link email and password
        const emailCred = EmailAuthProvider.credential(email, password);
        await linkWithCredential(user, emailCred);
      }

      if (role === 'citizen' && user) {
        const defaultProfile = {
          id: user.uid,
          full_name: fullName || 'Citizen',
          aadhaar: aadhaar || '',
          phone: mobileNumber,
          state: residentialState,
          address: '',
          age: age ? parseInt(age) : null,
          income: income ? parseInt(income) : null,
          occupation: occupation,
          category: category,
          gender: gender,
          verification_status: 'Unverified',
          data_sources: ['User Input'],
          documents: []
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'citizens', user.uid), defaultProfile, { merge: true });
        localStorage.setItem('yojana_sarthi_profile', JSON.stringify({
          fullName: defaultProfile.full_name,
          aadhaar: defaultProfile.aadhaar,
          phone: defaultProfile.phone,
          state: defaultProfile.state,
          address: defaultProfile.address,
          age: age,
          income: income,
          occupation: defaultProfile.occupation,
          category: defaultProfile.category,
          gender: defaultProfile.gender,
          verification_status: defaultProfile.verification_status,
          data_sources: defaultProfile.data_sources,
          documents: defaultProfile.documents
        }));
        
        // Sync documents
        localStorage.setItem('yojana_sarthi_docs', JSON.stringify([]));
      }

      const userData = {
        uid: user.uid,
        fullName: role === 'citizen' ? (fullName || 'Citizen') : 'Administrator',
        email,
        role,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('yojana_sarthi_current_user', JSON.stringify(userData));
      window.dispatchEvent(new Event('profileUpdate'));

      alert('Account created and verified successfully!');
      if (role === 'citizen') {
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
            window.location.href = data.url;
            return;
          }
        } catch (cfErr) {
          console.warn('DigiLocker gateway unavailable, proceeding without it:', cfErr.message);
        }
      }
      navigate(role === 'admin' ? '/admin' : '/landing');
    } catch (err) {
      console.error(err);
      let errMsg = err.message || 'OTP verification or registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/invalid-verification-code') {
        errMsg = 'Invalid verification code. Please check and try again.';
      }
      setOtpError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData = {
        uid: user.uid,
        fullName: role === 'citizen' ? 'Citizen' : 'Administrator',
        email,
        role,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('yojana_sarthi_current_user', JSON.stringify(userData));

      if (role === 'citizen') {
        const docRef = doc(db, 'citizens', user.uid);
        const docSnap = await getDoc(docRef);
        
        let currentProfile = {};
        if (docSnap.exists()) {
          const profileData = docSnap.data();
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
          await setDoc(doc(db, 'citizens', user.uid), {
            id: user.uid,
            full_name: currentProfile.fullName,
            state: currentProfile.state,
            verification_status: currentProfile.verification_status,
            data_sources: currentProfile.data_sources,
            documents: currentProfile.documents
          }, { merge: true });
        }
        
        localStorage.setItem('yojana_sarthi_profile', JSON.stringify(currentProfile));
        localStorage.setItem('yojana_sarthi_docs', JSON.stringify(currentProfile.documents || []));
        window.dispatchEvent(new Event('profileUpdate'));

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
            window.location.href = data.url;
            return;
          }
        } catch (cfErr) {
          console.warn('DigiLocker gateway unavailable, proceeding without it:', cfErr.message);
        }
        navigate('/landing');
      } else {
        navigate('/admin');
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
            {verificationStep === 'signup' && (
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
            )}

            <div className="auth-header">
              <h2>
                {verificationStep === 'otp'
                  ? 'Verify Your Mobile'
                  : mode === 'login'
                    ? 'Sign In to Yojana Sarthi'
                    : 'Create Portal Account'}
              </h2>
              <p>
                {verificationStep === 'otp'
                  ? `Enter the verification code sent to +91 ${mobileNumber}`
                  : mode === 'login'
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

            {verificationStep === 'otp' ? (
              <div className="otp-verification-section">
                <div className="otp-icon-wrapper">
                  <KeyRound size={32} className="otp-icon" />
                </div>
                
                {isSimulatedOTP && (
                  <div className="simulated-otp-info">
                    <ShieldCheck size={18} />
                    <span>Developer Mode: Use code <strong>123456</strong></span>
                  </div>
                )}

                {otpError && (
                  <div className="auth-error-block" style={{ marginTop: '1rem' }}>
                    <AlertCircle size={16} />
                    <span>{otpError}</span>
                  </div>
                )}

                <form className="auth-form" onSubmit={handleVerifyOtpAndCreateUser}>
                  <div className="input-group">
                    <label>Enter 6-Digit OTP</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 123456" 
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required 
                    />
                  </div>

                  <button type="submit" className="submit-btn primary-btn" disabled={loading}>
                    <span>{loading ? 'Verifying OTP...' : 'Verify & Register'}</span>
                    <ArrowRight size={18} />
                  </button>

                  <button 
                    type="button" 
                    className="back-btn" 
                    onClick={() => { setVerificationStep('signup'); setOtpError(''); }}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.9rem',
                      textDecoration: 'underline',
                      marginTop: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    Go Back & Edit Form
                  </button>
                </form>
              </div>
            ) : (
              <form className="auth-form" onSubmit={mode === 'login' ? handleSignIn : handleInitiateSignUp}>
                {mode === 'signup' ? (
                  <div className="form-grid">
                    <div className="input-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter full name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required 
                      />
                    </div>

                    <div className="input-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        placeholder="name@gmail.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>

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
                      <label>Aadhaar Number (12 digits)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 123456789012" 
                        value={aadhaar}
                        onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        required 
                      />
                    </div>

                    <div className="input-group">
                      <label>Age</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 34" 
                        value={age}
                        onChange={(e) => setAge(e.target.value.slice(0, 3))}
                        required 
                      />
                    </div>

                    <div className="input-group">
                      <label>Gender</label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Annual Income (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 240000" 
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        required 
                      />
                    </div>

                    <div className="input-group">
                      <label>Occupation</label>
                      <select 
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        required
                      >
                        <option value="Farmer / Agriculture">Farmer / Agriculture</option>
                        <option value="Student">Student</option>
                        <option value="Construction Worker">Construction Worker</option>
                        <option value="Self-Employed / Business">Self-Employed / Business</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Salaried">Salaried</option>
                        <option value="Senior Citizen">Senior Citizen</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Social Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="General">General</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="OBC">OBC</option>
                        <option value="EWS">EWS</option>
                        <option value="Minorities">Minorities</option>
                      </select>
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
                  </div>
                ) : (
                  <>
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

                    <div className="form-options">
                      <label className="remember-me">
                        <input type="checkbox" defaultChecked /> Remember session
                      </label>
                      <a href="#reset" className="forgot-password">Forgot password?</a>
                    </div>
                  </>
                )}

                <button type="submit" className="submit-btn primary-btn" disabled={loading}>
                  <span>
                    {loading 
                      ? 'Processing...' 
                      : mode === 'login' 
                        ? 'Continue to Dashboard' 
                        : 'Send Verification OTP'}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </form>
            )}

            <div className="mode-switch">
              {verificationStep === 'signup' && (
                mode === 'login' ? (
                  <>
                    New to Yojana Sarthi? 
                    <button type="button" onClick={() => { setMode('signup'); setError(''); }}>Register Now</button>
                  </>
                ) : (
                  <>
                    Already registered? 
                    <button type="button" onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
                  </>
                )
              )}
            </div>
            
            <div id="recaptcha-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
