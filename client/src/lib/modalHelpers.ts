/**
 * Utility function to clean up lingering modal elements in the DOM
 * This helps prevent ghost elements from remaining when navigating between pages
 * or when tab changes occur within the application
 */
export function cleanupModals(): void {
  // Find and remove any modal backdrop elements that might be lingering
  const modalBackdrops = document.querySelectorAll('.modal-backdrop');
  modalBackdrops.forEach(element => {
    element.remove();
  });

  // Find and remove any orphaned modal elements
  const orphanedModals = document.querySelectorAll('.modal[aria-hidden="true"]');
  orphanedModals.forEach(element => {
    element.remove();
  });

  // Find any open modals and close them properly
  const openModals = document.querySelectorAll('.modal[aria-hidden="false"]');
  openModals.forEach(element => {
    // Add the hidden attribute to properly close any open modals
    element.setAttribute('aria-hidden', 'true');
    element.classList.add('hidden');
  });

  // Find and remove any floating overlay elements 
  const overlays = document.querySelectorAll('.overlay, .dialog-overlay');
  overlays.forEach(element => {
    element.remove();
  });

  // Clean up body classes that might have been added by modal components
  document.body.classList.remove('modal-open', 'overflow-hidden');
  
  // Ensure body scrolling is restored
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}
