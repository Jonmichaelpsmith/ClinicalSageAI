import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, Send, HelpCircle, BookOpen, FileCheck, Brain, Zap, Bot, ChevronRight } from 'lucide-react';
import { useLumenAssistant } from './LumenAssistantProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium opacity-70">Lumen AI</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-[10px] text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                  Copy
                </button>
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { toast } = useToast();

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
                      <h4 className="font-medium text-purple-800 dark:text-purple-300">Chemistry, Manufacturing, and Controls</h4>
                      <p className="text-xs text-purple-700/70 dark:text-purple-400/70">Comprehensive regulatory and technical knowledge</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-purple-800 dark:text-purple-300 mb-4">
                    Lumen contains expert knowledge about CMC aspects of pharmaceutical development and regulatory submissions:
                  </p>
                  
                  <div className="mb-4">
                    <div className="font-medium text-sm text-purple-800 dark:text-purple-300 mb-2 border-b border-purple-200 dark:border-purple-700 pb-1">Key CMC Areas</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Drug Substance & API</span>
                      </div>
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Drug Product & Formulation</span>
                      </div>
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Quality Control & Assurance</span>
                      </div>
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Specifications & Testing</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="font-medium text-sm text-purple-800 dark:text-purple-300 mb-2 border-b border-purple-200 dark:border-purple-700 pb-1">Technical Expertise</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Stability & Shelf Life</span>
                      </div>
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Process Validation</span>
                      </div>
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Method Validation</span>
                      </div>
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Container Closure Systems</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="font-medium text-sm text-purple-800 dark:text-purple-300 mb-2 border-b border-purple-200 dark:border-purple-700 pb-1">Regulatory Guidelines</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">ICH Guidelines (Q8-Q12)</span>
                      </div>
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">Quality by Design (QbD)</span>
                      </div>
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">FDA/EMA CMC Guidelines</span>
                      </div>
                      <div className="text-xs bg-white dark:bg-slate-800 p-2 rounded border border-purple-100 dark:border-purple-800 flex items-center">
                        <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-1.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                        <span className="font-medium text-purple-700 dark:text-purple-400">CTD Module 3 Requirements</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-800"
                      onClick={() => {
                        setActiveTab('chat');
                        setUserInput('Explain CMC requirements for an IND submission');
                        setTimeout(() => inputRef.current?.focus(), 100);
                      }}
                    >
                      Ask about CMC
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-800"
                      onClick={() => {
                        setActiveTab('chat');
                        setUserInput('What is Quality by Design?');
                        setTimeout(() => sendMessage(), 100);
                      }}
                    >
                      Quality by Design
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-800"
                      onClick={() => {
                        setActiveTab('chat');
                        setUserInput('Explain the differences between drug substance and drug product');
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
  );
};

export default LumenAssistant;