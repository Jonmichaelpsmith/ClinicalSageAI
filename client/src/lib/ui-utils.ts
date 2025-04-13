
/**
 * Utility function to apply compact styling across the application
 */
export function applyCompactStyling() {
  // Apply compact styling to all cards
  const cards = document.querySelectorAll('.bg-white.shadow, .bg-white.border, .card');
  cards.forEach(card => {
    if (!card.classList.contains('compact-card')) {
      card.classList.add('compact-card');
    }
  });
  
  // Apply compact styling to all section headers
  const headers = document.querySelectorAll('.card-header, h2, h3');
  headers.forEach(header => {
    if (!header.classList.contains('compact-card-header') && !header.classList.contains('text-2xl')) {
      header.classList.add('compact-card-header');
    }
  });
  
  // Apply compact styling to all grids
  const grids = document.querySelectorAll('.grid, .grid-cols-1, .grid-cols-2, .grid-cols-3');
  grids.forEach(grid => {
    if (!grid.classList.contains('compact-grid')) {
      grid.classList.add('compact-grid');
    }
  });
  
  // Apply compact styling to all tables
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    if (!table.classList.contains('compact-table')) {
      table.classList.add('compact-table');
    }
  });
  
  // Make forms more compact
  const formGroups = document.querySelectorAll('.form-group, .space-y-4, .space-y-6');
  formGroups.forEach(group => {
    if (!group.classList.contains('compact-form-group')) {
      group.classList.replace('space-y-4', 'space-y-2');
      group.classList.replace('space-y-6', 'space-y-3');
      group.classList.add('compact-form-group');
    }
  });
}
