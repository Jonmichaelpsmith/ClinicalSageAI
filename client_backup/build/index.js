// This is a minimal client-side script file for the build folder
// In a production build, this would be replaced by compiled React code

document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  
  // Basic client-side routing
  const currentPath = window.location.pathname;
  
  if (currentPath.startsWith('/client-portal')) {
    renderClientPortal();
  } else if (currentPath.startsWith('/ind-wizard')) {
    renderModulePage('IND Wizard™', 'Create FDA-compliant INDs with automated form generation');
  } else if (currentPath.startsWith('/cer-generator')) {
    renderModulePage('CER Generator™', 'Create EU MDR 2017/745 Clinical Evaluation Reports');
  } else if (currentPath.startsWith('/cmc-wizard')) {
    renderModulePage('CMC Wizard™', 'Chemistry, Manufacturing, and Controls documentation');
  } else if (currentPath.startsWith('/csr-analyzer')) {
    renderModulePage('CSR Analyzer™', 'AI-powered Clinical Study Report analysis');
  } else if (currentPath.startsWith('/vault')) {
    renderModulePage('TrialSage Vault™', 'Secure document storage with intelligent retrieval');
  } else if (currentPath.startsWith('/study-architect')) {
    renderModulePage('Study Architect™', 'Protocol development with regulatory intelligence');
  } else if (currentPath.startsWith('/analytics')) {
    renderModulePage('Analytics Dashboard', 'Metrics and insights on regulatory performance');
  }
  
  // Render a placeholder module page
  function renderModulePage(title, description) {
    root.innerHTML = `
      <div class="min-h-screen">
        <header class="bg-indigo-700 text-white p-4 shadow-md">
          <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold">TrialSage™</h1>
            <nav>
              <ul class="flex space-x-4">
                <li><a href="/client-portal" class="hover:underline">Client Portal</a></li>
                <li><a href="/ind-wizard" class="hover:underline">IND Wizard</a></li>
                <li><a href="/vault" class="hover:underline">Vault</a></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main class="container mx-auto flex-grow p-6">
          <a href="/client-portal" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Client Portal
          </a>
          
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-3xl font-bold text-indigo-700 mb-2">${title}</h2>
            <p class="text-gray-600 mb-6">${description}</p>
            
            <div class="bg-indigo-50 p-4 rounded-lg text-center">
              <p>This is a placeholder for the ${title} module.</p>
              <p class="text-sm text-gray-500 mt-2">The full implementation will be available in the production release.</p>
            </div>
          </div>
        </main>
        
        <footer class="bg-gray-800 text-white p-4 mt-auto">
          <div class="container mx-auto text-center">
            <p>&copy; 2025 TrialSage™ by Concept2Cures. All rights reserved.</p>
          </div>
        </footer>
      </div>
    `;
  }
  
  // Render the client portal
  function renderClientPortal() {
    // This would normally be handled by React
    // For this static build, we'll just display a message to demonstrate the routing
    root.innerHTML = `
      <div class="min-h-screen">
        <header class="bg-indigo-700 text-white p-4 shadow-md">
          <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold">TrialSage™</h1>
            <nav>
              <ul class="flex space-x-4">
                <li><a href="/client-portal" class="hover:underline">Client Portal</a></li>
                <li><a href="/ind-wizard" class="hover:underline">IND Wizard</a></li>
                <li><a href="/vault" class="hover:underline">Vault</a></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main class="container mx-auto flex-grow p-6">
          <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-3xl font-bold text-indigo-700 mb-4">Client Portal</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <a href="/ind-wizard" class="bg-indigo-50 rounded-lg p-6 shadow hover:shadow-md transition">
                <h3 class="text-xl font-semibold text-indigo-700 mb-3">IND Wizard™</h3>
                <p class="text-gray-700">FDA-compliant INDs with automated form generation</p>
              </a>
              
              <a href="/cer-generator" class="bg-indigo-50 rounded-lg p-6 shadow hover:shadow-md transition">
                <h3 class="text-xl font-semibold text-indigo-700 mb-3">CER Generator™</h3>
                <p class="text-gray-700">EU MDR 2017/745 Clinical Evaluation Reports</p>
              </a>
              
              <a href="/cmc-wizard" class="bg-indigo-50 rounded-lg p-6 shadow hover:shadow-md transition">
                <h3 class="text-xl font-semibold text-indigo-700 mb-3">CMC Wizard™</h3>
                <p class="text-gray-700">Chemistry, Manufacturing, and Controls documentation</p>
              </a>
              
              <a href="/csr-analyzer" class="bg-indigo-50 rounded-lg p-6 shadow hover:shadow-md transition">
                <h3 class="text-xl font-semibold text-indigo-700 mb-3">CSR Analyzer™</h3>
                <p class="text-gray-700">AI-powered Clinical Study Report analysis</p>
              </a>
              
              <a href="/vault" class="bg-indigo-50 rounded-lg p-6 shadow hover:shadow-md transition">
                <h3 class="text-xl font-semibold text-indigo-700 mb-3">TrialSage Vault™</h3>
                <p class="text-gray-700">Secure document storage with intelligent retrieval</p>
              </a>
              
              <a href="/study-architect" class="bg-indigo-50 rounded-lg p-6 shadow hover:shadow-md transition">
                <h3 class="text-xl font-semibold text-indigo-700 mb-3">Study Architect™</h3>
                <p class="text-gray-700">Protocol development with regulatory intelligence</p>
              </a>
              
              <a href="/analytics" class="bg-indigo-50 rounded-lg p-6 shadow hover:shadow-md transition">
                <h3 class="text-xl font-semibold text-indigo-700 mb-3">Analytics Dashboard</h3>
                <p class="text-gray-700">Metrics and insights on regulatory performance</p>
              </a>
            </div>
          </div>
        </main>
        
        <footer class="bg-gray-800 text-white p-4">
          <div class="container mx-auto text-center">
            <p>&copy; 2025 TrialSage™ by Concept2Cures. All rights reserved.</p>
          </div>
        </footer>
      </div>
    `;
  }
});