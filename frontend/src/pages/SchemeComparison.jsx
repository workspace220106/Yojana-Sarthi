import React, { useState, useEffect } from 'react';
import { Plus, Minus, Info, CheckCircle2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import './SchemeComparison.css';

const SchemeComparison = () => {
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemes, setSelectedSchemes] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch schemes from the backend
  useEffect(() => {
    fetch('/api/schemes/')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch schemes catalog');
        return res.json();
      })
      .then(data => {
        setSchemes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not connect to the schemes catalog server.');
        setLoading(false);
      });
  }, []);

  const handleToggleSelect = (scheme) => {
    if (selectedSchemes.find(s => s.id === scheme.id)) {
      setSelectedSchemes(prev => prev.filter(s => s.id !== scheme.id));
    } else {
      if (selectedSchemes.length >= 4) {
        alert('You can select a maximum of 4 schemes for comparison.');
        return;
      }
      setSelectedSchemes(prev => [...prev, scheme]);
    }
  };

  const getUniqueCategories = () => {
    const categories = new Set(schemes.map(s => s.category));
    return ['All', ...Array.from(categories)];
  };

  const filteredSchemes = categoryFilter === 'All'
    ? schemes
    : schemes.filter(s => s.category === categoryFilter);

  const calculateTotalBenefits = () => {
    return selectedSchemes.reduce((acc, curr) => acc + (curr.benefit_amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="comparison-loading">
        <div className="spinner"></div>
        <p>Loading Yojana Sarthi Schemes Matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comparison-error">
        <AlertCircle size={48} className="err-icon" />
        <h2>Connection Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="comparison-page">
      <div className="comparison-header">
        <div className="header-badge">
          <Sparkles size={16} />
          <span>Interactive Scheme Matrix</span>
        </div>
        <h1>Welfare Scheme Matrix & Comparison</h1>
        <p className="subtitle">
          Compare criteria, benefits, and documents side-by-side to optimize your eligibility allocations.
        </p>
      </div>

      {/* Allocation Summary Card */}
      {selectedSchemes.length > 0 && (
        <div className="allocation-summary-card">
          <div className="summary-left">
            <span className="summary-lbl">Selected Schemes ({selectedSchemes.length})</span>
            <div className="summary-amount">
              ₹{calculateTotalBenefits().toLocaleString('en-IN')} <span className="period">/ year</span>
            </div>
            <p className="summary-desc">Estimated total value of direct benefits, subsidies, and fees waived.</p>
          </div>
          <div className="selected-pills-row">
            {selectedSchemes.map(s => (
              <div key={s.id} className="selected-pill">
                <span>{s.name.split(' (')[0]}</span>
                <button className="remove-pill" onClick={() => handleToggleSelect(s)}>
                  <Minus size={12} />
                </button>
              </div>
            ))}
            {selectedSchemes.length > 0 && (
              <button className="clear-all-btn" onClick={() => setSelectedSchemes([])}>
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Selection Section */}
      <div className="matrix-control-panel">
        <div className="category-filter-bar">
          {getUniqueCategories().map(cat => (
            <button
              key={cat}
              className={`filter-tab-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="schemes-selection-grid">
          {filteredSchemes.map(scheme => {
            const isSelected = selectedSchemes.some(s => s.id === scheme.id);
            return (
              <div 
                key={scheme.id} 
                className={`scheme-select-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggleSelect(scheme)}
              >
                <div className="card-header-row">
                  <span className="card-category">{scheme.category}</span>
                  <div className={`checkbox-circle ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <CheckCircle2 size={16} />}
                  </div>
                </div>
                <h3>{scheme.name}</h3>
                <p className="card-benefit">{scheme.benefit}</p>
                <div className="card-footer-row">
                  <span className={`priority-badge ${scheme.priority.toLowerCase()}`}>
                    {scheme.priority} Priority
                  </span>
                  <span className="card-age">Age: {scheme.age_min || 0}-{scheme.age_max || 'N/A'} yrs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid View */}
      {selectedSchemes.length > 0 ? (
        <div className="matrix-comparison-section">
          <h2>Detailed Comparison</h2>
          <div className="comparison-table-wrapper">
            <table className="comparison-matrix-table">
              <thead>
                <tr>
                  <th className="feature-col">Feature Comparison</th>
                  {selectedSchemes.map(s => (
                    <th key={s.id} className="scheme-header-col">
                      <div className="th-container">
                        <h4>{s.name}</h4>
                        <span className="th-category">{s.category}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="feature-label">Benefit Amount</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="benefit-cell font-bold text-success">{s.benefit}</td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-label">Eligibility Criteria</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="criteria-cell">{s.eligibility}</td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-label">Income Ceiling</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id}>
                      {s.income_max 
                        ? `Under ₹${s.income_max.toLocaleString('en-IN')} / year` 
                        : 'No Income Cap'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-label">Target Audience</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id}>
                      <strong>{s.occupation || 'All Occupations'}</strong>
                      {s.category_target !== 'All' && (
                        <div className="caste-badge-row">
                          {Array.isArray(s.category_target) 
                            ? s.category_target.map(c => <span key={c} className="caste-badge">{c}</span>)
                            : <span className="caste-badge">{s.category_target}</span>
                          }
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-label">Required Documents</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="docs-cell">
                      <ul className="comparison-docs-list">
                        {s.documents.map((doc, idx) => (
                          <li key={idx}>
                            <span className="bullet">✓</span> {doc}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-label">Detailed Summary</td>
                  {selectedSchemes.map(s => (
                    <td key={s.id} className="summary-desc-cell">{s.details}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-matrix-state">
          <HelpCircle size={48} className="empty-icon" />
          <h3>No schemes selected for comparison</h3>
          <p>Click on up to 4 scheme cards above to generate a side-by-side comparison matrix.</p>
        </div>
      )}
    </div>
  );
};

export default SchemeComparison;
