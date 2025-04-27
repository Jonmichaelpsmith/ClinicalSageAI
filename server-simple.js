import express from 'express';

const app = express();
app.use(express.json());

// In-memory users
const users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', name: 'Demo User', role: 'user' }
];

// Simple routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TrialSage</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(to bottom, white, #fcf1f6);
          min-height: 100vh;
          color: #333;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        header {
          background-color: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 15px 0;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          color: #db2777;
          font-weight: bold;
          font-size: 24px;
        }
        .auth-buttons button {
          background-color: #db2777;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        h1 {
          margin-top: 40px;
        }
        .hero {
          background-color: #1f2937;
          color: white;
          padding: 60px 0;
          margin-bottom: 40px;
        }
        .hero-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .hero h1 {
          font-size: 42px;
          margin: 0 0 20px 0;
        }
        .hero p {
          font-size: 18px;
          color: #d1d5db;
          margin-bottom: 30px;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        .feature-card {
          background-color: white;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .feature-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #111827;
        }
        .login-container {
          max-width: 400px;
          margin: 60px auto;
          padding: 30px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        .login-button {
          background-color: #db2777;
          color: white;
          border: none;
          padding: 12px;
          width: 100%;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }
        .error {
          color: #e11d48;
          margin-top: 10px;
        }
        .dashboard {
          display: flex;
          gap: 20px;
        }
        .sidebar {
          width: 250px;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .content {
          flex: 1;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .nav-item {
          padding: 10px;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 5px;
        }
        .nav-item:hover {
          background-color: #f9f9f9;
        }
        .nav-item.active {
          background-color: #f9e6ef;
          color: #db2777;
          font-weight: 500;
        }
        .hidden {
          display: none;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="container">
          <div class="header-content">
            <div class="logo">TrialSage™</div>
            <div class="auth-buttons">
              <button id="loginButton">Sign In</button>
            </div>
          </div>
        </div>
      </header>

      <div id="landingPage">
        <div class="hero">
          <div class="container">
            <div class="hero-content">
              <h1>AI-Powered Regulatory Intelligence</h1>
              <p>Streamline clinical trial documentation and regulatory submissions with our advanced AI platform.</p>
              <div>
                <button id="getStartedButton" class="auth-buttons">Get Started</button>
              </div>
            </div>
          </div>
        </div>

        <div class="container">
          <h2>Integrated Regulatory Solutions</h2>
          <div class="features">
            <div class="feature-card">
              <div class="feature-title">IND Wizard™</div>
              <p>Streamlined IND application generation with smart templates and compliance checks.</p>
            </div>
            <div class="feature-card">
              <div class="feature-title">CSR Intelligence™</div>
              <p>AI-powered analysis and generation of clinical study reports with regulatory compliance.</p>
            </div>
            <div class="feature-card">
              <div class="feature-title">TrialSage Vault™</div>
              <p>Secure document management with blockchain verification and audit trails.</p>
            </div>
          </div>
        </div>
      </div>

      <div id="loginPage" class="hidden">
        <div class="container">
          <div class="login-container">
            <h2 style="text-align: center; margin-bottom: 30px;">Sign In to TrialSage</h2>
            <div id="loginError" class="error hidden"></div>
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" placeholder="Enter your username">
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" placeholder="Enter your password">
            </div>
            <button id="submitLogin" class="login-button">Sign In</button>
            <p style="text-align: center; margin-top: 20px;">
              <a href="#" id="backToHome">Back to Home</a>
            </p>
          </div>
        </div>
      </div>

      <div id="dashboardPage" class="hidden">
        <div class="container">
          <div class="header-content" style="margin-bottom: 20px;">
            <h1>Dashboard</h1>
            <button id="logoutButton" class="auth-buttons">Logout</button>
          </div>
          
          <div class="dashboard">
            <div class="sidebar">
              <ul class="nav-list">
                <li class="nav-item active" data-section="overview">Overview</li>
                <li class="nav-item" data-section="ind">IND Wizard</li>
                <li class="nav-item" data-section="csr">CSR Intelligence</li>
                <li class="nav-item" data-section="vault">TrialSage Vault</li>
                <li class="nav-item" data-section="client">Client Portal</li>
              </ul>
            </div>
            
            <div class="content">
              <div id="overview-section">
                <h2>Welcome, <span id="userName"></span>!</h2>
                <p>Here's an overview of your TrialSage workspace.</p>
                
                <div style="margin-top: 20px;">
                  <h3>Recent Activity</h3>
                  <ul>
                    <li>IND Template Updated - April 25, 2025</li>
                    <li>CSR QC Review Completed - April 23, 2025</li>
                    <li>New Document Uploaded to Vault - April 20, 2025</li>
                  </ul>
                </div>
              </div>
              
              <div id="ind-section" class="hidden">
                <h2>IND Wizard™</h2>
                <p>Guide through the IND submission process with intelligent templates and regulatory compliance checks.</p>
                
                <div style="margin-top: 20px;">
                  <h3>Available Templates</h3>
                  <ul>
                    <li>Basic IND Template</li>
                    <li>Expedited Review Template</li>
                    <li>Advanced Template</li>
                  </ul>
                </div>
              </div>
              
              <div id="csr-section" class="hidden">
                <h2>CSR Intelligence™</h2>
                <p>AI-powered analysis, extraction, and generation of clinical study reports with regulatory compliance checks.</p>
                
                <div style="margin-top: 20px;">
                  <h3>Recent CSR Activities</h3>
                  <ul>
                    <li>Phase 2 Oncology CSR Generated - April 24, 2025</li>
                    <li>Safety Data Extracted from BT-473 CSR - April 22, 2025</li>
                    <li>Compliance Analysis Report - Protocol A2201 - April 20, 2025</li>
                  </ul>
                </div>
              </div>
              
              <div id="vault-section" class="hidden">
                <h2>TrialSage Vault™</h2>
                <p>Secure document management with blockchain verification and audit trails.</p>
                
                <div style="margin-top: 20px;">
                  <h3>Recent Documents</h3>
                  <ul>
                    <li>Phase 3 Clinical Protocol V2.0 - April 25, 2025</li>
                    <li>Investigator Brochure 2025 - April 22, 2025</li>
                    <li>Statistical Analysis Plan - April 18, 2025</li>
                  </ul>
                </div>
              </div>
              
              <div id="client-section" class="hidden">
                <h2>Client Portal</h2>
                <p>Manage clients, studies, and access controls.</p>
                
                <div style="margin-top: 20px;">
                  <h3>Active Clients</h3>
                  <ul>
                    <li>BioGen Therapeutics - 3 Active Studies</li>
                    <li>NeuroCure, Inc. - 1 Active Study</li>
                    <li>Pharma Innovations - 2 Active Studies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script>
        // DOM Elements
        const loginButton = document.getElementById('loginButton');
        const getStartedButton = document.getElementById('getStartedButton');
        const submitLogin = document.getElementById('submitLogin');
        const backToHome = document.getElementById('backToHome');
        const logoutButton = document.getElementById('logoutButton');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginError = document.getElementById('loginError');
        const userName = document.getElementById('userName');
        
        // Pages
        const landingPage = document.getElementById('landingPage');
        const loginPage = document.getElementById('loginPage');
        const dashboardPage = document.getElementById('dashboardPage');
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
          item.addEventListener('click', () => {
            // Remove active class from all items
            document.querySelectorAll('.nav-item').forEach(navItem => {
              navItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('[id$="-section"]').forEach(section => {
              section.classList.add('hidden');
            });
            
            // Show selected section
            const sectionId = item.getAttribute('data-section');
            document.getElementById(sectionId + '-section').classList.remove('hidden');
          });
        });
        
        // Event Listeners
        loginButton.addEventListener('click', () => {
          landingPage.classList.add('hidden');
          loginPage.classList.remove('hidden');
        });
        
        getStartedButton.addEventListener('click', () => {
          landingPage.classList.add('hidden');
          loginPage.classList.remove('hidden');
        });
        
        backToHome.addEventListener('click', (e) => {
          e.preventDefault();
          loginPage.classList.add('hidden');
          landingPage.classList.remove('hidden');
        });
        
        // Login functionality
        submitLogin.addEventListener('click', async () => {
          const username = usernameInput.value;
          const password = passwordInput.value;
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
              // Login successful
              loginError.classList.add('hidden');
              loginPage.classList.add('hidden');
              dashboardPage.classList.remove('hidden');
              
              // Set username
              userName.textContent = data.name;
            } else {
              // Login failed
              loginError.textContent = data.error || 'Invalid username or password';
              loginError.classList.remove('hidden');
            }
          } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'An error occurred while logging in';
            loginError.classList.remove('hidden');
          }
        });
        
        // Logout functionality
        logoutButton.addEventListener('click', async () => {
          try {
            await fetch('/api/logout', {
              method: 'POST'
            });
            
            // Redirect to landing page
            dashboardPage.classList.add('hidden');
            landingPage.classList.remove('hidden');
          } catch (error) {
            console.error('Logout error:', error);
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Return user data (except password)
    const { password, ...userData } = user;
    res.json(userData);
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Logout API
app.post('/api/logout', (req, res) => {
  res.json({ success: true });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
