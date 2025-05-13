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
      // Call the AI API - full absolute path
      const response = await fetch(window.location.origin + '/api/regulatory-ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          module,
          context,
          history: messages.map(msg => ({ role: msg.role, content: msg.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response from server:', errorData);
        throw new Error(errorData.error || 'Failed to get response from AI assistant');
      }

      const data = await response.json();
      
      // Add AI response to chat
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error communicating with AI assistant:', error);
      console.error('Error details:', error.stack);
      
      // Show more detailed error toast
      toast({
        title: 'AI Assistant Error',
        description: error.message || 'Sorry, I encountered an issue processing your request. Please try again.',
        variant: 'destructive',
      });
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your request. Please try again.',
        },
      ]);
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
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
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-gray-100 text-gray-800">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>Thinking...</p>
                  </div>
                </div>
              </div>
            )}
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