// This script forces an immediate redirect to the dashboard
// It runs before React even loads to ensure you always get to the dashboard
(function() {
  // Redirect to dashboard immediately
  window.location.href = '/dashboard';
})();