import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FolderTree, FileCode, Download } from "lucide-react";
import { fetchBlueprint } from '../api/blueprint';

/**
 * Blueprint Generator Page - Generate folder structures and XML manifests
 */
const BlueprintPage = () => {
  const [loading, setLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState(`[
  {
    "id": "1",
    "title": "Administrative Information",
    "folders": [
      {
        "name": "cover-letter",
        "files": ["cover-letter.docx"]
      },
      {
        "name": "contact-information",
        "files": ["contacts.xlsx"]
      }
    ]
  },
  {
    "id": "2",
    "title": "Quality",
    "folders": [
      {
        "name": "drug-substance",
        "files": ["specifications.pdf", "stability.pdf"]
      },
      {
        "name": "drug-product",
        "files": ["formulation.docx", "manufacturing.pdf"]
      }
    ]
  },
  {
    "id": "3",
    "title": "Nonclinical",
    "folders": [
      {
        "name": "pharmacology",
        "files": ["primary-pd.pdf", "secondary-pd.pdf"]
      },
      {
        "name": "toxicology",
        "files": ["tox-summary.docx", "repeat-dose.pdf"]
      }
    ]
  },
  {
    "id": "4",
    "title": "Clinical",
    "folders": [
      {
        "name": "study-reports",
        "files": ["study-001.pdf", "study-002.pdf"]
      },
      {
        "name": "protocols",
        "files": ["protocol-001.docx", "protocol-002.docx"]
      }
    ]
  }
]`);
  
  const [generatedBlueprint, setGeneratedBlueprint] = useState(null);
  const [activeTab, setActiveTab] = useState('input');

  // Handle generating blueprint
  const handleGenerateBlueprint = async () => {
    setLoading(true);
    try {
      // Try to parse the JSON input
      const modulesData = JSON.parse(jsonInput);
      
      const data = await fetchBlueprint(modulesData);
      setGeneratedBlueprint(data);
      setActiveTab('result');
    } catch (error) {
      console.error('Error generating blueprint:', error);
      // If JSON parsing error
      if (error instanceof SyntaxError) {
        alert('Invalid JSON format. Please check your input.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Download XML manifest
  const handleDownloadXML = () => {
    if (!generatedBlueprint?.xmlManifest) return;
    
    // Create blob for XML download
    const blob = new Blob([generatedBlueprint.xmlManifest], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submission-manifest.xml';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render nested folder structure
  const renderFolderStructure = (node, depth = 0) => {
    const paddingLeft = `${depth * 20}px`;
    
    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div 
            className="flex items-center py-1"
            style={{ paddingLeft }}
          >
            <FolderTree className="h-4 w-4 mr-2 text-yellow-600" />
            <span className="font-medium">{node.name}</span>
          </div>
          {node.children && node.children.map(child => renderFolderStructure(child, depth + 1))}
        </div>
      );
    } else if (node.type === 'file') {
      return (
        <div 
          key={node.path}
          className="flex items-center py-1"
          style={{ paddingLeft }}
        >
          <FileCode className="h-4 w-4 mr-2 text-blue-600" />
          <span>{node.name}</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="blueprint-page-container p-4">
      <h1 className="text-2xl font-bold mb-6">Blueprint Generator</h1>
      
      <Tabs defaultValue="input" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="input">Input JSON</TabsTrigger>
          <TabsTrigger value="result" disabled={!generatedBlueprint}>Generated Blueprint</TabsTrigger>
        </TabsList>
        
        {/* Input Tab */}
        <TabsContent value="input">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Blueprint Definition</CardTitle>
                <CardDescription>Define your submission structure in JSON format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <textarea
                      className="w-full p-4 border rounded font-mono text-sm h-96"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      spellCheck="false"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleGenerateBlueprint}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Blueprint'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Result Tab */}
        <TabsContent value="result">
          {generatedBlueprint && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Folder Structure</CardTitle>
                  <CardDescription>Generated directory blueprint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded p-4 bg-white h-96 overflow-auto">
                    {generatedBlueprint.folderStructure.map(node => renderFolderStructure(node))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>XML Manifest</CardTitle>
                      <CardDescription>Generated submission manifest</CardDescription>
                    </div>
                    <Button 
                      onClick={handleDownloadXML}
                      variant="outline"
                      className="flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download XML
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded p-4 bg-white h-96 overflow-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {generatedBlueprint.xmlManifest}
                    </pre>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Implementation Guide</CardTitle>
                  <CardDescription>Instructions for implementing this blueprint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded bg-white">
                    <div className="prose max-w-none">
                      <h3>Implementation Steps</h3>
                      <ol>
                        <li>Create the folder structure as shown above</li>
                        <li>Place your submission files in the appropriate folders</li>
                        <li>Save the XML manifest in the root directory</li>
                        <li>Validate your submission against regulatory requirements</li>
                        <li>Submit the package to the regulatory authority</li>
                      </ol>
                      
                      <h3>Recommendations</h3>
                      <ul>
                        <li>Maintain consistent file naming conventions</li>
                        <li>Include document version numbers in filenames</li>
                        <li>Ensure all referenced files in the XML manifest exist in the folder structure</li>
                        <li>Validate the XML manifest against the appropriate DTD/XSD schema</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlueprintPage;