// Static Routes for Important Pages
// This module provides static HTML versions of key pages when the React app has issues loading

import path from 'path';
import fs from 'fs';

// Create a router to handle static page routes
export function setupStaticRoutes(app) {
  console.log('[StaticRoutes] Setting up static routes for key pages');

  // Define routes that should get static fallback pages
  const staticRoutes = [
    {
      path: '/solutions/csr-intelligence',
      title: 'CSR Intelligence™',
      description: 'Advanced clinical study report analytics and insights'
    },
    {
      path: '/solutions/ind-wizard',
      title: 'IND Wizard™',
      description: 'Automated IND application preparation and submission'
    },
    {
      path: '/solutions/protocol-optimization',
      title: 'Protocol Optimization',
      description: 'AI-powered clinical protocol design and optimization'
    }
  ];

  // Register routes for each static page
  staticRoutes.forEach(route => {
    app.get(route.path, (req, res) => {
      console.log(`[StaticRoutes] Serving static fallback for: ${route.path}`);
      
      // Generate a simple but professional page for the route
      const html = generateStaticPage(route);
      
      // Send the HTML response
      res.set('Content-Type', 'text/html');
      res.send(html);
    });
  });

  // Create a generic fallback for other solution pages
  app.get('/solutions/*', (req, res, next) => {
    // If we made it here, we didn't have a specific static page for this solution
    // Create a generic solution page
    const pathSegments = req.path.split('/');
    const solutionName = pathSegments[pathSegments.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const route = {
      path: req.path,
      title: `${solutionName}`,
      description: 'TrialSage™ enterprise regulatory solution'
    };
    
    const html = generateStaticPage(route);
    res.set('Content-Type', 'text/html');
    res.send(html);
  });

  console.log('[StaticRoutes] Static routes registered successfully');
}

// Generate a static HTML page for the given route
function generateStaticPage(route) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${route.title} | TrialSage™</title>
  <style>
    :root {
      --primary: #2c8c6c;
      --primary-light: #e6f7f1;
      --accent: #ff7f50;
      --text: #333;
      --text-light: #666;
      --background: #fff;
      --border: #eaeaea;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: var(--text);
      background-color: var(--background);
      margin: 0;
      padding: 0;
    }
    
    .header {
      background-color: var(--primary);
      padding: 1rem 2rem;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .nav {
      display: flex;
      gap: 1.5rem;
    }
    
    .nav a {
      color: white;
      text-decoration: none;
      opacity: 0.9;
    }
    
    .nav a:hover {
      opacity: 1;
      text-decoration: underline;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .hero {
      background-color: var(--primary-light);
      padding: 3rem 2rem;
      text-align: center;
      margin-bottom: 2rem;
      border-radius: 8px;
    }
    
    .hero h1 {
      font-size: 2.5rem;
      color: var(--primary);
      margin-bottom: 1rem;
    }
    
    .hero p {
      font-size: 1.2rem;
      color: var(--text-light);
      max-width: 800px;
      margin: 0 auto;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }
    
    .feature-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.5rem;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.05);
    }
    
    .feature-card h3 {
      font-size: 1.3rem;
      color: var(--primary);
      margin-top: 0;
    }
    
    .feature-icon {
      font-size: 2rem;
      color: var(--accent);
      margin-bottom: 1rem;
    }
    
    .cta {
      background-color: var(--accent);
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .cta:hover {
      background-color: #e67346;
    }
    
    .footer {
      background-color: #f5f5f5;
      padding: 2rem;
      text-align: center;
      color: var(--text-light);
      margin-top: 3rem;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="logo">TrialSage™</div>
    <nav class="nav">
      <a href="/">Home</a>
      <a href="/solutions">Solutions</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>
  
  <div class="container">
    <section class="hero">
      <h1>${route.title}</h1>
      <p>${route.description}</p>
    </section>
    
    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">🚀</div>
        <h3>Accelerate Workflows</h3>
        <p>Reduce time spent on regulatory documentation by up to 65% with AI-assisted tools and automation.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Data-Driven Insights</h3>
        <p>Leverage our database of 3,200+ clinical study reports to make informed decisions backed by historical data.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">✓</div>
        <h3>Compliance Confidence</h3>
        <p>Ensure regulatory compliance with built-in validation against the latest FDA, EMA, and global standards.</p>
      </div>
    </section>
    
    <div style="text-align: center;">
      <button class="cta">Schedule a Demo</button>
    </div>
  </div>
  
  <footer class="footer">
    <p>© 2025 TrialSage™ by Concept2Cure.AI. All rights reserved.</p>
    <p>The application is currently experiencing technical difficulties. Our team is working to restore full functionality.</p>
  </footer>
</body>
</html>`;
}