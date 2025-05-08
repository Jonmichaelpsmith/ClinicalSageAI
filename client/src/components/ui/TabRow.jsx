import React from 'react';

/**
 * TabRow Component
 * 
 * Creates a horizontally scrollable container for tabs that prevents wrapping
 * and overlapping even on small screens.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Tab triggers to display in the row
 * @param {string} props.label - Optional label to display before tabs
 * @param {string} props.className - Additional CSS classes
 */
export default function TabRow({ children, label, className = '' }) {
  return (
    <div className={`border-b border-[#E1DFDD] mb-2 ${className}`}>
      <div className="flex overflow-x-auto whitespace-nowrap px-6 py-1">
        {label && (
          <div className="flex items-center mr-3 flex-shrink-0">
            <span className="text-xs font-medium text-[#605E5C]">{label}</span>
          </div>
        )}
        {React.Children.map(children, child => 
          child ? React.cloneElement(child, { 
            className: `${child.props.className || ''} flex-shrink-0`
          }) : null
        )}
      </div>
    </div>
  );
}