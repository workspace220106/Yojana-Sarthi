import React, { useState, useEffect } from 'react';
import { FileCheck, AlertTriangle, AlertCircle, FilePlus, ShieldCheck } from 'lucide-react';
import './DocumentAdvisor.css';

const DocumentAdvisor = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const savedDocs = localStorage.getItem('yojana_sarthi_docs');
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    }
  }, []);

  // Calculate a readiness score based on number of documents uploaded (e.g. 25 points each up to 100)
  const score = Math.min(documents.length * 25, 100);

  return (
    <div className="document-advisor-page">
      <div className="advisor-header">
        <div className="header-left">
          <h2>Document Readiness Portal</h2>
          <p>Compliance tracking for your saved certificates and application documents.</p>
        </div>
        <div className="score-badge-box">
          <span className="lbl">Readiness Score</span>
          <span className="val">{score} / 100</span>
        </div>
      </div>

      <div className="impact-tracker">
        <div className="impact-bar">
          <div className="impact-fill" style={{ width: `${score}%` }}></div>
        </div>
        <p>
          <ShieldCheck size={16} className="icon-shield" />
          {documents.length} document(s) verified in your local vault. {documents.length === 0 && "Please upload documents to check rule readiness."}
        </p>
      </div>

      <div className="docs-grid">
        {documents.map((doc, i) => (
          <div key={i} className="doc-status-card success">
            <div className="doc-icon-wrapper">
              <FileCheck size={20} />
            </div>
            <div className="doc-details">
              <h4>{doc.name}</h4>
              <p className="status-text">Verified & Active</p>
              <span className="impact-badge">Added: {doc.addedAt}</span>
            </div>
            <div className="doc-actions">
              <button className="btn-renew">
                <ShieldCheck size={16} />
                <span>Verified in Vault</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="empty-docs-container">
          <AlertCircle size={36} />
          <h3>No citizen documents found</h3>
          <p>Please navigate to the Citizen Profile tab to add certificates (such as Income Certificate, Caste Certificate, Aadhaar Card) to perform eligibility audits.</p>
        </div>
      )}
    </div>
  );
};

export default DocumentAdvisor;
