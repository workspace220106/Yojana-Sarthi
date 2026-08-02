import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Award, CheckCircle2, ChevronRight, Lock, Clock } from 'lucide-react';
import './BenefitPlanner.css';

const BenefitPlanner = () => {
  const [schemes, setSchemes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch schemes catalog
    fetch('/api/schemes/')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch schemes');
        return res.json();
      })
      .then(data => {
        setSchemes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // 2. Load user profile
    const saved = localStorage.getItem('yojana_sarthi_profile');
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const getAgeGroup = () => {
    if (!userProfile || !userProfile.age) return 30; // Default fallback age
    return parseInt(userProfile.age);
  };

  const userAge = getAgeGroup();

  // Define the 6 lifecycle stages
  const stages = [
    {
      id: 1,
      name: 'Birth & Early Years',
      ageRange: '0 - 5 years',
      description: 'Maternal health, early vaccination, child nutrition support, and primary care.',
      ageMin: 0,
      ageMax: 5,
      filter: (s) => s.category === 'Health' || s.id === 'pm-awas-yojana'
    },
    {
      id: 2,
      name: 'Primary & Secondary Schooling',
      ageRange: '6 - 15 years',
      description: 'Free textbooks, girls education incentives, mid-day meals, and basic scholarships.',
      ageMin: 6,
      ageMax: 15,
      filter: (s) => s.category === 'Education' && s.id !== 'phd-fellowship-scholarship'
    },
    {
      id: 3,
      name: 'Higher Education & Vocational',
      ageRange: '16 - 22 years',
      description: 'Post-matric tuition fee waivers, research fellowships, and vocational skill credits.',
      ageMin: 16,
      ageMax: 22,
      filter: (s) => s.category === 'Education'
    },
    {
      id: 4,
      name: 'Employment & Entrepreneurship',
      ageRange: '23 - 50 years',
      description: 'Business startup loans, agricultural subsidies, landholdings credit, and skill upgrades.',
      ageMin: 23,
      ageMax: 50,
      filter: (s) => s.category === 'Credit' || s.category === 'Agriculture' || s.id === 'pm-awas-yojana'
    },
    {
      id: 5,
      name: 'Family Welfare & Midlife',
      ageRange: '51 - 64 years',
      description: 'Housing subsidies, household insurance, and cooperative agricultural benefits.',
      ageMin: 51,
      ageMax: 64,
      filter: (s) => s.category === 'Housing' || s.category === 'Agriculture'
    },
    {
      id: 6,
      name: 'Senior Citizen & Retirement',
      ageRange: '65+ years',
      description: 'Monthly pensions, destitute widow support, senior travel concessions, and elderly health plans.',
      ageMin: 65,
      ageMax: 120,
      filter: (s) => s.category === 'Senior Citizen' || s.category === 'Social Security'
    }
  ];

  // Determine stage status
  const getStageStatus = (stage) => {
    if (userAge >= stage.ageMin && userAge <= stage.ageMax) return 'current';
    if (userAge > stage.ageMax) return 'completed';
    return 'future';
  };

  const getStageSchemes = (stage) => {
    return schemes.filter(stage.filter);
  };

  const currentStageIndex = stages.findIndex(s => userAge >= s.ageMin && userAge <= s.ageMax);
  const progressPercent = currentStageIndex === -1 
    ? (userAge > 120 ? 100 : 0)
    : Math.round(((currentStageIndex + 0.5) / stages.length) * 100);

  if (loading) {
    return (
      <div className="planner-loading">
        <div className="spinner"></div>
        <p>Generating your personalized benefit timeline...</p>
      </div>
    );
  }

  return (
    <div className="planner-page">
      <div className="planner-header">
        <div className="header-badge">
          <Calendar size={16} />
          <span>Welfare Lifecycle Roadmap</span>
        </div>
        <h1>Benefit Lifecycle Planner</h1>
        <p className="subtitle">
          Personalized timeline tracking applicable schemes across your lifetime milestones.
        </p>

        {userProfile && (
          <div className="profile-active-strip">
            <span className="pill">Age: <strong>{userAge} years</strong></span>
            <span className="pill">Occupation: <strong>{userProfile.occupation || 'Farmer'}</strong></span>
            <span className="pill">Category: <strong>{userProfile.category || 'OBC'}</strong></span>
            <span className="text-muted text-sm">
              Timeline generated based on your profile inputs. 
            </span>
          </div>
        )}
      </div>

      {/* Progress Track */}
      <div className="timeline-progress-bar-wrapper">
        <div className="progress-lbl-row">
          <span>Timeline Completion</span>
          <span className="percent">{progressPercent}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="timeline-timeline-container">
        {stages.map((stage) => {
          const status = getStageStatus(stage);
          const stageSchemes = getStageSchemes(stage);
          
          return (
            <div key={stage.id} className={`timeline-stage-card ${status}`}>
              <div className="timeline-node">
                <div className="node-outer">
                  <div className="node-inner">
                    {status === 'completed' && <CheckCircle2 size={16} />}
                    {status === 'current' && <Clock size={16} />}
                    {status === 'future' && <Lock size={14} />}
                  </div>
                </div>
                <div className="connecting-line"></div>
              </div>

              <div className="stage-card-body">
                <div className="card-top-header">
                  <span className="stage-age-range">{stage.ageRange}</span>
                  <span className={`status-tag-badge ${status}`}>{status}</span>
                </div>
                
                <h3>{stage.name}</h3>
                <p className="stage-desc">{stage.description}</p>

                {status === 'current' && (
                  <div className="current-stage-callout">
                    <div className="callout-header">
                      <Sparkles size={16} className="sparkle-icon" />
                      <span>{stageSchemes.length} Opportunities Active Right Now</span>
                    </div>
                    <div className="active-schemes-list">
                      {stageSchemes.map(s => (
                        <div key={s.id} className="active-scheme-item">
                          <div className="item-meta">
                            <strong>{s.name}</strong>
                            <span className="item-benefit text-success">{s.benefit}</span>
                          </div>
                          <ChevronRight size={18} className="arrow" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status !== 'current' && stageSchemes.length > 0 && (
                  <details className="stage-details-collapsed">
                    <summary>View {stageSchemes.length} schemes associated with this stage</summary>
                    <div className="details-schemes-list">
                      {stageSchemes.map(s => (
                        <div key={s.id} className="collapsed-scheme-row">
                          <span>{s.name}</span>
                          <span className="val text-success">{s.benefit.split(' (')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BenefitPlanner;
