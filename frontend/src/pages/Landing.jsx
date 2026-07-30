import React, { useState, useEffect } from 'react';
import { askQuestion } from "../services/api";
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
  Users,
  Landmark
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
   const finalQuery = `
   ${query}

   Age: ${age || "Information not available"}
   Annual Income: ${income || "Information not available"}
   Occupation: ${occupation}
   Category: ${category}
   Gender: ${gender}
   Please provide a list of government schemes in Maharashtra that the citizen is eligible for, along with reasons for eligibility and ineligibility. Also, extract the citizen's profile parameters from the query.`;

  const result = await askQuestion(finalQuery);


    setSchemesData({
      eligible: result.eligible || [],
      ineligible: result.ineligible || [],
      extracted_params: result.citizen_profile || {}
    });
  }
  catch (err) {
  console.error(err);

  setSchemesData({
    eligible: [],
    ineligible: [],
    extracted_params: {}
  });

  alert("Unable to fetch schemes. Please try again.");
}
 finally {
    setLoading(false);
  }
};

const handleSearchSubmit = (e) => {
  e.preventDefault();
  fetchSchemes();
};
useEffect(() => {
  fetchSchemes();
}, []);

  return (
  <div className="landing-page">

    {/* ================= HERO ================= */}

    <section className="hero-banner">

      <div className="banner-top-badge">
        <ShieldCheck size={16} />
        <span>Government of Maharashtra Welfare Services</span>
      </div>

      <h1 className="banner-title">
        Yojana Sarthi — Citizen Scheme Portal
      </h1>

      <p className="banner-lead">
        Find government schemes, verify eligibility criteria and track Direct
        Benefit Transfers (DBT) directly for your family.
      </p>

      <div className="portal-stats-grid">

        <div className="stat-card">
          <span className="stat-val">500+</span>
          <span className="stat-lbl">
            State & Central Schemes
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-val">₹24,000 Cr+</span>
          <span className="stat-lbl">
            Disbursements Tracked
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-val">100%</span>
          <span className="stat-lbl">
            Direct Benefit Transfer
          </span>
        </div>

      </div>

    </section>

    {/* ================= SEARCH ================= */}

    <section className="scheme-finder-section">

      <div className="section-header">

        <h2>
          Scheme Search & Eligibility Verification
        </h2>

        <p>
          Enter your details below to instantly check your eligibility
          for Maharashtra Government schemes.
        </p>

      </div>

      <div className="finder-control-panel">

        <form
          className="search-form"
          onSubmit={handleSearchSubmit}
        >

          <div className="input-wrapper">

            <Search
              size={20}
              className="search-icon"
            />

            <input
              type="text"
              placeholder="Describe yourself or search schemes..."
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
            />

            <button
              type="submit"
              className="search-btn"
              disabled={loading}
            >
              {loading
                ? "Searching..."
                : "Search Schemes"}
            </button>

          </div>

        </form>

        {/* ================= FILTERS ================= */}

        <div className="filters-grid">

          <div className="filter-group">

            <label>Age</label>

            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) =>
                setAge(e.target.value)
              }
            />

          </div>

          <div className="filter-group">

            <label>Annual Income</label>

            <input
              type="number"
              placeholder="Annual Income"
              value={income}
              onChange={(e) =>
                setIncome(e.target.value)
              }
            />

          </div>

          <div className="filter-group">

            <label>Occupation</label>

            <select
              value={occupation}
              onChange={(e) =>
                setOccupation(e.target.value)
              }
            >
              <option>All</option>
              <option value="farmer">Farmer</option>
              <option value="student">Student</option>
              <option value="construction worker">
                Construction Worker
              </option>
              <option value="entrepreneur">
                Entrepreneur
              </option>
              <option value="artisan">
                Artisan
              </option>
              <option value="unemployed">
                Unemployed
              </option>
            </select>

          </div>

          <div className="filter-group">

            <label>Category</label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option>All</option>
              <option>General</option>
              <option>SC</option>
              <option>ST</option>
              <option>OBC</option>
              <option>VJNT</option>
              <option>SBC</option>
              <option>BPL</option>
              <option>Minority</option>
              <option>PwD</option>
            </select>

          </div>

          <div className="filter-group">

            <label>Gender</label>

            <select
              value={gender}
              onChange={(e) =>
                setGender(e.target.value)
              }
            >
              <option>All</option>
              <option>Male</option>
              <option>Female</option>
            </select>

          </div>

        </div>

      </div>

      {/* ================= PROFILE SUMMARY ================= */}

      {Object.keys(
        schemesData.extracted_params || {}
      ).length > 0 && (

        <div className="profile-summary-card">

          <h3>
            Detected Citizen Profile
          </h3>

          <div className="profile-grid">

            <div>
              <strong>State</strong>
              <br />
              {schemesData.extracted_params.state}
            </div>

            <div>
              <strong>Occupation</strong>
              <br />
              {schemesData.extracted_params.occupation}
            </div>

            <div>
              <strong>Income</strong>
              <br />
              {schemesData.extracted_params.annual_income}
            </div>

            <div>
              <strong>Category</strong>
              <br />
              {schemesData.extracted_params.category}
            </div>

            <div>
              <strong>Gender</strong>
              <br />
              {schemesData.extracted_params.gender}
            </div>

            <div>
              <strong>Education</strong>
              <br />
              {schemesData.extracted_params.education}
            </div>

          </div>

        </div>

      )}

      {/* ================= RESULTS ================= */}

      {/* ================= RESULT SUMMARY ================= */}

<div className="result-summary">
  <h3>
    {schemesData.eligible.length} Eligible &{" "}
    {schemesData.ineligible.length} Ineligible Schemes
  </h3>
</div>

{/* ================= TABS ================= */}

<div className="results-tabs">

  <button
    className={`result-tab ${
      activeTab === "eligible" ? "active" : ""
    }`}
    onClick={() => setActiveTab("eligible")}
  >
    <CheckCircle2
      size={18}
      className="icon-success"
    />

    Eligible Schemes
    ({schemesData.eligible.length})
  </button>

  <button
    className={`result-tab ${
      activeTab === "ineligible"
        ? "active"
        : ""
    }`}
    onClick={() => setActiveTab("ineligible")}
  >
    <XCircle
      size={18}
      className="icon-danger"
    />

    Ineligible Schemes
    ({schemesData.ineligible.length})
  </button>

</div>

{/* ================= LOADING ================= */}

{loading ? (

<div className="loading-state">

<div className="spinner"></div>

<p>

🔍 Analyzing your profile...

<br />

📑 Matching Government Schemes...

<br />

✅ Verifying Eligibility...

<br />

🤖 AI is generating recommendations...

</p>

</div>

) : (

<div className="scheme-cards-list">

{/* ================= ELIGIBLE ================= */}

{activeTab === "eligible" && (

schemesData.eligible.length > 0 ? (

schemesData.eligible.map((scheme) => (

<div
key={scheme.scheme_name}
className="scheme-card eligible"
>

<div className="card-top">

<div className="card-badge-row">

<span className="badge-eligible">

Eligible

</span>

<span className="badge-category">

{scheme.schemeCategory}

</span>

{scheme.level && (

<span className="badge-level">

{scheme.level === "Central"

? "🇮🇳 Central"

: "🏛 Maharashtra"}

</span>

)}

</div>

<h3 className="scheme-title">

{scheme.scheme_name}

</h3>

</div>

<p className="scheme-details">

{scheme.details}

</p>

{scheme.eligibility &&
scheme.eligibility !==
"Information not available." && (

<div className="detail-section">

<h4>Eligibility</h4>

<p>{scheme.eligibility}</p>

</div>

)}

{scheme.benefits && (

<div className="benefit-box">

<strong>

Benefits

</strong>

<p>{scheme.benefits}</p>

</div>

)}

<div className="reasons-block passed">

<span className="reasons-heading">

Verified Criteria Met

</span>

<ul>

{scheme.passed_reasons?.map(

(reason, index) => (

<li key={`${scheme.scheme_name}-passed-${index}`}>

<CheckCircle2
size={14}
/>

<span>

{reason}

</span>

</li>

)

)}

</ul>

</div>

<div className="card-actions">

<button

className="btn-expand"

onClick={() =>

setExpandedScheme(

expandedScheme ===

scheme.scheme_name

? null

: scheme.scheme_name

)

}

>

{expandedScheme ===

scheme.scheme_name

? "Hide Details"

: "View Documents"}

</button>

<a

href={

scheme.official_website

}

target="_blank"

rel="noreferrer"

>

<button

className="btn-apply"

>

Apply on Official Portal

</button>

</a>

</div>

{expandedScheme ===

scheme.scheme_name && (

<div className="expanded-details">

{scheme.documents && (

<div className="detail-section">

<h4>

Required Documents

</h4>

<p>

{scheme.documents}

</p>

</div>

)}

{scheme.application && (

<div className="detail-section">

<h4>

Application Process

</h4>

<p>

{scheme.application}

</p>

</div>

)}

{scheme.official_website && (

<div className="detail-section">

<h4>

Official Website

</h4>

<a

href={

scheme.official_website

}

target="_blank"

rel="noreferrer"

>

Visit Official Website

</a>

</div>

)}

</div>

)}

</div>

))

) : (

<div className="empty-state">

<h3>

No Eligible Schemes Found

</h3>

<p>

Try changing

Income,

Occupation,

Category,

Age,

or Search Query.

</p>

</div>

)

)}
              {/* ================= INELIGIBLE ================= */}

{activeTab === "ineligible" && (

  schemesData.ineligible.length > 0 ? (

    schemesData.ineligible.map((scheme) => (

      <div
        key={scheme.scheme_name}
        className="scheme-card ineligible"
      >

        <div className="card-top">

          <div className="card-badge-row">

            <span className="badge-ineligible">
              Ineligible
            </span>

            <span className="badge-category">
              {scheme.schemeCategory}
            </span>

            {scheme.level && (
              <span className="badge-level">
                {scheme.level === "Central"
                  ? "🇮🇳 Central"
                  : "🏛 Maharashtra"}
              </span>
            )}

          </div>

          <h3 className="scheme-title">
            {scheme.scheme_name}
          </h3>

        </div>

        <p className="scheme-details">
          {scheme.details}
        </p>

        {scheme.benefits && (
          <div className="benefit-box">
            <strong>Benefits</strong>
            <p>{scheme.benefits}</p>
          </div>
        )}

        <div className="reasons-block failed">

          <span className="reasons-heading">
            Not Eligible Because
          </span>

          <ul>

            {scheme.failed_reasons?.map((reason, index) => (

              <li key={`${scheme.scheme_name}-failed-${index}`}>
                <XCircle size={14} />
                <span>{reason}</span>
              </li>

            ))}

          </ul>

        </div>

      </div>

    ))

  ) : (

    <div className="empty-state">

      <h3>No Ineligible Schemes</h3>

      <p>
        Great! Based on the information provided,
        there are currently no schemes for which you
        are explicitly ineligible.
      </p>

    </div>

  )

)}

</div>

)}

{/* ================= SERVICE PILLARS ================= */}

<section className="services-section">

  <div className="section-header">
    <h2>Citizen Services</h2>
    <p>
      Access essential government welfare services
      through one platform.
    </p>
  </div>

  <div className="services-grid">

    <div className="service-card">

      <ShieldCheck
        size={36}
        className="service-icon"
      />

      <h3>Eligibility Verification</h3>

      <p>
        Instantly verify your eligibility for
        Central and Maharashtra Government schemes.
      </p>

    </div>

    <div className="service-card">

      <FileText
        size={36}
        className="service-icon"
      />

      <h3>Required Documents</h3>

      <p>
        View all mandatory documents before
        applying for any government scheme.
      </p>

    </div>

    <div className="service-card">

      <Landmark
        size={36}
        className="service-icon"
      />

      <h3>Official Applications</h3>

      <p>
        Apply directly through the official
        government portals.
      </p>

    </div>

  </div>

</section>

</section>

</div>

);

}

export default Landing;
