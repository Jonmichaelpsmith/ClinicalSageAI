// /client/src/components/ai/LumenAiAssistant.jsx

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Loader2, Paperclip, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function LumenAiAssistant({ isOpen, onClose, module, context }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m Lumen Regulatory Affairs AI. How can I assist you with your regulatory needs today?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Reset the chat when it's opened
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm Lumen Regulatory Affairs AI. How can I assist you with your ${module || 'regulatory'} needs today?`,
        },
      ]);
    }
  }, [isOpen, module]);
  
  // Function to initialize knowledge base
  const initializeKnowledgeBase = async () => {
    try {
      setIsInitializing(true);
      
      const response = await fetch('/api/regulatory-ai/init-knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.status === 'success' || data.status === 'warning') {
        toast({
          title: 'Knowledge Base Initialized',
          description: data.message,
        });
        
        // Add system message to indicate initialization
        setMessages(prev => [
          ...prev, 
          {
            role: 'system',
            content: `${data.message} The AI will now use document-based knowledge where available.`
          }
        ]);
      } else {
        toast({
          title: 'Initialization Failed',
          description: data.message || 'Failed to initialize knowledge base',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      toast({
        title: 'Initialization Error',
        description: 'An error occurred while initializing the knowledge base.',
        variant: 'destructive'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length > 0) {
      // Initialize progress for each file
      const newProgress = {};
      selectedFiles.forEach(file => {
        newProgress[file.name] = 0;
      });
      
      setUploadProgress(newProgress);
      setFiles((prev) => [...prev, ...selectedFiles]);
      
      // Add a message about the files
      if (selectedFiles.length === 1) {
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'user', 
            content: `I've attached a file for analysis: ${selectedFiles[0].name}`,
            files: selectedFiles.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type
            }))
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev, 
          { 
            role: 'user', 
            content: `I've attached ${selectedFiles.length} files for analysis`,
            files: selectedFiles.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type
            }))
          }
        ]);
      }
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle file upload
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Create a FormData object to send files
    const formData = new FormData();
    
    // Add each file to formData
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add module and context info
    formData.append('module', module || '');
    formData.append('context', JSON.stringify(context || {}));
    
    try {
      // Upload the files with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          
          // Update progress for all files (simplification)
          const newProgress = {};
          files.forEach(file => {
            newProgress[file.name] = percentComplete;
          });
          
          setUploadProgress(newProgress);
        }
      });
      
      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            
            // Add AI response to chat
            setMessages((prev) => [...prev, { 
              role: 'assistant', 
              content: data.response || 'Files received. I\'ll analyze these documents.'
            }]);
            
            // Clear the files after successful upload
            setFiles([]);
            setUploadProgress({});
            
            toast({
              title: 'Files Uploaded',
              description: 'Files have been successfully uploaded and are being analyzed.',
            });
          } catch (parseError) {
            console.error('Error parsing server response:', parseError);
            throw new Error('Failed to parse server response: ' + parseError.message);
          }
        } else {
          // Try to parse error response
          let errorMessage = 'Upload failed with status: ' + xhr.status;
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.error || errorMessage;
            console.error('Server error response:', errorData);
          } catch (e) {
            // If parsing fails, use the default error message
          }
          throw new Error(errorMessage);
        }
        setIsUploading(false);
      };
      
      xhr.onerror = () => {
        console.error('Network error during file upload');
        throw new Error('Network error occurred during upload. Please check your connection and try again.');
      };
      
      xhr.open('POST', window.location.origin + '/api/regulatory-ai/upload', true);
      xhr.send(formData);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your files. Please try again.',
        },
      ]);
      setIsUploading(false);
    }
  };
  
  // Handle file removal
  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() && files.length === 0) return;
    
    // If there are files to upload, handle that first
    if (files.length > 0) {
      await uploadFiles();
      return;
    }

    // Otherwise, send a regular text message
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
      
      // Add thinking message immediately to improve perceived responsiveness
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Thinking...',
          isLoading: true 
        }
      ]);
      
      // Call the AI API - full absolute path
      const response = await fetch(window.location.origin + '/api/regulatory-ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          context: module?.toLowerCase() || 'general',
          module,
          additionalContext: context,
          history: messages.filter(msg => !msg.isLoading).map(msg => ({ 
            role: msg.role, 
            content: msg.content 
          })),
        }),
        signal: controller.signal
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response from server:', errorData);
        throw new Error(errorData.error || 'Failed to get response from AI assistant');
      }

      const data = await response.json();
      
      // Replace the "Thinking..." message with the actual response
      setMessages((prev) => 
        prev.map((msg, index) => {
          // Find the last message with isLoading=true
          if (msg.role === 'assistant' && msg.isLoading) {
            return { role: 'assistant', content: data.response };
          }
          return msg;
        })
      );
    } catch (error) {
      console.error('Error communicating with AI assistant:', error);
      console.error('Error details:', error.stack);
      
      // Show more detailed error toast
      toast({
        title: 'AI Assistant Error',
        description: error.message || 'Sorry, I encountered an issue processing your request. Please try again.',
        variant: 'destructive',
      });
      
      // Create a more informative error message
      let errorMessage = 'Sorry, I encountered an issue processing your request. Please try again.';
      
      // Provide more specific error message based on error type
      if (error.name === 'AbortError') {
        errorMessage = 'The request took too long to process. The AI service might be experiencing high demand. Please try again in a moment.';
      } else if (error.message.includes('API key')) {
        errorMessage = 'I apologize, but there seems to be an issue with the AI service configuration. Please contact support for assistance.';
      } else if (error.message.includes('network') || error.message.includes('failed to fetch')) {
        errorMessage = 'I\'m having trouble connecting to the server. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
        errorMessage = 'The request took too long to process. This might be due to high demand. Please try again in a moment.';
      }
      
      // Replace the "Thinking..." message with error message or add a new message
      setMessages((prev) => {
        const hasThinkingMessage = prev.some(msg => msg.role === 'assistant' && msg.isLoading);
        
        if (hasThinkingMessage) {
          // Replace the "Thinking..." message
          return prev.map(msg => {
            if (msg.role === 'assistant' && msg.isLoading) {
              return { role: 'assistant', content: errorMessage };
            }
            return msg;
          });
        } else {
          // Add a new error message
          return [...prev, { role: 'assistant', content: errorMessage }];
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pressing Enter to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col bg-white text-black">
        <SheetHeader className="p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <SheetTitle className="text-xl text-gray-900">Lumen Regulatory Affairs AI</SheetTitle>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 mr-2 text-xs"
                      onClick={initializeKnowledgeBase}
                      disabled={isInitializing}
                    >
                      {isInitializing ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>Initialize Knowledge Base</>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Process regulatory documents in the attached_assets folder</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        setMessages(prev => [
                          ...prev,
                          {
                            role: 'user',
                            content: 'Tell me about your capabilities.'
                          },
                          {
                            role: 'assistant',
                            content: `# About Ask Lumen - Regulatory Affairs AI Assistant

## Overview
Lumen is an advanced AI assistant specialized in regulatory affairs for medical devices, pharmaceuticals, and clinical research. The system combines document intelligence with internet research capabilities to provide accurate, evidence-based guidance.

## Capabilities
1. **Regulatory Knowledge Base**: Expert guidance on FDA, EMA, PMDA, NMPA, Health Canada, TGA, and ICH guidelines
2. **Document Intelligence**: Analysis of regulatory documents with specialized extraction of requirements and terms
3. **Internet Research**: Real-time access to the latest regulatory information and updates
4. **Academic Literature**: Integration with PubMed and other scientific databases to find relevant research papers
5. **Clinical Trial Intelligence**: Access to trial data from global registries including ClinicalTrials.gov and Health Canada
6. **Document Processing**: Parsing and extraction from uploaded PDFs and regulatory documents
7. **Contextual Understanding**: Analysis of regulatory terms in queries to provide the most relevant information
8. **Semantic Search**: Finding precise information across complex regulatory documents

## Best Practices
1. **Be Specific**: Include the exact regulation, section, or jurisdiction you're inquiring about
2. **Provide Context**: Mention your device classification, product type, or regulatory pathway
3. **Upload Relevant Documents**: Use the paper clip icon to share relevant PDFs, which improves answer quality
4. **Ask One Question at a Time**: Complex multi-part questions should be broken down for best results
5. **Use Follow-up Questions**: The system remembers your conversation context for more detailed exploration
6. **Request Citations**: Ask for specific sources if you need to verify information for submissions
7. **Frame Market-Specific Queries**: Specify the target market (e.g., "for EU MDR submission" or "FDA 510(k)")

## Frequently Asked Questions

### What information sources does Ask Lumen use?
Lumen uses a combination of regulatory documents in its knowledge base, real-time internet research capabilities, academic literature through PubMed integration, and clinical trial databases. It avoids using pre-written responses, prioritizing document-based knowledge.

### How current is the regulatory information?
The system can access the internet for the latest updates and guidance. Additionally, the knowledge base is regularly updated with new documents and regulatory changes.

### Can I trust the information for regulatory submissions?
Always verify critical information. Ask Lumen provides guidance and research assistance, but final regulatory decisions should be reviewed by qualified personnel. The system will cite sources whenever possible.

### What documents can I upload?
You can upload PDFs, Word documents, Excel files, presentations, and text files. These are processed to enhance the knowledge base for your specific questions.

### Is my data secure and confidential?
Yes, your uploaded documents and conversations are secured within your organization's tenant. The system uses enterprise-grade security and data isolation.

### What if Ask Lumen doesn't know something?
Instead of making up information, the system will clearly indicate knowledge gaps and suggest alternative approaches or sources to consult.

### How can I get the best results?
Provide clear context, be specific with questions, upload relevant documents, and use follow-up questions to explore topics in depth.

For best results, upload documents related to your specific regulatory needs such as guidance documents, regulations, and standards.`
                          }
                        ]);
                      }}
                    >
                      ABOUT ME
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Learn about my capabilities and how to use me</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full" 
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SheetDescription className="text-gray-600">
            Ask me about regulatory guidance, compliance requirements, or document preparation.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4 pb-0 bg-white">
          <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p>Thinking...</p>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {/* Loading indicator is now included inline with messages */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Display attached files with progress */}
        {files.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 bg-white">
            <div className="text-sm font-medium mb-2 text-gray-700">Files to analyze:</div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                    <div>
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {uploadProgress[file.name] > 0 && uploadProgress[file.name] < 100 ? (
                      <div className="w-20 mr-2">
                        <Progress value={uploadProgress[file.name]} className="h-2" />
                      </div>
                    ) : uploadProgress[file.name] === 100 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    ) : null}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={() => removeFile(file.name)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <SheetFooter className="p-4 border-t border-gray-100 bg-white">
          <div className="flex flex-col gap-2 w-full">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.csv,.md,.json,.xml"
            />
            
            <div className="flex gap-2 w-full">
              <Textarea
                placeholder="Type your question here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none bg-white text-gray-900"
                rows={2}
              />
              <div className="flex flex-col gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isUploading}
                        className="h-8 w-8 bg-white"
                      >
                        <Paperclip className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Attach files for AI analysis
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || isUploading || (!input.trim() && files.length === 0)}
                  className="h-full"
                >
                  {isLoading || isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}