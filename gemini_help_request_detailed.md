# Help Request: Fix Modal Conflict in React Medical App

I'm struggling with a critical UI issue in our regulatory document management platform for medical device submissions. I need help with a clean, optimized solution that follows React best practices.

## The Problem
When a user clicks on the Document Intelligence tab, it should open a full-screen interface that lets them analyze regulatory documents. However, there's a critical bug where the FDA device selection modal can appear on top of this interface, creating a UI conflict that breaks the user experience.

Both components try to take over the screen but end up creating a broken transparency effect where elements from both interfaces are visible and interactive at the same time.

## Technical Details
- Main component: `CERV2Page.jsx` (Clinical Evaluation Report v2)
- Problematic tab: `document-intelligence`
- Conflict components: `DocumentIntelligenceTab` and `DeviceProfileSelector`
- UI library: Shadcn/UI with Tailwind CSS

## What I've Tried

### Attempt 1: CSS z-index
```jsx
// Failed attempt with z-index
<div className="fixed inset-0 z-[999]">
  <DocumentIntelligenceTab />
</div>
```

### Attempt 2: Dynamic CSS injection
```jsx
// Failed attempt with style injection
useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    [role="dialog"]:not(.document-intelligence) { 
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    if (style.parentNode) style.parentNode.removeChild(style);
  };
}, []);
```

### Attempt 3: Full-screen modal dialog
```jsx
// Failed attempt with modal dialog
<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]">
  <div className="absolute inset-4 bg-white rounded-xl shadow-2xl">
    <DocumentIntelligenceTab />
  </div>
</div>
```

## Code Context
The relevant section of `CERV2Page.jsx` is:

```jsx
else if (activeTab === 'document-intelligence') {
  // Import the DocumentIntelligenceTab component only when needed
  const DocumentIntelligenceTab = lazy(() => import('../components/document-intelligence/DocumentIntelligenceTab'));
  
  // Force close any profile selectors to prevent modal conflicts - THIS DOESN'T WORK
  if (showProfileSelector) {
    setShowProfileSelector(false);
  }
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm z-[999]" style={{position: 'fixed'}}>
      <div className="absolute inset-4 bg-white rounded-lg shadow-2xl">
        <DocumentIntelligenceTab 
          regulatoryContext={documentType}
          deviceProfile={deviceProfile}
          onDeviceProfileUpdate={(updatedProfile) => {
            if (updatedProfile) {
              setDeviceProfile(updatedProfile);
              saveState('deviceProfile', updatedProfile);
              toast({
                title: "Device Profile Updated",
                description: "Document data applied to profile",
                variant: "success"
              });
            }
          }}
        />
      </div>
    </div>
  );
}
```

The DeviceProfileSelector is controlled by:
```jsx
const [showProfileSelector, setShowProfileSelector] = useState(!deviceProfile);

// Handle device profile selection
const handleProfileSelect = (selectedProfile) => {
  setDeviceProfile(selectedProfile);
  setShowProfileSelector(false);
};
```

## Requirements for the Solution
1. Must completely prevent the device selection modal from appearing while document intelligence is active
2. Must clean up properly when the document intelligence component is closed
3. Must follow React best practices and maintain professional UI appearance
4. The solution must be implemented only in CERV2Page.jsx (enterprise constraint)
5. UI components should have proper ARIA attributes for accessibility

## Please Help!
I need a robust, clean solution that can handle this modal conflict without introducing new bugs. If you can provide a complete code solution that I can implement directly, it would be incredibly helpful. Please include any explanations about why your solution works, so I can understand and maintain it in the future.

Thank you so much for your help!