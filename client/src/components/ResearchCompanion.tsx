import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  MinusCircle,
  PlusCircle,
  Send,
  Zap,
  FileSpreadsheet,
  BookOpen,
  Brain,
  Search,
  MessageSquare,
  Maximize2,
  Minimize2,
  RefreshCw,
  HelpCircle,
  PenTool,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  content: string;
  role: "assistant" | "user" | "system";
  timestamp: Date;
  loading?: boolean;
  context?: string;
  references?: Array<{
    title: string;
    url: string;
    source: string;
  }>;
};

type ResearchCompanionProps = {
  pageContext?: string;
  initialPrompt?: string;
  openaiApiKey?: string;
};

// Common research topics shown in suggestions
const RESEARCH_SUGGESTIONS = [
  "How do I find similar CSRs to my protocol?",
  "What are the best endpoints for a C. difficile study?",
  "What safety signals should I watch for in my CER?",
  "Help me understand the ICH E3 structure",
  "Explain the relationship between CSRs and CERs",
  "What are the key sections in a MEDDEV 2.7/1 report?",
];

// Personality traits that define the assistant's tone and responses
const COMPANION_PERSONALITY = {
  name: "Sage",
  traits: ["supportive", "knowledgeable", "encouraging", "clear"],
  expertise: ["clinical trials", "regulatory requirements", "medical writing", "study design"],
  tone: "friendly but professional, using simple language when explaining complex topics"
};

export default function ResearchCompanion({
  pageContext = "",
  initialPrompt = "",
  openaiApiKey
}: ResearchCompanionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: `Hi there! I'm Sage, your research companion. I can help you navigate clinical study reports, understand regulatory requirements, and optimize your trial designs. What would you like to know today?`,
      role: "assistant",
      timestamp: new Date(),
      context: "welcome",
    },
  ]);
  
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState<"chat" | "context" | "help">("chat");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Context information that the assistant uses for awareness of user activities
  const [contextData, setContextData] = useState({
    currentPage: pageContext || "Dashboard",
    recentSearches: [] as string[],
    recentDocuments: [] as string[],
    userGoals: [] as string[],
  });

  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  // Set initial prompt if provided
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== "") {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Update context when page changes
  useEffect(() => {
    if (pageContext) {
      setContextData(prev => ({ ...prev, currentPage: pageContext }));
    }
  }, [pageContext]);

  const generateUniqueId = (): string => {
    return `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Mock API response generator - in production, this would call the actual AI service
  const getAIResponse = async (userMessage: string): Promise<string> => {
    // In a real implementation, this would make an API call to OpenAI or similar
    // For now, we'll simulate a delay and return a canned response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowercasedMessage = userMessage.toLowerCase();
    
    // Simple response logic based on keywords
    if (lowercasedMessage.includes("hello") || lowercasedMessage.includes("hi")) {
      return "Hi there! How can I help with your clinical research today?";
    } else if (lowercasedMessage.includes("csr") || lowercasedMessage.includes("clinical study report")) {
      return "Clinical Study Reports (CSRs) follow the ICH E3 structure, which organizes trial information into key sections including study objectives, methodology, results, and conclusions. Our platform helps you analyze these reports to inform your own trial designs.";
    } else if (lowercasedMessage.includes("endpoint") || lowercasedMessage.includes("outcome")) {
      return "Selecting appropriate endpoints is crucial for trial success. Primary endpoints should reflect the main objective, while secondary endpoints can provide supporting data. Our database shows that for similar studies, the most common primary endpoints include clinical response rates and time to symptom resolution.";
    } else if (lowercasedMessage.includes("cer") || lowercasedMessage.includes("clinical evaluation report")) {
      return "Clinical Evaluation Reports (CERs) are regulatory documents that evaluate clinical evidence for medical devices, following structures like MEDDEV 2.7/1 Rev 4. They integrate evidence from clinical investigations, literature, and post-market surveillance. Our CER solutions can help you generate these reports from FDA FAERS data.";
    } else if (lowercasedMessage.includes("regulatory") || lowercasedMessage.includes("compliance")) {
      return "Regulatory compliance varies by region, but generally follows ICH guidelines for pharmaceuticals and ISO/MEDDEV guidelines for medical devices. Our database includes the latest requirements from FDA, EMA, and other major regulatory bodies to help you stay compliant.";
    } else if (lowercasedMessage.includes("find") || lowercasedMessage.includes("search")) {
      return "You can search our database of 3,000+ CSRs using the search bar at the top of any page. Try specific queries like 'Phase 2 oncology trials with progression-free survival endpoints' to find the most relevant reports for your research.";
    } else {
      return "That's an interesting question about clinical research. To provide the most accurate information, I'd need to analyze our database of 3,000+ clinical study reports. You can explore specific topics like endpoint selection, inclusion criteria, or statistical methods through our search interface or by browsing the CSR library.";
    }
  };

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim()) return;
    
    const userMessageId = generateUniqueId();
    
    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: userMessageId,
        content: messageText,
        role: "user",
        timestamp: new Date(),
      },
    ]);
    
    // Clear input field
    setInput("");
    
    // Show assistant is thinking
    const assistantMessageId = generateUniqueId();
    setMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        content: "",
        role: "assistant",
        timestamp: new Date(),
        loading: true,
      },
    ]);
    
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would include context from the page
      // and other system information
      const response = await getAIResponse(messageText);
      
      // Update with real response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: response,
                loading: false,
                references: [
                  {
                    title: "ICH E3 Guideline",
                    url: "#",
                    source: "Regulatory Document"
                  }
                ]
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error getting AI response", error);
      
      // Update with error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "Sorry, I encountered an error while processing your request. Please try again.",
                loading: false,
              }
            : msg
        )
      );
      
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        content: `Hi there! I'm Sage, your research companion. What would you like to know about clinical studies today?`,
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isExpanded && !isMinimized) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (isMinimized && !isExpanded) {
      setIsMinimized(false);
    }
  };

  // If there is no OPENAI_API_KEY, show a warning and instructions
  if (!openaiApiKey) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80">
        <Card>
          <CardHeader className="bg-amber-50 dark:bg-amber-900/20 pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-sm font-medium">Research Companion</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              The Research Companion requires an OpenAI API key to function.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Please add an API key in your settings to enable this feature.
            </p>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-amber-200 text-amber-700 hover:text-amber-800 dark:border-amber-800 dark:text-amber-400"
              onClick={() => window.location.href = "/settings"}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Setup API Key
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If minimized, just show the icon button
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-full shadow-md bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          onClick={toggleMinimize}
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  // Main component view
  return (
    <div 
      className={cn(
        "fixed z-50 transition-all duration-200 ease-in-out",
        isExpanded 
          ? "inset-4 md:inset-10 lg:inset-20" 
          : "bottom-4 right-4 w-80 md:w-96"
      )}
    >
      <Card className="h-full flex flex-col shadow-lg border-slate-200 dark:border-slate-700 overflow-hidden">
        <CardHeader className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-white/20">
                <AvatarImage src="/ai-assistant-avatar.png" alt="AI" />
                <AvatarFallback className="bg-white/10 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-medium">Research Companion</CardTitle>
                <p className="text-xs text-white/80">Powered by OpenAI</p>
              </div>
            </div>
            <div className="flex gap-1">
              {isExpanded ? (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" onClick={toggleExpand}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" onClick={toggleExpand}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" onClick={toggleMinimize}>
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" onClick={() => setIsMinimized(true)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as any)} className="flex-1 flex flex-col">
          <TabsList className="mx-3 mt-2 grid w-auto grid-cols-3">
            <TabsTrigger value="chat" className="text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="context" className="text-xs">
              <Info className="h-3.5 w-3.5 mr-1" />
              Context
            </TabsTrigger>
            <TabsTrigger value="help" className="text-xs">
              <HelpCircle className="h-3.5 w-3.5 mr-1" />
              Help
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col space-y-0 mt-2">
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "max-w-[85%] rounded-lg p-3",
                        message.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}
                    >
                      {message.loading ? (
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          {message.references && message.references.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-medium mb-1">References:</p>
                              <div className="space-y-1">
                                {message.references.map((ref, idx) => (
                                  <div key={idx} className="text-xs flex items-start">
                                    <FileSpreadsheet className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                    <a href={ref.url} className="hover:underline">{ref.title}</a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {!isProcessing && (
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground mb-2">Try asking about:</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {RESEARCH_SUGGESTIONS.slice(0, isExpanded ? 6 : 3).map((suggestion, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 border-t">
              <div className="flex space-x-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about clinical trials..."
                  className="resize-none min-h-[60px]"
                  disabled={isProcessing}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  size="icon"
                  disabled={!input.trim() || isProcessing}
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={clearConversation}
                >
                  Clear chat
                </Button>
                <span className="text-xs text-muted-foreground">
                  Contextual AI Assistant
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="context" className="flex-1 flex flex-col mt-2">
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium flex items-center">
                    <PenTool className="h-4 w-4 mr-1" />
                    Current Context
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="bg-muted p-2 rounded-md">
                      <p className="text-xs font-medium">Current Page</p>
                      <p className="text-sm">{contextData.currentPage}</p>
                    </div>

                    <div className="bg-muted p-2 rounded-md">
                      <p className="text-xs font-medium">Research Focus</p>
                      <p className="text-sm">Clinical Trial Optimization</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium flex items-center">
                    <Search className="h-4 w-4 mr-1" />
                    Recent Searches
                  </h3>
                  <div className="mt-2">
                    {contextData.recentSearches.length > 0 ? (
                      <ul className="space-y-1">
                        {contextData.recentSearches.map((search, idx) => (
                          <li key={idx} className="text-sm bg-muted/50 p-1.5 rounded">
                            {search}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent searches</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Recent Documents
                  </h3>
                  <div className="mt-2">
                    {contextData.recentDocuments.length > 0 ? (
                      <ul className="space-y-1">
                        {contextData.recentDocuments.map((doc, idx) => (
                          <li key={idx} className="text-sm bg-muted/50 p-1.5 rounded">
                            {doc}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent documents</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium flex items-center">
                    <Brain className="h-4 w-4 mr-1" />
                    Assistant Capabilities
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="text-xs space-y-1">
                      <p className="font-medium">Base Knowledge:</p>
                      <ul className="list-disc list-inside pl-2">
                        <li>ICH Guidelines (E3, E6, E8, E9)</li>
                        <li>Medical terminology and standards</li>
                        <li>Regulatory frameworks (FDA, EMA, PMDA)</li>
                        <li>Clinical trial design best practices</li>
                      </ul>
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <p className="font-medium">Platform Knowledge:</p>
                      <ul className="list-disc list-inside pl-2">
                        <li>3,000+ CSR document corpus</li>
                        <li>FDA FAERS adverse event database</li>
                        <li>CER generation capabilities</li>
                        <li>Scientific literature references</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="help" className="flex-1 flex flex-col mt-2">
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">About Sage, Your Research Companion</h3>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Sage is your AI research assistant, designed to help you navigate clinical trial data, 
                    understand regulatory requirements, and optimize your research workflow.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">What I Can Help With</h3>
                  <div className="mt-2 space-y-2">
                    <div className="bg-muted p-2 rounded-md flex items-start">
                      <FileSpreadsheet className="h-4 w-4 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">CSR Analysis</p>
                        <p className="text-xs text-muted-foreground">
                          Get insights from our database of 3,000+ clinical study reports
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-2 rounded-md flex items-start">
                      <PenTool className="h-4 w-4 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Protocol Design</p>
                        <p className="text-xs text-muted-foreground">
                          Guidance on endpoints, eligibility criteria, and study methodology
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-2 rounded-md flex items-start">
                      <BookOpen className="h-4 w-4 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Regulatory Guidance</p>
                        <p className="text-xs text-muted-foreground">
                          Information on ICH, FDA, EMA, and other regulatory requirements
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-2 rounded-md flex items-start">
                      <Zap className="h-4 w-4 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Workflow Assistance</p>
                        <p className="text-xs text-muted-foreground">
                          Help navigating the platform and optimizing your research process
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Effective Prompts</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="bg-muted/50 p-1.5 rounded">
                      "Find studies similar to my protocol for [indication]"
                    </p>
                    <p className="bg-muted/50 p-1.5 rounded">
                      "What are common exclusion criteria for [type] studies?"
                    </p>
                    <p className="bg-muted/50 p-1.5 rounded">
                      "Explain the key requirements for a CER under MEDDEV 2.7/1"
                    </p>
                    <p className="bg-muted/50 p-1.5 rounded">
                      "What statistical methods are used in similar trials?"
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Privacy Note</h3>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Your conversations help improve the Research Companion. The system uses OpenAI's API
                    and follows our data privacy policies. No personal health information (PHI) should be shared.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}