import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, Copy, History, FileDown } from 'lucide-react';

export default function DraftEditor({ content, onChange, onGenerateDraft }) {
  const editorRef = useRef(null);
  
  useEffect(() => {
    // Set up keyboard shortcut for generation
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onGenerateDraft();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onGenerateDraft]);
  
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">CTD Document Editor</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-1" />
              Version History
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-1" />
              Copy to Clipboard
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-1" />
              Export as DOCX
            </Button>
            <Button size="sm" onClick={onGenerateDraft}>
              <Sparkles className="h-4 w-4 mr-1" />
              Generate with AI
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative">
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleChange}
            className="w-full h-[500px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Type or generate content for this CTD section..."
          />
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm py-1 px-2 rounded text-xs text-gray-500">
            Press Ctrl+Enter to generate
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <div className="flex items-center text-sm text-green-600">
            <Check className="h-4 w-4 mr-1" />
            Document autosaved
          </div>
          <div className="text-sm text-gray-500">
            Word count: {content.split(/\s+/).filter(word => word.length > 0).length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}