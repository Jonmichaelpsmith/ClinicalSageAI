// This script provides direct access to modules
// It only redirects if you're on the root path '/'
(function() {
  // Only redirect if we're at the root path
  if (window.location.pathname === '/') {
    // Redirect to client portal instead of dashboard
    window.location.href = '/client-portal';
  }
})();