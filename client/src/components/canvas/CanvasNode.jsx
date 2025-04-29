import React from 'react';

/**
 * CanvasNode component for rendering a draggable node in the canvas
 */
export const CanvasNode = ({ section, isSelected, onClick, onDragStart }) => {
  const statusClass = section.status || 'pending';
  
  const handleMouseDown = (e) => {
    if (onDragStart) {
      onDragStart(e, section);
    }
  };
  
  const handleClick = (e) => {
    if (onClick) {
      onClick(section, e);
    }
  };

  return (
    <div 
      className={`node node-${statusClass} ${isSelected ? 'selected' : ''}`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="node-badge">{section.id}</div>
      <div className="node-content">
        <div className="node-title">{section.title}</div>
        {section.subtitle && (
          <div className="node-subtitle">{section.subtitle}</div>
        )}
      </div>
    </div>
  );
};