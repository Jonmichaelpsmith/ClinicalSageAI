import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Safe Icon Mapper
 * 
 * This utility safely maps icons from icon libraries and provides fallbacks
 * to prevent UI crashes when icons are missing or fail to import.
 */

// Default fallback icon (Question mark)
const FallbackIcon = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/**
 * Creates a safe version of an icon that won't crash the application
 * if the icon doesn't exist or fails to render
 * 
 * @param {string} iconName - Name of the icon to use
 * @param {Object} iconLibrary - The icon library to pull from (default: Lucide)
 * @param {Object} props - Props to pass to the icon component
 * @returns {JSX.Element} The icon component or a fallback
 */
export const getSafeIcon = (iconName, iconLibrary = LucideIcons, props = {}) => {
  if (!iconName) {
    console.warn('Icon name not provided to getSafeIcon');
    return <FallbackIcon {...props} />;
  }

  try {
    // Check if the icon exists in the library
    const IconComponent = iconLibrary[iconName];
    
    if (!IconComponent) {
      console.warn(`Icon "${iconName}" not found in the provided library`);
      return <FallbackIcon {...props} />;
    }
    
    return <IconComponent {...props} />;
  } catch (error) {
    console.error(`Error rendering icon "${iconName}":`, error);
    return <FallbackIcon {...props} />;
  }
};

/**
 * Maps an array of icon names to their components, providing fallbacks for any that don't exist
 * 
 * @param {string[]} iconNames - Array of icon names to map
 * @param {Object} iconLibrary - Icon library to use (default: Lucide)
 * @returns {Object} Object with icon components mapped by name
 */
export const mapSafeIcons = (iconNames, iconLibrary = LucideIcons) => {
  if (!Array.isArray(iconNames)) {
    console.warn('iconNames must be an array');
    return {};
  }
  
  return iconNames.reduce((acc, iconName) => {
    acc[iconName] = getSafeIcon(iconName, iconLibrary);
    return acc;
  }, {});
};

/**
 * Returns a common set of safe icons used throughout the application
 * 
 * @returns {Object} Object containing commonly used icon components
 */
export const getCommonIcons = () => {
  const commonIconNames = [
    'ArrowRight',
    'ChevronDown',
    'ChevronUp',
    'FileText',
    'Search',
    'Settings',
    'User',
    'AlertTriangle',
    'CheckCircle',
    'X',
    'Menu',
    'Home',
    'List',
    'Calendar',
    'Clock',
    'Trash',
    'Edit',
    'Download',
    'Upload',
    'ExternalLink',
    'Database',
    'LayoutDashboard',
    'FileCheck',
    'BarChart3',
    'Shield',
    'Sparkles',
  ];
  
  return mapSafeIcons(commonIconNames);
};

/**
 * HOC that wraps a component to provide safe icon access
 * 
 * @param {React.ComponentType} Component - Component to wrap
 * @returns {React.ComponentType} Wrapped component with safe icon handling
 */
export const withSafeIcons = (Component) => {
  const WithSafeIcons = (props) => {
    const safeIcons = getCommonIcons();
    return <Component {...props} safeIcons={safeIcons} />;
  };
  
  WithSafeIcons.displayName = `WithSafeIcons(${Component.displayName || Component.name || 'Component'})`;
  return WithSafeIcons;
};