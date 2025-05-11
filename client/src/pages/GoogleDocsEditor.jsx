import React, { useState, useEffect, useRef } from 'react';
import { 
  Expand, 
  Save, 
  Download, 
  Upload,
  FileText, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tooltip } from '../components/ui/tooltip';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const GoogleDocsEditor = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);
  const editorContainerRef = useRef(null);
  const { toast } = useToast();

  // Simulated Google authentication check
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // In a real implementation, you would check if the user is authenticated with Google
        // For now, we'll simulate this with a timeout
        setTimeout(() => {
          setIsAuthenticated(true);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Handle toggling fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (editorContainerRef.current.requestFullscreen) {
        editorContainerRef.current.requestFullscreen();
      } else if (editorContainerRef.current.mozRequestFullScreen) {
        editorContainerRef.current.mozRequestFullScreen();
      } else if (editorContainerRef.current.webkitRequestFullscreen) {
        editorContainerRef.current.webkitRequestFullscreen();
      } else if (editorContainerRef.current.msRequestFullscreen) {
        editorContainerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events from the browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement || 
        document.mozFullScreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleSaveDocument = () => {
    toast({
      title: "Document Saved",
      description: "Your document has been saved to Google Drive",
      status: "success",
    });
  };

  const handleSaveToVault = () => {
    toast({
      title: "Saved to VAULT",
      description: "Document has been saved to VAULT system",
      status: "success",
    });
  };

  const handleExportDocument = () => {
    toast({
      title: "Document Exported",
      description: "Your document has been exported as PDF",
      status: "success",
    });
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <Card className="w-full max-w-md p-6 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-blue-600" />
          <h2 className="text-2xl font-bold mb-4">Google Authentication Required</h2>
          <p className="mb-6 text-gray-600">
            Please sign in with your Google account to access the document editor.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/auth/google'} 
            className="w-full"
          >
            Sign in with Google
          </Button>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <h2 className="text-xl font-medium">Loading editor...</h2>
      </div>
    );
  }

  return (
    <div 
      ref={editorContainerRef}
      className={`flex flex-col ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-64px)]'} overflow-hidden`}
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-blue-600 mr-2" />
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="border-none focus:outline-none text-lg font-medium"
          />
          <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" /> Saved
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tooltip content="Save to Google Drive">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveDocument}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </Tooltip>
          
          <Tooltip content="Save to VAULT">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveToVault}
              className="flex items-center"
            >
              <Upload className="h-4 w-4 mr-1" />
              Save to VAULT
            </Button>
          </Tooltip>
          
          <Tooltip content="Export as PDF">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportDocument}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </Tooltip>
          
          <Tooltip content={isFullscreen ? "Exit Full Screen" : "Full Screen"}>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Regulatory Compliance Notice */}
      <div className="bg-blue-50 px-4 py-2 flex items-center text-sm border-b border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
        <span>
          <strong>eCTD Compliance Active:</strong> Document formatting follows regulatory requirements
        </span>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        {/* This would be replaced with an actual Google Docs iframe when fully implemented */}
        <iframe
          ref={iframeRef}
          title="Google Docs Editor"
          className="w-full h-full border-0"
          src="about:blank"
          style={{
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        />
        
        {/* Simulated Google Docs interface for development */}
        <div 
          className="absolute top-[132px] left-0 right-0 bottom-0 flex flex-col items-center"
          style={{ pointerEvents: 'none' }}
        >
          <div className="w-full max-w-5xl bg-white shadow-sm border border-gray-200 h-full my-4 rounded-md overflow-hidden" style={{ pointerEvents: 'auto' }}>
            <div className="border-b border-gray-200 px-4 py-2 flex items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium">DongleDoc.net</span>
                <span className="ml-2 text-xs">▼</span>
              </div>
              
              <div className="ml-8 flex space-x-4">
                <span className="text-sm">File</span>
                <span className="text-sm">Edit</span>
                <span className="text-sm">View</span>
                <span className="text-sm">Insert</span>
                <span className="text-sm">Format</span>
                <span className="text-sm">Tools</span>
                <span className="text-sm">Add-ons</span>
              </div>
            </div>
            
            <div className="border-b border-gray-200 px-4 py-2 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="border border-gray-300 rounded px-2 py-1 flex items-center">
                  <span className="text-sm">Normal text</span>
                  <span className="ml-2 text-xs">▼</span>
                </div>
                
                <div className="border border-gray-300 rounded px-2 py-1 flex items-center">
                  <span className="text-sm">Arial</span>
                  <span className="ml-2 text-xs">▼</span>
                </div>
                
                <div className="border border-gray-300 rounded px-2 py-1 flex items-center">
                  <span className="text-sm">11</span>
                  <span className="ml-2 text-xs">▼</span>
                </div>
                
                <div className="border border-gray-300 rounded px-2 py-1 flex items-center">
                  <span className="text-sm">B I U</span>
                </div>
                
                <div className="border border-gray-300 rounded px-2 py-1 flex items-center">
                  <span className="text-sm">⋮</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 overflow-auto h-[calc(100%-96px)]">
              <h1 className="text-3xl mb-6">{documentTitle}</h1>
              
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
              </p>
              
              <p className="mb-4">
                Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat.
              </p>
              
              <p className="mb-4">
                Vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.
              </p>
              
              <h2 className="text-2xl mt-6 mb-4">Section 1: Introduction</h2>
              
              <p className="mb-4">
                Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem.
              </p>
              
              <p className="mb-4">
                Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum.
              </p>
              
              <h2 className="text-2xl mt-6 mb-4">Section 2: Methods</h2>
              
              <p className="mb-4">
                Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima.
              </p>
              
              <p className="mb-4">
                Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDocsEditor;