import React, { useState, useEffect, useCallback, useRef } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import { CanvasNode } from './CanvasNode';
import { CanvasSidePanel } from './CanvasSidePanel';
import '../../styles/theme.css';
import './CanvasWorkbenchV2.css';

/**
 * Enhanced Canvas Workbench with better styling and interactions
 */
export default function CanvasWorkbenchV2() {
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [guidance, setGuidance] = useState('');
  const [snippets, setSnippets] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const { width, height } = useWindowSize();
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  
  // Load sections on mount
  useEffect(() => {
    fetch('/api/coauthor/sections')
      .then(res => res.json())
      .then(data => setSections(data))
      .catch(console.error);
  }, []);
  
  // Load guidance when section is selected
  useEffect(() => {
    if (!selected) {
      setGuidance('');
      return;
    }
    
    fetch('/api/coauthor/advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId: selected.id })
    })
      .then(res => res.json())
      .then(data => setGuidance(data.advice))
      .catch(err => {
        console.error(err);
        setGuidance('Failed to load guidance. Please try again.');
      });
      
    // Load section annotations as snippets
    fetch(`/api/coauthor/annotation/${selected.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.notes) {
          // Split notes by line breaks to create snippets
          const snippetList = data.notes.split('\n').filter(Boolean).map((text, idx) => ({
            id: `snip-${idx}`,
            text
          }));
          setSnippets(snippetList);
        } else {
          setSnippets([]);
        }
      })
      .catch(err => {
        console.error(err);
        setSnippets([]);
      });
  }, [selected]);

  // Handle drag start
  const handleDragStart = (e, section) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      id: section.id,
      startX: e.clientX,
      startY: e.clientY,
      section
    };
    
    // Add event listeners to handle drag on the whole document
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    const newX = dragRef.current.section.x + deltaX;
    const newY = dragRef.current.section.y + deltaY;
    
    // Update section position locally
    setSections(prevSections => 
      prevSections.map(sec => 
        sec.id === dragRef.current.id ? { ...sec, x: newX, y: newY } : sec
      )
    );
    
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!dragRef.current) return;
    
    // Save final position to server
    const { id } = dragRef.current;
    const section = sections.find(s => s.id === id);
    
    if (section) {
      fetch(`/api/coauthor/layout/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: section.x, y: section.y }),
      }).catch(console.error);
    }
    
    // Clean up
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleDragEnd);
    dragRef.current = null;
  }, [sections, handleMouseMove]);

  // Handle section click
  const handleSectionClick = (section) => {
    setSelected(section);
  };

  // Handle chat open
  const handleChatOpen = () => {
    alert('Open Ask Lumen AI chat with context from this section');
    // In a real implementation, this would open your chat component
  };

  // Close the side panel
  const handleCloseSidePanel = () => {
    setSelected(null);
  };

  return (
    <div className="canvas-workbench-v2">
      <div className="canvas-container">
        <div 
          ref={canvasRef}
          className={`nodes-area ${isDragging ? 'dragging' : ''}`}
        >
          {/* Nodes */}
          {sections.map(section => (
            <div
              key={section.id}
              className="node-wrapper"
              style={{
                position: 'absolute',
                top: section.y,
                left: section.x,
                transform: 'translate(0, 0)',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                zIndex: selected?.id === section.id ? 10 : 1
              }}
              onMouseDown={(e) => handleDragStart(e, section)}
            >
              <CanvasNode
                id={section.id}
                title={section.title}
                status={section.status}
                onClick={() => handleSectionClick(section)}
              />
            </div>
          ))}
          
          {/* Connections (simple div-based arrows) */}
          {sections.flatMap(sec =>
            sec.connections.map(toId => {
              const from = sections.find(s => s.id === sec.id);
              const to = sections.find(s => s.id === toId);
              
              if (!from || !to) return null;
              
              // Calculate distance and angle for the line
              const fromX = from.x + 120; // Node width
              const fromY = from.y + 25;  // Node height / 2
              const toX = to.x;
              const toY = to.y + 25; 
              
              const dx = toX - fromX;
              const dy = toY - fromY;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * 180 / Math.PI;
              
              return (
                <div 
                  key={`${sec.id}-${toId}`} 
                  className={`connection-line ${sec.status === 'critical' ? 'critical' : ''}`}
                  style={{
                    position: 'absolute',
                    top: fromY,
                    left: fromX,
                    width: length,
                    transformOrigin: 'left center',
                    transform: `rotate(${angle}deg)`,
                    zIndex: 0
                  }}
                />
              );
            })
          )}
        </div>
        
        {/* Side Panel */}
        {selected && (
          <CanvasSidePanel
            section={selected}
            guidance={guidance}
            snippets={snippets}
            onClose={handleCloseSidePanel}
            onChatOpen={handleChatOpen}
          />
        )}
      </div>
    </div>
  );
}