import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { cleanupModals } from '../lib/modalHelpers';

export default function LandingPage() {
  const [, navigate] = useLocation();

  // Clean up modals when component unmounts
  useEffect(() => {
    return () => {
      cleanupModals();
    };
  }, []);

  const goToClientPortal = () => {
    navigate('/client-portal');
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <div className="header">
        <div className="header-container">
          <div className="logo">
            <span className="brand-text">TrialSage™ by</span>
            <span className="company-name">Concept2Cures</span>
          </div>
          <div className="nav">
            <div className="nav-links">
              <a href="#solutions">Solutions</a>
              <a href="#features">Features</a>
              <a href="#ai-tech">AI Technology</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="auth-buttons">
              <button className="btn-white">RFP</button>
              <button className="btn-white">Demo</button>
              <button className="btn-primary" onClick={goToClientPortal}>Client Login</button>
              <button className="btn-white">Support</button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-container">
          <h1>TrialSage™: Enterprise Regulatory Intelligence Platform</h1>
          <p className="hero-text">
            TrialSage™ is a comprehensive AI-powered platform integrating enterprise document
            management, regulatory submissions, and intelligent workflow automation. Our
            Microsoft 365-style UI with advanced retention management exceeds industry
            demands for 21 CFR Part 11 compliance while accelerating submissions by up to
            85%.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary">Request Demo</button>
            <button className="btn-secondary">Explore Solutions</button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats">
        <div className="stats-container">
          <div className="stat">
            <h2>5,750+</h2>
            <p>Documents Processed</p>
          </div>
          <div className="stat">
            <h2>85%</h2>
            <p>Faster Submissions</p>
          </div>
          <div className="stat">
            <h2>99.7%</h2>
            <p>Audit Compliance</p>
          </div>
          <div className="stat">
            <h2>8</h2>
            <p>Enterprise Modules</p>
          </div>
        </div>
      </div>

      {/* Solutions Section */}
      <div className="solutions" id="solutions">
        <div className="solutions-container">
          <h2 className="section-title">Our Solutions</h2>
          <div className="section-divider"></div>
          <p className="section-description">
            Explore our suite of AI-powered regulatory tools designed to revolutionize
            your workflow and accelerate time to market.
          </p>

          <div className="solution-cards">
            <div className="solution-card">
              <h3>CSR Intelligence™</h3>
              <p>Access and analyze 3,217+ parsed clinical study reports with our powerful search and AI assistant.</p>
              <ul className="feature-list">
                <li>Intelligent search across all your CSR data</li>
                <li>Ask questions in plain English and get immediate answers</li>
                <li>Jump directly to source documents with precise citations</li>
              </ul>
              <a href="#" className="learn-more">Learn more →</a>
            </div>

            <div className="solution-card">
              <h3>IND Building & Submission Wizard™</h3>
              <p>Turn complex IND applications into a simple guided process with intelligent document generation.</p>
              <ul className="feature-list">
                <li>Guided IND application process with expert system</li>
                <li>Auto-generation of compliant regulatory documents</li>
                <li>Reduce IND preparation time by up to 70%</li>
              </ul>
              <a href="#" className="learn-more">Learn more →</a>
            </div>

            <div className="solution-card">
              <h3>CMC Automation Module™</h3>
              <p>Streamline Chemistry, Manufacturing, and Controls documentation with AI-powered automation tools.</p>
              <ul className="feature-list">
                <li>Auto-generate ICH-compliant Module 3 documentation</li>
                <li>Simulate change consequences across global filings</li>
                <li>AI-powered manufacturing process optimization</li>
              </ul>
              <a href="#" className="learn-more">Learn more →</a>
            </div>

            <div className="solution-card">
              <h3>CER Generator Module™</h3>
              <p>Create comprehensive Clinical Evaluation Reports that meet global regulatory requirements.</p>
              <ul className="feature-list">
                <li>Auto-generate CER templates and structure</li>
                <li>Intelligent data extraction from clinical studies</li>
                <li>Risk assessment and safety analysis automation</li>
              </ul>
              <a href="#" className="learn-more">Learn more →</a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta">
        <div className="cta-container">
          <h2>Ready to experience the TrialSage™ difference?</h2>
          <button className="btn-primary" onClick={goToClientPortal}>
            Access Client Portal
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-logo">
              <h3>TrialSage™</h3>
              <p>Enterprise Regulatory Intelligence</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#">510(k) Automation</a>
                <a href="#">CER Generator</a>
                <a href="#">IND Wizard</a>
                <a href="#">Vault Workspace</a>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <a href="#">Documentation</a>
                <a href="#">API</a>
                <a href="#">Guides</a>
                <a href="#">Webinars</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Careers</a>
                <a href="#">Blog</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Concept2Cures. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">GDPR</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}