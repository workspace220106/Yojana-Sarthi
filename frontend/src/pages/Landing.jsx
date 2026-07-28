import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  FileText, 
  ChevronDown,
  ChevronUp,
  Award,
  Building2,
  Users
} from 'lucide-react';
import './Landing.css';

const Landing = () => {
  // Scheme Search & Filter State
  const [query, setQuery] = useState('farmer in Maharashtra with income 1.5 lakhs');
  const [age, setAge] = useState('');
  const [income, setIncome] = useState('');
  const [occupation, setOccupation] = useState('All');
  const [category, setCategory] = useState('All');
  const [gender, setGender] = useState('All');
  
  const [loading, setLoading] = useState(false);
  const [schemesData, setSchemesData] = useState({ eligible: [], ineligible: [], extracted_params: {} });
  const [activeTab, setActiveTab] = useState('eligible');
  const [expandedScheme, setExpandedScheme] = useState(null);

  // Fetch schemes from Flask backend API
  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (age) params.append('age', age);
      if (income) params.append('income', income);
      if (occupation && occupation !== 'All') params.append('occupation', occupation);
      if (category && category !== 'All') params.append('category', category);
      if (gender && gender !== 'All') params.append('gender', gender);

      const res = await fetch(`/api/schemes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSchemesData(data);
      }
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  return (
    <div className="landing-page">
      {/* Official Government Banner Header */}
      <section className="hero-banner">
        <div className="banner-top-badge">
          <ShieldCheck size={16} />
          <span>Government of Maharashtra Welfare Services</span>
        </div>

        <h1 className="banner-title">
          Yojana Sarthi — Citizen Scheme Portal
        </h1>

        <p className="banner-lead">
          Find government schemes, verify eligibility criteria, and track Direct Benefit Transfers (DBT) directly for your family.
        </p>

        {/* Live Portal Stats Grid */}
        <div className="portal-stats-grid">
          <div className="stat-card">
            <span className="stat-val">500+</span>
            <span className="stat-lbl">State & Central Schemes</span>
          </div>
          <div className="stat-card">
            <span className="stat-val">₹24,000 Cr+</span>
            <span className="stat-lbl">Disbursements Tracked</span>
          </div>
          <div className="stat-card">
            <span className="stat-val">100%</span>
            <span className="stat-lbl">Direct Benefit Transfer</span>
          </div>
        </div>
      </section>

      {/* Scheme Search & Filter Section */}
      <section className="scheme-finder-section">
        <div className="section-header">
          <h2>Scheme Search & Eligibility Verification</h2>
          <p>Enter your profile details or search query below to determine scheme eligibility instantly.</p>
        </div>

        {/* Filter Control Panel */}
        <div className="finder-control-panel">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="input-wrapper">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search schemes by keyword (e.g. farmer, scholarship, women, senior citizen)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                Search Schemes
              </button>
            </div>
          </form>

          {/* Detailed Filters Grid */}
          <div className="filters-grid">
            <div className="filter-group">
              <label>Age (Years)</label>
              <input 
                type="number" 
                placeholder="e.g. 45" 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
              />
            </div>

            <div className="filter-group">
              <label>Annual Income (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 150000" 
                value={income} 
                onChange={(e) => setIncome(e.target.value)} 
              />
            </div>

            <div className="filter-group">
              <label>Occupation</label>
              <select value={occupation} onChange={(e) => setOccupation(e.target.value)}>
                <option value="All">All Occupations</option>
                <option value="farmer">Farmer / Agriculture</option>
                <option value="student">Student</option>
                <option value="construction worker">Construction Worker</option>
                <option value="unemployed">Unemployed</option>
                <option value="entrepreneur">Entrepreneur / Small Business</option>
                <option value="artisan">Artisan / Weaver</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="General">General</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="VJNT">VJNT</option>
                <option value="SBC">SBC</option>
                <option value="PwD">PwD (Disabled)</option>
                <option value="BPL">BPL</option>
                <option value="Minority">Minority</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Container */}
        <div className="results-container">
          {/* Tab Bar */}
          <div className="results-tabs">
            <button 
              className={`result-tab ${activeTab === 'eligible' ? 'active' : ''}`}
              onClick={() => setActiveTab('eligible')}
            >
              <CheckCircle2 size={18} className="icon-success" />
              <span>Eligible Schemes ({schemesData.eligible?.length || 0})</span>
            </button>
            <button 
              className={`result-tab ${activeTab === 'ineligible' ? 'active' : ''}`}
              onClick={() => setActiveTab('ineligible')}
            >
              <XCircle size={18} className="icon-danger" />
              <span>Ineligible Schemes ({schemesData.ineligible?.length || 0})</span>
            </button>
          </div>

          {/* Scheme Cards Display */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Searching scheme database...</p>
            </div>
          ) : (
            <div className="scheme-cards-list">
              {activeTab === 'eligible' && (
                schemesData.eligible?.length > 0 ? (
                  schemesData.eligible.map((scheme, idx) => (
                    <div key={idx} className="scheme-card eligible">
                      <div className="card-top">
                        <div className="card-badge-row">
                          <span className="badge-eligible">Eligible</span>
                          <span className="badge-category">{scheme.schemeCategory || 'Welfare Scheme'}</span>
                          {scheme.level && <span className="badge-level">{scheme.level}</span>}
                        </div>
                        <h3 className="scheme-title">{scheme.scheme_name}</h3>
                      </div>

                      <p className="scheme-details">{scheme.details || scheme.benefits}</p>

                      {scheme.benefits && (
                        <div className="benefit-box">
                          <strong>Scheme Benefits:</strong> {scheme.benefits}
                        </div>
                      )}

                      {/* Passed Criteria */}
                      <div className="reasons-block passed">
                        <span className="reasons-heading">Verified Criteria Met:</span>
                        <ul>
                          {scheme.passed_reasons?.map((reason, rIdx) => (
                            <li key={rIdx}>
                              <CheckCircle2 size={14} className="icon-check" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="card-actions">
                        <button 
                          className="btn-expand"
                          onClick={() => setExpandedScheme(expandedScheme === idx ? null : idx)}
                        >
                          <span>{expandedScheme === idx ? 'Hide Requirements' : 'View Application & Documents'}</span>
                          {expandedScheme === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button className="btn-apply">
                          Apply for Scheme
                        </button>
                      </div>

                      {expandedScheme === idx && (
                        <div className="expanded-details">
                          {scheme.documents && (
                            <div className="detail-section">
                              <h4>Required Documents:</h4>
                              <p>{scheme.documents}</p>
                            </div>
                          )}
                          {scheme.application && (
                            <div className="detail-section">
                              <h4>Application Process:</h4>
                              <p>{scheme.application}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No eligible schemes found for the specified filters. Try adjusting your age or income parameters.</p>
                  </div>
                )
              )}

              {activeTab === 'ineligible' && (
                schemesData.ineligible?.length > 0 ? (
                  schemesData.ineligible.map((scheme, idx) => (
                    <div key={idx} className="scheme-card ineligible">
                      <div className="card-top">
                        <div className="card-badge-row">
                          <span className="badge-ineligible">Ineligible</span>
                          <span className="badge-category">{scheme.schemeCategory || 'Welfare Scheme'}</span>
                        </div>
                        <h3 className="scheme-title">{scheme.scheme_name}</h3>
                      </div>

                      <p className="scheme-details">{scheme.details || scheme.benefits}</p>

                      {/* Failed Criteria */}
                      <div className="reasons-block failed">
                        <span className="reasons-heading">Criteria Not Met:</span>
                        <ul>
                          {scheme.failed_reasons?.map((reason, rIdx) => (
                            <li key={rIdx}>
                              <XCircle size={14} className="icon-x" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>You meet all criteria for schemes in this category.</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* Citizen Service Pillars */}
      <section className="service-pillars-section">
        <div className="section-header">
          <h2>Official Citizen Support Pillars</h2>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <Building2 size={28} className="pillar-icon" />
            <h3>Direct Benefit Transfer</h3>
            <p>Seamless fund distribution directly to verified bank accounts via Aadhaar linkage.</p>
          </div>

          <div className="pillar-card">
            <FileText size={28} className="pillar-icon" />
            <h3>Document Verification</h3>
            <p>Integrated DigiLocker document authentication for fast verification.</p>
          </div>

          <div className="pillar-card">
            <Users size={28} className="pillar-icon" />
            <h3>Public Helpdesk</h3>
            <p>Dedicated citizen support across all district and taluka level offices in Maharashtra.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
