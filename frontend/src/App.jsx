import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import './styles/theme.css';

// Page Imports
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import AIAssistant from './pages/AIAssistant';
import Dashboard from './pages/Dashboard';
import DocumentAdvisor from './pages/DocumentAdvisor';
import SchemeComparison from './pages/SchemeComparison';
import RejectionPredictor from './pages/RejectionPredictor';
import BenefitPlanner from './pages/BenefitPlanner';
import VoiceInterface from './pages/VoiceInterface';
import Profile from './pages/Profile';
import AdminPortal from './pages/AdminPortal';
import Multilingual from './pages/Multilingual';

import StartingPage from './pages/StartingPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/landing" element={<Landing />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/docs" element={<DocumentAdvisor />} />
                <Route path="/comparison" element={<SchemeComparison />} />
                <Route path="/predictor" element={<RejectionPredictor />} />
                <Route path="/planner" element={<BenefitPlanner />} />
                <Route path="/voice" element={<VoiceInterface />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminPortal />} />
                <Route path="/multilingual" element={<Multilingual />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
