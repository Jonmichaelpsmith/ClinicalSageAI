# Request for Help: Document Intelligence UI Modal Conflict in TrialSage

I'm working on a critical UI issue in a React medical regulatory application called TrialSage. The problem involves a modal conflict between the Document Intelligence component and the FDA device selection modal.

## Project Overview
- **Application**: TrialSage - a regulatory document management platform for clinical trials and FDA submissions
- **Issue Component**: CERV2Page.jsx (Clinical Evaluation Report V2 page) and DocumentIntelligenceTab components
- **Technology**: React with Shadcn/UI components, tailwind CSS

## The Problem
When a user activates the Document Intelligence tab/mode, the FDA device selection modal can appear on top of it, creating a UI conflict where both interfaces are visible simultaneously and interfere with each other. The Document Intelligence interface should either completely block any other modals or be isolated from them.

## What I've Tried (and Failed With)

### Attempt 1: Using CSS z-index and positioning
I tried creating a higher z-index container with fixed positioning for the document intelligence component, but the modal still appears on top.

```jsx
<div className="fixed inset-0 z-[999]" style={{position: 'fixed'}}>
  <div className="absolute inset-4 bg-white rounded-lg shadow-2xl">
    {/* Document Intelligence Content */}
  </div>
</div>
```

### Attempt 2: Dynamic style injection to hide modals
I tried creating a style element that forcibly hides other modals when the document intelligence tab is active:

```jsx
useEffect(() => {
  const style = document.createElement('style');
  style.id = 'document-intelligence-modal-fix';
  style.innerHTML = `
    [role="dialog"]:not(.document-intelligence-container) { 
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    const existingStyle = document.getElementById('document-intelligence-modal-fix');
    if (existingStyle) existingStyle.remove();
  };
}, []);
```

### Attempt 3: React Portals
I tried using React's createPortal to render the document intelligence UI into a different DOM node, but couldn't get it working correctly with the existing components.

## Specific Requirements
1. The solution must be implemented only within the CERV2Page.jsx component (enterprise constraints)
2. The Document Intelligence tab must completely prevent any other modals from appearing on top of it
3. When the user closes the Document Intelligence tab, they should return to the regular device view
4. The UI must remain professional and match the existing enterprise software design

## Component Structure
- CERV2Page.jsx: The main container component that renders different tabs including 'document-intelligence'
- DocumentIntelligenceTab.jsx: The component that handles document processing
- DeviceProfileSelector.jsx: The problematic modal component that conflicts with the document intelligence UI

Can you help me solve this modal conflict issue with clean, production-ready code that will work in a React enterprise application? I need a complete solution for the modal conflict specifically, not a redesign of the entire document intelligence system.