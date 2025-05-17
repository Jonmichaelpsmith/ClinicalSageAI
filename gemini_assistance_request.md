# Requesting Gemini 2.5 Pro's Help with Modal Conflict Issue

## Current Problem
In our regulatory medical document application TrialSage, we have a critical UI issue where the Document Intelligence interface conflicts with modal dialogs, specifically the FDA device selection modal. When the Document Intelligence tab is active, we need to completely block any other modals from appearing on top of it.

## Technical Details

### Application Structure
- Main component: `CERV2Page.jsx` (Clinical Evaluation Report Version 2 page)
- Problem component: `document-intelligence` tab section
- Modal that interferes: DeviceProfileSelector (controlled by `showProfileSelector` state)

### Current Implementation
When the Document Intelligence tab is active:
```jsx
else if (activeTab === 'document-intelligence') {
  // Import DocumentIntelligenceTab component
  const DocumentIntelligenceTab = lazy(() => import('../components/document-intelligence/DocumentIntelligenceTab'));
  
  // Attempt to prevent the profile selector
  if (showProfileSelector) {
    setShowProfileSelector(false);
  }
  
  // Render the document intelligence interface
  return (
    <div className="fixed inset-0 bg-gray-600/30 backdrop-blur-sm z-[999]">
      <div className="absolute inset-4 bg-white rounded-lg shadow-2xl overflow-auto">
        {/* Document Intelligence content */}
        <DocumentIntelligenceTab 
          regulatoryContext={documentType}
          deviceProfile={deviceProfile}
          onDeviceProfileUpdate={(updatedProfile) => {
            // Handle profile updates
          }}
        />
      </div>
    </div>
  );
}
```

### Problem Description
Despite setting `showProfileSelector` to false, the profile selector modal can still appear on top of the Document Intelligence interface. This breaks the user experience and prevents proper document processing.

### Failed Solutions Attempted

1. **CSS z-index approach**:
```jsx
<div className="fixed inset-0 z-[999]" style={{position: 'fixed'}}>
  {/* Document Intelligence content */}
</div>
```

2. **Dynamic style injection**:
```jsx
useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    [role="dialog"]:not(.document-intelligence) { 
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    const existingStyle = document.getElementById('style-id');
    if (existingStyle) existingStyle.remove();
  };
}, []);
```

3. **Portal approach**:
```jsx
import { createPortal } from 'react-dom';

// In render function
return createPortal(
  <div className="fixed inset-0 bg-black/40 z-[1000]">
    {/* Document Intelligence content */}
  </div>,
  document.body
);
```

## Constraints

1. All changes must be implemented exclusively within the CERV2Page.jsx component
2. The solution must preserve the professional UI appearance
3. The Document Intelligence interface must completely prevent any other modals from appearing
4. When closed, the solution must properly restore the original UI state

## Request for Help

We need a robust solution that ensures the Document Intelligence interface takes complete control over the UI when active, preventing any other modals from appearing on top of it. The solution should follow React best practices and be maintainable within our enterprise application.

Please provide a complete code solution that we can implement directly in the CERV2Page.jsx component to fix this critical modal conflict issue.

Thank you for your assistance.