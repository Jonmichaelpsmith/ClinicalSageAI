// Landing Page Rebuilder Script for TrialSage™
// This script adds comprehensive content and fixes mobile issues

document.addEventListener('DOMContentLoaded', function() {
  // Fix mobile menu functionality
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function() {
      mobileMenu.classList.add('active');
      document.body.classList.add('mobile-menu-active');
    });
  }
  
  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      document.body.classList.remove('mobile-menu-active');
    });
  }
  
  // Add click handlers for all mobile dropdowns
  const mobileDropdowns = document.querySelectorAll('.mobile-dropdown-toggle');
  if (mobileDropdowns) {
    mobileDropdowns.forEach(dropdown => {
      dropdown.addEventListener('click', function() {
        this.parentElement.classList.toggle('active');
      });
    });
  }
  
  // Initialize feature tabs if they exist
  const featureTabs = document.querySelectorAll('.feature-category');
  if (featureTabs.length > 0) {
    featureTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs
        featureTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Show corresponding content
        const categoryId = this.getAttribute('data-category');
        const allContent = document.querySelectorAll('.feature-category-content');
        
        allContent.forEach(content => {
          content.classList.remove('active');
        });
        
        document.getElementById(categoryId).classList.add('active');
      });
    });
  }
  
  // Initialize AOS animations if AOS is loaded
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }
  
  console.log('TrialSage landing page enhancements loaded successfully');
});