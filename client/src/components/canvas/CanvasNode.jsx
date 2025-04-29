import React from 'react';

/**
 * CanvasNode - Renders a single node in the Canvas Workbench
 * This component visualizes a section/module within the submission structure
 */
export function CanvasNode({ 
  id, 
  title, 
  status = 'pending', 
  x, 
  y, 
  isSelected, 
  onClick 
}) {
  // Determine status-based styling
  let statusColor = '#ffc107'; // Default: yellow/pending
  
  if (status === 'complete') {
    statusColor = '#28a745'; // Green
  } else if (status === 'critical') {
    statusColor = '#dc3545'; // Red
  }
  
  // Calculate container's overall styles
  const nodeStyle = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: '120px',
    height: '50px',
    backgroundColor: status === 'complete' ? '#daf5e8' : status === 'critical' ? '#fde2e2' : '#fff4ce',
    borderRadius: '4px',
    boxShadow: isSelected 
      ? '0 0 0 2px var(--color-primary, #5c4dff), 0 2px 8px rgba(0, 0, 0, 0.1)'
      : '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: '1px solid #666',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#333',
    userSelect: 'none',
    zIndex: isSelected ? 10 : 1
  };
  
  // Status indicator (left border)
  const statusIndicatorStyle = {
    width: '4px',
    height: '50px',
    backgroundColor: statusColor,
    position: 'absolute',
    left: 0,
    top: 0
  };
  
  // Badge with section ID
  const badgeStyle = {
    position: 'absolute',
    left: '-5px',
    top: '-5px',
    backgroundColor: 'var(--color-primary, #5c4dff)',
    color: '#fff',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: 'bold',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    zIndex: 1
  };
  
  // Title text
  const titleStyle = {
    marginLeft: '30px',
    padding: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '80px'
  };
  
  return (
    <div 
      style={nodeStyle}
      onClick={(e) => onClick && onClick(e)}
      onMouseDown={(e) => e.stopPropagation()} // Prevent canvas drag when clicking node
    >
      <div style={statusIndicatorStyle}></div>
      <div style={badgeStyle}>{id}</div>
      <div style={titleStyle}>{title}</div>
    </div>
  );
}