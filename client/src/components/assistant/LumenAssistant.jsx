import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Maximize2, Minimize2, Send, HelpCircle, BookOpen, FileCheck, Brain, Zap, Bot, ChevronRight,
  Copy, CheckCircle2, Info, CheckCheck, Sparkles, Code, Keyboard, Command, AlertCircle, TerminalSquare
} from 'lucide-react';
import { useLumenAssistant } from './LumenAssistantProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

// Function to format message content with markdown-like syntax highlighting
const formatMessageText = (text) => {
  // Handle code blocks/technical terms
  const codeFormatted = text.replace(
    /`([^`]+)`/g, 
    '<code class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-xs font-mono">$1</code>'
  );
  
  // Handle bold text
  const boldFormatted = codeFormatted.replace(
    /\*\*([^*]+)\*\*/g, 
    '<strong>$1</strong>'
  );
  
  // Handle bullet points
  const bulletFormatted = boldFormatted.replace(
    /^• (.+)$/gm, 
    '<div class="flex items-start"><div class="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div><div>$1</div></div>'
  );
  
  // Handle numbered lists
  const numberedFormatted = bulletFormatted.replace(
    /^(\d+)\. (.+)$/gm, 
    '<div class="flex items-start"><div class="mr-2 w-4 flex-shrink-0 font-semibold">$1.</div><div>$2</div></div>'
  );
  
  // Handle highlighted terms - core regulatory
  const highlightFormatted = numberedFormatted.replace(
    /(ICH E3|GxP|21 CFR Part 11|FDA|EMA|PMDA|ALCOA|CTD|IND|NDA|BLA)/g, 
    '<span class="text-indigo-600 dark:text-indigo-400 font-medium">$1</span>'
  );
  
  // Handle highlighted CMC-specific terms
  const cmcHighlightFormatted = highlightFormatted.replace(
    /(CMC|Chemistry, Manufacturing, and Controls|Quality by Design|QbD|ICH Q\d+|Drug Substance|Drug Product|API|Active Pharmaceutical Ingredient|stability|container closure|process validation|method validation|specifications|impurity|in-process controls|critical quality attributes)/g, 
    '<span class="text-purple-600 dark:text-purple-400 font-medium">$1</span>'
  );
  
  // Handle links
  const linkFormatted = cmcHighlightFormatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g, 
    '<a href="$2" class="text-blue-600 dark:text-blue-400 underline" target="_blank">$1</a>'
  );
  
  // Handle line breaks
  return linkFormatted.split('\n\n').map((paragraph, i) => 
    `<div class="${i > 0 ? 'mt-2' : ''}">${paragraph}</div>`
  ).join('');
};

const ChatMessage = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const plainTextRef = useRef(null);
  
  // Extract plain text from HTML (for copying)
  useEffect(() => {
    if (message.sender !== 'user' && plainTextRef.current) {
      // Create a temporary element to extract text without HTML tags
      const tempElement = document.createElement('div');
      tempElement.innerHTML = formatMessageText(message.text);
      plainTextRef.current = tempElement.textContent || tempElement.innerText || message.text;
    } else if (message.sender === 'user') {
      plainTextRef.current = message.text;
    }
  }, [message]);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(plainTextRef.current);
      setCopied(true);
      toast({
        title: "Message copied to clipboard",
        description: "The content has been copied successfully.",
        variant: "default",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div 
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
    >
      {message.sender !== 'user' && (
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0 flex items-center justify-center mr-2 self-end mb-2 border border-indigo-200 dark:border-indigo-800">
          <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
        </div>
      )}
      
      <div 
        className={`relative max-w-[85%] rounded-lg p-3 shadow-sm ${
          message.sender === 'user' 
            ? 'bg-indigo-600 text-white' 
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
        }`}
      >
        {/* Small triangle for assistant messages */}
        {message.sender !== 'user' && (
          <div className="absolute -left-2 bottom-[14px] w-2 h-2 rotate-45 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-700"></div>
        )}
        
        {message.sender === 'user' ? (
          <div>
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            <span className="block text-right mt-1 text-[10px] text-indigo-200 opacity-70">You</span>
          </div>
        ) : (
          <div>
            <div 
              className="text-sm chat-message"
              dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }}
            />
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Lumen AI</span>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <CheckCheck size={12} className="text-green-500 ml-1" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">GA v1.3 - Accuracy Verified</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className={`flex items-center gap-1 ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={copyToClipboard}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Copy message"
                      >
                        {copied ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">{copied ? "Copied!" : "Copy message"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {message.sender === 'user' && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center ml-2 self-end mb-2 border border-indigo-500">
          <div className="text-xs text-white font-medium">You</div>
        </div>
      )}
    </div>
  );
};

const ChatSuggestion = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-sm px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 
      rounded-full text-indigo-700 dark:text-indigo-300 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-300
      border border-indigo-100 dark:border-indigo-800 shadow-sm whitespace-nowrap"
    >
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-full bg-indigo-200 dark:bg-indigo-700 flex-shrink-0"></span>
        {text}
      </span>
    </button>
  );
};

const RegulationCard = ({ title, description, icon: Icon }) => {
  return (
    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0">
          <Icon size={16} />
        </div>
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

const QuickCommand = ({ text, icon: Icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
    >
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-2">
          <Icon size={14} />
        </div>
        <span className="text-sm">{text}</span>
      </div>
      <ChevronRight size={14} className="text-slate-400" />
    </button>
  );
};

// Keyboard shortcut component
const KeyboardShortcutHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  const shortcuts = [
    { key: '/', description: 'Focus search/input box' },
    { key: 'Esc', description: 'Close assistant or dialog' },
    { key: 'Ctrl+K', description: 'Show keyboard shortcuts' },
    { key: 'Ctrl+Enter', description: 'Submit message' },
    { key: 'Ctrl+C', description: 'Copy selected message' },
    { key: 'Tab', description: 'Navigate between tabs' },
    { key: 'Alt+1/2/3', description: 'Quick tab switching' },
    { key: 'M', description: 'Toggle maximize/minimize' }
  ];
  
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6 shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Keyboard size={18} className="text-indigo-600" />
            Keyboard Shortcuts
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-2 mb-4">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b dark:border-slate-700">
              <span className="text-sm text-slate-600 dark:text-slate-300">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 shadow">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        
        <div className="pt-2 border-t dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Note: Some shortcuts may not be available in all contexts.
          </p>
        </div>
      </div>
    </div>
  );
};

const LumenAssistant = () => {
  const { 
    isOpen, 
    toggleAssistant, 
    messages, 
    isLoading, 
    userInput, 
    setUserInput, 
    sendMessage,
    isExpanded,
    toggleExpanded,
    currentModule,
    suggestions,
    useSuggestion
  } = useLumenAssistant();
  
  const [activeTab, setActiveTab] = useState('chat');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { toast } = useToast();
  
  // Handle global keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    
    const handleGlobalKeyDown = (e) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Exception for Escape key which should close modals/assistants even when typing
        if (e.key === 'Escape') {
          setShowKeyboardShortcuts(false);
        }
        return;
      }
      
      // Ctrl+K - Show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
      
      // M - Toggle maximize/minimize
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleExpanded();
      }
      
      // / - Focus the input
      if (e.key === '/' && inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      }
      
      // Escape - Close keyboard shortcuts or assistant
      if (e.key === 'Escape') {
        if (showKeyboardShortcuts) {
          setShowKeyboardShortcuts(false);
        } else {
          toggleAssistant();
        }
      }
      
      // Alt+1/2/3 - Switch tabs
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setActiveTab('chat');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        setActiveTab('help');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        setActiveTab('regulatory');
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, toggleAssistant, toggleExpanded, showKeyboardShortcuts, inputRef]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Focus the input field when the assistant opens
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Execute quick commands
  const executeQuickCommand = (command) => {
    setUserInput(command);
    // Optionally auto-send simple commands
    if (command.length < 25) {
      setTimeout(() => sendMessage(), 100);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcutHelp 
        isOpen={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />
      
      <div 
        className={`fixed ${isExpanded ? 'inset-4 md:inset-10' : 'bottom-4 right-4 w-[400px] h-[550px]'} bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-50 transition-all duration-300`}
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-700 to-indigo-900 dark:from-indigo-800 dark:to-indigo-950 text-white rounded-t-lg">
          {/* Animated gradient blobs */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -inset-[100%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] rounded-full bg-gradient-to-br from-purple-500/30 to-transparent blur-3xl animate-slow-spin"></div>
            <div className="absolute -inset-[100%] top-1/3 left-1/3 transform -translate-x-1/3 -translate-y-1/3 w-[200%] h-[200%] rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent blur-3xl animate-slow-spin-reverse"></div>
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Lumen</h3>
                  {currentModule && (
                    <Badge variant="outline" className="border-indigo-300 text-indigo-100 text-xs">
                      {currentModule === 'indWizard' ? 'IND' : 
                       currentModule === 'csrIntelligence' ? 'CSR' : 
                       currentModule === 'documentManagement' ? 'Docs' : 'Validation'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-indigo-100 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span> 
                  Digital Compliance Coach <span className="text-indigo-200">•</span> <span className="text-indigo-200/70">Enterprise Edition</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowKeyboardShortcuts(true)}
                      className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                      aria-label="Keyboard shortcuts"
                    >
                      <Keyboard size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Keyboard shortcuts (Ctrl+K)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <button
                onClick={toggleExpanded}
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label={isExpanded ? "Minimize" : "Maximize"}
              >
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={toggleAssistant}
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Module context indicator */}
          {currentModule && (
            <div className="px-4 py-1.5 bg-indigo-800/50 text-xs text-indigo-100 flex items-center">
              <div className="flex-1">
                Currently viewing: <span className="font-medium">{
                  currentModule === 'indWizard' ? 'IND Submission Wizard' : 
                  currentModule === 'csrIntelligence' ? 'CSR Intelligence' : 
                  currentModule === 'documentManagement' ? 'Document Management' : 'Validation Hub'
                }</span>
              </div>
              <div className="text-indigo-200/70">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>
        
        {/* Content Tabs */}
        <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="justify-start border-b rounded-none px-2 h-auto">
            <TabsTrigger value="chat" className="text-xs py-2 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none">
              Chat
            </TabsTrigger>
            <TabsTrigger value="help" className="text-xs py-2 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none">
              Help
            </TabsTrigger>
            <TabsTrigger value="regulatory" className="text-xs py-2 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none">
              Regulatory
            </TabsTrigger>
          </TabsList>
          
          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 p-0 data-[state=inactive]:hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500 dark:text-slate-400">
                      I'm Lumen, your Digital Compliance Coach. How can I help you with your regulatory documents today?
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0 flex items-center justify-center self-end mb-2 border border-indigo-200 dark:border-indigo-800">
                        <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      
                      <div className="relative max-w-[80%] rounded-lg p-3 shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="absolute -left-2 bottom-[14px] w-2 h-2 rotate-45 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-700"></div>
                        
                        <div className="h-14 flex gap-2 items-center">
                          <div className="relative w-32 h-5">
                            <div className="absolute w-full h-full bg-gradient-to-r from-indigo-500 to-indigo-700 blur-xl opacity-20 animate-pulse rounded-full"></div>
                            <div className="relative flex items-center gap-2 ml-1">
                              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '250ms' }}></div>
                              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '500ms' }}></div>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 italic">Analyzing {currentModule ? 
                            currentModule === 'indWizard' ? 'IND regulatory requirements' : 
                            currentModule === 'csrIntelligence' ? 'CSR documentation' : 
                            currentModule === 'documentManagement' ? 'document management policies' : 'validation protocols' 
                            : 'regulatory guidance'
                          }...</div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium opacity-70">Lumen AI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Suggestions */}
                {!isLoading && suggestions.length > 0 && messages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <ChatSuggestion 
                        key={index} 
                        text={suggestion} 
                        onClick={() => useSuggestion(suggestion)}
                      />
                    ))}
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input */}
            <div className="p-4 pt-3 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 overflow-hidden">
                    <Textarea
                      ref={inputRef}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about compliance, documents, or procedures..."
                      className="resize-none pr-10 border-slate-300 dark:border-slate-600 focus-visible:ring-indigo-500 bg-white dark:bg-slate-800 shadow-sm"
                      rows={2}
                    />
                    {!isLoading && (
                      <div className="absolute right-2 bottom-2 flex items-center space-x-1 text-slate-400">
                        <span className="text-[10px] select-none">{userInput.length > 0 ? 'Enter ↵' : ''}</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={sendMessage}
                    disabled={isLoading || !userInput.trim()}
                    size="icon"
                    className="rounded-full h-9 w-9 bg-indigo-600 hover:bg-indigo-700 self-end"
                    aria-label="Send message"
                  >
                    <Send size={16} className="text-white" />
                  </Button>
                </div>
                
                {/* Feature badges */}
                <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
                  <div className="py-1 px-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-[10px] text-indigo-700 dark:text-indigo-300 rounded border border-indigo-100 dark:border-indigo-800 flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span className="font-medium">GxP Compliance</span>
                  </div>
                  <div className="py-1 px-1.5 bg-purple-50 dark:bg-purple-900/20 text-[10px] text-purple-700 dark:text-purple-300 rounded border border-purple-100 dark:border-purple-800 flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    <span className="font-medium">CMC Expert</span>
                  </div>
                  <div className="py-1 px-1.5 bg-blue-50 dark:bg-blue-900/20 text-[10px] text-blue-700 dark:text-blue-300 rounded border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <span className="font-medium">Multi-regional Guidance</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Help Tab */}
          <TabsContent value="help" className="flex-1 overflow-hidden m-0 p-0 data-[state=inactive]:hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">How to Use Lumen</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Lumen is your AI-powered assistant for regulatory compliance and documentation. Here are some ways you can interact with me:
                  </p>
                  
                  <div className="space-y-2">
                    <QuickCommand 
                      text="Navigate to another module" 
                      icon={Bot} 
                      onClick={() => executeQuickCommand("Go to IND Wizard")} 
                    />
                    <QuickCommand 
                      text="Search for documents" 
                      icon={Bot} 
                      onClick={() => executeQuickCommand("Search for safety reports")} 
                    />
                    <QuickCommand 
                      text="Create a new document" 
                      icon={Bot} 
                      onClick={() => executeQuickCommand("Create a new protocol")} 
                    />
                    <QuickCommand 
                      text="Find regulatory information" 
                      icon={Bot} 
                      onClick={() => executeQuickCommand("Explain 21 CFR Part 11")} 
                    />
                    <QuickCommand 
                      text="Show my documents" 
                      icon={Bot} 
                      onClick={() => executeQuickCommand("Show my documents")} 
                    />
                    <QuickCommand 
                      text="View overdue items" 
                      icon={Bot} 
                      onClick={() => executeQuickCommand("Show overdue submissions")} 
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-lg font-semibold mb-2">Example Questions</h3>
                  <div className="space-y-1.5">
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      "What are the key components of an IND submission?"
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      "Help me understand ICH E3 structure for CSRs"
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      "What's the difference between FDA and EMA requirements?"
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      "Show me all documents related to Protocol AB-123"
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      "Create a new safety report template"
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Regulatory Tab */}
          <TabsContent value="regulatory" className="flex-1 overflow-hidden m-0 p-0 data-[state=inactive]:hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Key Regulatory Information</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <RegulationCard 
                      title="21 CFR Part 11" 
                      description="FDA regulations on electronic records and electronic signatures."
                      icon={FileCheck}
                    />
                    <RegulationCard 
                      title="ICH E3" 
                      description="Structure and content guidelines for Clinical Study Reports."
                      icon={BookOpen}
                    />
                    <RegulationCard 
                      title="ALCOA Principles" 
                      description="Data should be Attributable, Legible, Contemporaneous, Original, and Accurate."
                      icon={HelpCircle}
                    />
                    <RegulationCard 
                      title="GxP Compliance" 
                      description="Good Practices for manufacturing, laboratory, clinical, and documentation processes."
                      icon={Brain}
                    />
                    <RegulationCard 
                      title="FDA vs EMA vs PMDA" 
                      description="Understanding differences in regional regulatory requirements."
                      icon={Zap}
                    />
                  </div>
                </div>
                
                {/* CMC Knowledge Base Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-2">
                      <FileCheck size={14} />
                    </div>
                    CMC Knowledge Base
                  </h3>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-3">
                        <Brain size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-800 dark:text-purple-300">Chemistry, Manufacturing, and Controls</h4>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Expert knowledge on pharmaceutical product quality</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-purple-800 dark:text-purple-300 mb-4">
                      Ask me about CMC topics including: drug substance characterization, manufacturing process development, specifications, stability studies, analytical methods, and control strategies.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/30"
                        onClick={() => {
                          setActiveTab('chat');
                          setUserInput('Explain ICH Q8 requirements');
                          setTimeout(() => sendMessage(), 100);
                        }}
                      >
                        ICH Q8 Guidelines
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/30"
                        onClick={() => {
                          setActiveTab('chat');
                          setUserInput('What are the key stability considerations for injectable products?');
                          setTimeout(() => sendMessage(), 100);
                        }}
                      >
                        Stability Testing
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/30"
                        onClick={() => {
                          setActiveTab('chat');
                          setUserInput('Explain critical quality attributes');
                          setTimeout(() => sendMessage(), 100);
                        }}
                      >
                        Critical Quality Attributes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/30"
                        onClick={() => {
                          setActiveTab('chat');
                          setUserInput('What is the difference between Drug Substance vs Drug Product?');
                          setTimeout(() => sendMessage(), 100);
                        }}
                      >
                        Substance vs Product
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <h4 className="font-medium text-sm text-indigo-800 dark:text-indigo-300 mb-1">Need specific regulatory guidance?</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Switch back to the Chat tab and ask me about any regulatory topic. I can provide detailed information on compliance requirements, documentation standards, and best practices.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent border-indigo-300 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-800"
                    onClick={() => {
                      setActiveTab('chat');
                      setUserInput('Explain regulatory requirements for ');
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                  >
                    Ask about regulations
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default LumenAssistant;