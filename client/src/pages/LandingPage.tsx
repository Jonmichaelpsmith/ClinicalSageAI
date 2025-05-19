import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

const LandingPage = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="logo-container">
          <h1 className="logo">TrialSage™ by <span className="company-name">Concept2Cures</span></h1>
        </div>
        <nav className="main-nav">
          <ul className="nav-links">
            <li><a href="#solutions">Solutions</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#ai-technology">AI Technology</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="auth-buttons">
            <button className="btn btn-outline">RFP</button>
            <button className="btn btn-outline">Demo</button>
            <button className="btn btn-primary" onClick={() => setLocation('/client-portal')}>Client Login</button>
            <button className="btn btn-outline">Support</button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">TrialSage™: Enterprise Regulatory Intelligence Platform</h1>
          <p className="hero-description">
            TrialSage™ is a comprehensive AI-powered platform integrating enterprise document
            management, regulatory submissions, and intelligent workflow automation. Our
            Microsoft 365-style UI with advanced retention management exceeds industry
            demands for 21 CFR Part 11 compliance while accelerating submissions by up to
            85%.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Request Demo</button>
            <button className="btn btn-secondary">Explore Solutions</button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">5,750+</div>
          <div className="stat-label">Documents Processed</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">85%</div>
          <div className="stat-label">Faster Submissions</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">99.7%</div>
          <div className="stat-label">Audit Compliance</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">8</div>
          <div className="stat-label">Enterprise Modules</div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2 className="section-title">Comprehensive Regulatory Solutions</h2>
          <p className="section-subtitle">Our integrated platform streamlines the entire regulatory lifecycle</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3 className="feature-title">510(k) Submission Automation</h3>
            <p className="feature-description">
              Streamline your FDA 510(k) submission process with our end-to-end automation pipeline.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Clinical Evaluation Reporting</h3>
            <p className="feature-description">
              Generate comprehensive CER documents with automated evidence collection and analysis.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Quality Management System</h3>
            <p className="feature-description">
              Maintain compliance with integrated quality management workflows and documentation.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3 className="feature-title">AI-Powered Document Generation</h3>
            <p className="feature-description">
              Create regulatory-compliant documents with intelligent assistance and templates.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to accelerate your regulatory process?</h2>
          <p className="cta-description">
            Join leading medical device companies that trust TrialSage™ for their regulatory needs.
          </p>
          <button className="btn btn-primary btn-large" onClick={() => setLocation('/client-portal')}>
            Access Client Portal
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>TrialSage™</h2>
            <p>Enterprise Regulatory Intelligence</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Products</h3>
              <ul>
                <li><a href="#">510(k) Automation</a></li>
                <li><a href="#">CER Generator</a></li>
                <li><a href="#">IND Wizard</a></li>
                <li><a href="#">TrialSage Vault</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Resources</h3>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Knowledge Base</a></li>
                <li><a href="#">Compliance Guides</a></li>
                <li><a href="#">Webinars</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Company</h3>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Concept2Cures. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;