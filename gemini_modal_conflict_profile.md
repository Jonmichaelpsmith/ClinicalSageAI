# Modal Conflict Issue in React Medical App: Help Request for Gemini 2.5 Pro

## Problem Profile

**Application**: TrialSage™ - A regulatory document management platform for medical device submissions  
**Component**: CERV2Page.jsx (Clinical Evaluation Report v2)  
**Issue Type**: UI Modal Conflict  
**Framework**: React with Shadcn/UI components  
**Styling**: Tailwind CSS  

## Issue Description

When a user activates the Document Intelligence tab in our application, we're facing a critical UI error where other modals (specifically the FDA device selection modal) can still appear on top of it, creating a confusing UI state where two interfaces are visible and interactive simultaneously.

The Document Intelligence interface is supposed to be a focused, full-screen experience that allows users to process regulatory documents. No other modals should be able to appear while it's active.

## Technical Deep Dive

### Component Structure

The main state controlling the Document Intelligence tab:
```jsx
const [activeTab, setActiveTab] = useState('device'); // Can be 'device', 'document-intelligence', etc.
```

The state controlling the problematic device selection modal:
```jsx
const [showProfileSelector, setShowProfileSelector] = useState(!deviceProfile);
```

Current implementation of the Document Intelligence tab section:
```jsx
else if (activeTab === 'document-intelligence') {
  // Import the DocumentIntelligenceTab component only when needed
  const DocumentIntelligenceTab = lazy(() => import('../components/document-intelligence/DocumentIntelligenceTab'));
  
  // Attempt to prevent profile selector - THIS DOESN'T WORK
  if (showProfileSelector) {
    setShowProfileSelector(false);
  }
  
  return (
    <div className="fixed inset-0 bg-gray-600/30 backdrop-blur-sm z-[999]" style={{position: 'fixed'}}>
      <div className="absolute inset-4 bg-white rounded-lg shadow-2xl overflow-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Document Intelligence</h2>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setActiveTab('device')}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-4 overflow-auto">
          <Suspense fallback={<LoadingIndicator />}>
            <DocumentIntelligenceTab 
              regulatoryContext={documentType}
              deviceProfile={deviceProfile}
              onDeviceProfileUpdate={(updatedProfile) => {
                /* Update logic here */
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

### Previous Failed Attempts

#### Attempt 1: Using CSS z-index and positioning
```jsx
<div className="fixed inset-0 z-[999]" style={{position: 'fixed'}}>
  {/* Document Intelligence content */}
</div>
```
Result: The device modal still appears on top.

#### Attempt 2: Dynamic style injection to forcibly hide modals
```jsx
useEffect(() => {
  const style = document.createElement('style');
  style.textContent = `
    [role="dialog"]:not(.document-intelligence-container) { 
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  
  return () => style.remove();
}, []);
```
Result: Style doesn't consistently apply to dynamically created modals.

#### Attempt 3: Using React Portal and document.body.style modifications
```jsx
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = '';
  };
}, []);
```
Result: Body scrolling is disabled but modals still appear.

## Solution Requirements

1. A robust solution that completely prevents any other modals from appearing while the Document Intelligence tab is active
2. Clean implementation contained within the CERV2Page.jsx component only (enterprise constraint)
3. Professional UI appearance that maintains the existing design language
4. Proper cleanup when the Document Intelligence tab is closed
5. Accessible UI that follows ARIA best practices

## Technical Constraints

1. Cannot modify other components outside of CERV2Page.jsx
2. Cannot install additional libraries
3. Must work with React 18+ and follow React best practices
4. Should avoid direct DOM manipulation when possible, but can use it if necessary as a last resort

## What We Need from Gemini 2.5 Pro

We need a complete, production-ready code solution for the `activeTab === 'document-intelligence'` section of CERV2Page.jsx that fully resolves this modal conflict issue. The solution should be robust and handle edge cases, with clear explanations of how and why it works.

Expertise in complex React rendering, modal management, and UI isolation would be particularly valuable.

Thank you for your assistance.