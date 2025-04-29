import React, { useState, useEffect, useCallback, useRef } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import { CanvasNode } from './CanvasNode';
import { CanvasSidePanel } from './CanvasSidePanel';
import '../../styles/theme.css';
import './CanvasWorkbenchV2.css';

/**
 * Enhanced Canvas Workbench with better styling and interactions
 */
export default function CanvasWorkbenchV2({ onNodeClick }) {
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [guidance, setGuidance] = useState('');
  const [snippets, setSnippets] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selection, setSelection] = useState([]);
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
  const handleSectionClick = (section, e) => {
    // If Ctrl/Cmd key is pressed, add to selection
    if (e && (e.ctrlKey || e.metaKey)) {
      if (selection.includes(section.id)) {
        setSelection(selection.filter(id => id !== section.id));
      } else {
        setSelection([...selection, section.id]);
      }
    } else {
      // Otherwise just select this section
      setSelected(section);
      setSelection([section.id]);
      
      // Call the onNodeClick handler if provided
      if (onNodeClick) {
        onNodeClick(section);
      }
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection.length > 0) {
        // This is just a UI deletion, not affecting the server data in this demo
        setSections(sections.filter(s => !selection.includes(s.id)));
        setSelection([]);
        setSelected(null);
      }
      
      // Arrow key nudging for selected node
      if (selection.length === 1) {
        const step = 10;
        const sectionId = selection[0];
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          
          setSections(sections.map(section => {
            if (section.id !== sectionId) return section;
            
            let { x, y } = section;
            if (e.key === 'ArrowUp') y -= step;
            if (e.key === 'ArrowDown') y += step;
            if (e.key === 'ArrowLeft') x -= step;
            if (e.key === 'ArrowRight') x += step;
            
            // Update on server
            fetch(`/api/coauthor/layout/${sectionId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ x, y }),
            }).catch(console.error);
            
            return { ...section, x, y };
          }));
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sections, selection]);

  // Handle chat open
  const handleChatOpen = () => {
    alert('Open Ask Lumen AI chat with context from this section');
    // In a real implementation, this would open your chat component
  };

  // Close the side panel
  const handleCloseSidePanel = () => {
    setSelected(null);
  };

  // Export canvas as SVG
  const exportToSVG = () => {
    if (!canvasRef.current) return;
    
    // Create an SVG element
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    
    // Set SVG attributes - get size from canvas
    const rect = canvasRef.current.getBoundingClientRect();
    svg.setAttribute("width", rect.width.toString());
    svg.setAttribute("height", rect.height.toString());
    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    
    // Add background
    const bg = document.createElementNS(ns, "rect");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", "#f7f8fa");
    svg.appendChild(bg);
    
    // Add grid (simplified)
    for (let x = 0; x < rect.width; x += 50) {
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", x.toString());
      line.setAttribute("y1", "0");
      line.setAttribute("x2", x.toString());
      line.setAttribute("y2", rect.height.toString());
      line.setAttribute("stroke", "rgba(0,0,0,0.05)");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }
    
    for (let y = 0; y < rect.height; y += 50) {
      const line = document.createElementNS(ns, "line");
      line.setAttribute("x1", "0");
      line.setAttribute("y1", y.toString());
      line.setAttribute("x2", rect.width.toString());
      line.setAttribute("y2", y.toString());
      line.setAttribute("stroke", "rgba(0,0,0,0.05)");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }
    
    // Add connections as lines
    sections.forEach(sec => {
      if (!sec.connections || sec.connections.length === 0) return;
      
      sec.connections.forEach(toId => {
        const from = sections.find(s => s.id === sec.id);
        const to = sections.find(s => s.id === toId);
        
        if (!from || !to) return;
        
        const fromX = from.x + 120; // Node width
        const fromY = from.y + 25;  // Node height / 2
        const toX = to.x;
        const toY = to.y + 25;
        
        // Create line
        const line = document.createElementNS(ns, "line");
        line.setAttribute("x1", fromX.toString());
        line.setAttribute("y1", fromY.toString());
        line.setAttribute("x2", toX.toString());
        line.setAttribute("y2", toY.toString());
        line.setAttribute("stroke", sec.status === 'critical' ? "#dc3545" : "#888");
        line.setAttribute("stroke-width", sec.status === 'critical' ? "3" : "2");
        
        // Add to SVG
        svg.appendChild(line);
        
        // Add label in middle
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        
        const label = document.createElementNS(ns, "text");
        label.setAttribute("x", midX.toString());
        label.setAttribute("y", midY.toString());
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "#444");
        label.setAttribute("font-size", "12");
        label.textContent = "Dependency";
        
        // Add to SVG
        svg.appendChild(label);
      });
    });
    
    // Add nodes as rectangles with text
    sections.forEach(section => {
      // Create group for node
      const g = document.createElementNS(ns, "g");
      g.setAttribute("transform", `translate(${section.x}, ${section.y})`);
      
      // Create node rectangle
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("width", "120");
      rect.setAttribute("height", "50");
      rect.setAttribute("rx", "4");
      
      // Set fill based on status
      let fill = "#fff4ce"; // default (pending)
      if (section.status === 'complete') fill = "#daf5e8";
      if (section.status === 'critical') fill = "#fde2e2";
      rect.setAttribute("fill", fill);
      
      // Add border
      rect.setAttribute("stroke", "#666");
      rect.setAttribute("stroke-width", "1");
      
      // Add left border based on status
      const leftBorder = document.createElementNS(ns, "rect");
      leftBorder.setAttribute("width", "4");
      leftBorder.setAttribute("height", "50");
      
      // Set color based on status
      let borderColor = "#ffc107"; // default (pending)
      if (section.status === 'complete') borderColor = "#28a745";
      if (section.status === 'critical') borderColor = "#dc3545";
      leftBorder.setAttribute("fill", borderColor);
      
      // Create badge with ID
      const badge = document.createElementNS(ns, "g");
      
      const badgeRect = document.createElementNS(ns, "rect");
      badgeRect.setAttribute("x", "-5");
      badgeRect.setAttribute("y", "-5");
      badgeRect.setAttribute("width", "30");
      badgeRect.setAttribute("height", "20");
      badgeRect.setAttribute("rx", "4");
      badgeRect.setAttribute("fill", "var(--color-primary, #5c4dff)");
      
      const badgeText = document.createElementNS(ns, "text");
      badgeText.setAttribute("x", "10");
      badgeText.setAttribute("y", "8");
      badgeText.setAttribute("text-anchor", "middle");
      badgeText.setAttribute("font-size", "10");
      badgeText.setAttribute("fill", "#fff");
      badgeText.textContent = section.id;
      
      badge.appendChild(badgeRect);
      badge.appendChild(badgeText);
      
      // Create label text
      const text = document.createElementNS(ns, "text");
      text.setAttribute("x", "30");
      text.setAttribute("y", "30");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", "#333");
      text.textContent = section.title;
      
      // Add all elements to group
      g.appendChild(rect);
      g.appendChild(leftBorder);
      g.appendChild(badge);
      g.appendChild(text);
      
      // Add group to SVG
      svg.appendChild(g);
    });
    
    // Convert to string and create download link
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ctd-canvas.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="canvas-workbench-v2">
      {/* Export button */}
      <button 
        className="export-button" 
        onClick={exportToSVG}
        title="Export as SVG"
      >
        Export SVG
      </button>
      
      <div className="canvas-container">
        <div 
          ref={canvasRef}
          className={`nodes-area ${isDragging ? 'dragging' : ''}`}
        >
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
              
              // Calculate midpoint for label
              const midX = fromX + (dx / 2);
              const midY = fromY + (dy / 2);
              
              return (
                <React.Fragment key={`${sec.id}-${toId}`}>
                  <div 
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
                  <div 
                    className="connection-label"
                    style={{
                      position: 'absolute',
                      top: midY - 10,
                      left: midX,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1
                    }}
                  >
                    Dependency
                  </div>
                </React.Fragment>
              );
            })
          )}
          
          {/* Nodes */}
          {sections.map(section => (
            <div
              key={section.id}
              className={`node-wrapper ${selection.includes(section.id) ? 'selected' : ''}`}
              style={{
                position: 'absolute',
                top: section.y,
                left: section.x,
                transform: 'translate(0, 0)',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                zIndex: selected?.id === section.id ? 10 : 1
              }}
              onMouseDown={(e) => handleDragStart(e, section)}
              onClick={(e) => handleSectionClick(section, e)}
            >
              <CanvasNode
                id={section.id}
                title={section.title}
                status={section.status}
              />
            </div>
          ))}
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
      
      {/* Keyboard shortcuts info */}
      <div className="keyboard-shortcuts">
        <div className="keyboard-shortcut">
          <kbd>Delete</kbd> - Remove selected
        </div>
        <div className="keyboard-shortcut">
          <kbd>↑↓←→</kbd> - Move selected
        </div>
        <div className="keyboard-shortcut">
          <kbd>Ctrl</kbd> + Click - Multi-select
        </div>
      </div>
    </div>
  );
}