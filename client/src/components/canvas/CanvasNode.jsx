import React from 'react';
import './CanvasNode.css';

export function CanvasNode({ id, title, status, onClick }) {
  // status: "complete" | "pending" | "critical"
  return (
    <div className={`canvas-node ${status}`} onClick={onClick}>
      <div className="node-badge">{id}</div>
      <div className="node-label">{title}</div>
    </div>
  );
}