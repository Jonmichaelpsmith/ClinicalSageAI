/**
 * AI Assistant Panel
 * 
 * This component provides an intelligent assistant interface powered by the central
 * AI intelligence system. It adapts to the current module context to provide relevant
 * regulatory and scientific insights, help with workflow tasks, and answer questions.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useModuleIntegration, MODULE_NAMES } from './integration/ModuleIntegrationLayer';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { 
  Send, 
  Sparkles, 
  AlertCircle, 
  Lightbulb, 
  FileText,
  BookOpen,
  Workflow,
  BarChart,
  Brain,
  ArrowUpRight,
  ChevronRight,
  XCircle
} from 'lucide-react';

/**
 * Message types
 */
const MESSAGE_TYPE = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
};

/**
 * AI Assistant Panel Component
 */
export const AIAssistantPanel = ({ open, setOpen, activeModule }) => {
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [context, setContext] = useState({});
  const [activeTab, setActiveTab] = useState('chat');
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Integration hooks
  const { 
    services,
    crossModuleContext,
    getCrossModuleTasksCount
  } = useModuleIntegration();
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      // If no messages, add welcome message
      if (messages.length === 0) {
        addWelcomeMessage();
      }
      
      // Load insights and recommendations
      loadInsightsAndRecommendations();
    }
  }, [open]);
  
  // Update context when active module changes
  useEffect(() => {
    if (activeModule) {
      setContext(prev => ({
        ...prev,
        activeModule,
        moduleName: MODULE_NAMES[activeModule]
      }));
    }
  }, [activeModule]);
  
  /**
   * Add welcome message when chat is first opened
   */
  const addWelcomeMessage = () => {
    const welcomeMessage = {
      id: 'welcome',
      type: MESSAGE_TYPE.ASSISTANT,
      content: `Hello! I'm your TrialSage AI Assistant, specialized in regulatory science and drug development. I'm here to help with any questions about ${activeModule ? MODULE_NAMES[activeModule] : 'our platform'}. How can I assist you today?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };
  
  /**
   * Load insights and recommendations
   */
  const loadInsightsAndRecommendations = async () => {
    try {
      // This would normally use active context to fetch relevant insights
      // For now we'll simulate with examples
      
      // In a real implementation, this would call something like:
      // const insights = await services.intelligence.getRegulatoryInsights('user', 'current');
      // const recommendations = await services.intelligence.generateRecommendations('user', 'current');
      
      // Simulated insights
      const simulatedInsights = [
        {
          title: "Recent FDA Guidance",
          description: "New FDA guidance on clinical trial endpoints was published yesterday that may impact your ongoing studies.",
          source: "FDA.gov",
          relevance: "high",
          timestamp: new Date()
        },
        {
          title: "EMA Adaptive Pathways",
          description: "EMA has updated its position on adaptive pathways for expedited approval of medicines addressing unmet medical needs.",
          source: "EMA.europa.eu",
          relevance: "medium",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          title: "ICH Guideline Update",
          description: "ICH E6(R3) revision is nearing completion, with significant changes to risk-based monitoring requirements.",
          source: "ICH.org",
          relevance: "high",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ];
      
      // Simulated recommendations
      const simulatedRecommendations = [
        {
          title: "Update Clinical Protocols",
          description: "Consider updating your Phase 2 protocols to align with new FDA guidance on endpoint selection.",
          priority: "high",
          category: "clinical"
        },
        {
          title: "Review CMC Strategy",
          description: "Your current CMC strategy may benefit from adjustments based on recent regulatory precedents.",
          priority: "medium",
          category: "cmc"
        },
        {
          title: "Conduct Gap Analysis",
          description: "Perform a gap analysis on your current regulatory submissions against recent guidance updates.",
          priority: "medium",
          category: "regulatory"
        }
      ];
      
      setInsights(simulatedInsights);
      setRecommendations(simulatedRecommendations);
    } catch (error) {
      console.error('Error loading insights and recommendations:', error);
    }
  };
  
  /**
   * Handle message submission
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    const userMessage = {
      id: Date.now().toString(),
      type: MESSAGE_TYPE.USER,
      content: inputMessage,
      timestamp: new Date()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and set processing state
    setInputMessage('');
    setIsProcessing(true);
    
    try {
      // Get AI response
      const aiResponse = await getAIResponse(inputMessage);
      
      // Add AI response to chat
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: 'error-' + Date.now().toString(),
          type: MESSAGE_TYPE.SYSTEM,
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
          error: true,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Get AI response using the intelligence service
   * @param {string} userMessage - User message content
   * @returns {Object} - AI response message object
   */
  const getAIResponse = async (userMessage) => {
    // This would normally call the intelligence service
    // For now we'll simulate with a delayed response
    
    // Create context for the AI
    const aiContext = {
      activeModule,
      moduleName: MODULE_NAMES[activeModule],
      previousMessages: messages,
      user: services.security.currentUser,
      crossModuleContext
    };
    
    // In a real implementation, this would call something like:
    // const response = await services.intelligence.getChatResponse(userMessage, aiContext);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sample responses based on keywords
    let responseContent = "";
    
    if (userMessage.toLowerCase().includes('ind') || userMessage.toLowerCase().includes('application')) {
      responseContent = "An Investigational New Drug (IND) application is the regulatory submission that allows you to begin clinical trials. The IND Wizard module can help you prepare all required sections including CMC, nonclinical, and clinical components. Would you like me to guide you through creating a new IND?";
    } else if (userMessage.toLowerCase().includes('csr') || userMessage.toLowerCase().includes('clinical study report')) {
      responseContent = "The CSR Intelligence module helps you generate and manage Clinical Study Reports. It uses AI to extract insights from study data and automatically draft compliant reports following ICH E3 guidelines. Would you like to see how to start a new CSR?";
    } else if (userMessage.toLowerCase().includes('protocol')) {
      responseContent = "Study protocols can be created and managed in the Study Architect module. The AI can help generate protocol sections based on your therapeutic area, study phase, and objectives. Would you like me to show you how to use the protocol templates?";
    } else if (userMessage.toLowerCase().includes('regulatory') || userMessage.toLowerCase().includes('submission')) {
      responseContent = "The TrialSage platform supports regulatory submissions to FDA, EMA, PMDA, and other global authorities. The central intelligence system can help you identify submission requirements and generate submission-ready documents. Which authority are you preparing a submission for?";
    } else if (userMessage.toLowerCase().includes('blockchain')) {
      responseContent = "TrialSage uses blockchain technology to ensure document integrity and provide a verifiable audit trail for critical regulatory documents. This adds an extra layer of security and compliance, allowing you to prove document authenticity. Each document revision is cryptographically secured, preventing unauthorized modifications.";
    } else if (userMessage.toLowerCase().includes('client') || userMessage.toLowerCase().includes('biotech')) {
      responseContent = "As a CRO user, you can manage multiple biotech clients through the Client Portal. This allows you to switch between client contexts while maintaining proper data segregation. Each client's data is encrypted and secured with appropriate access controls. Would you like to learn more about client management features?";
    } else {
      responseContent = "I'm here to help with all aspects of regulatory documentation and submissions. I can assist with IND applications, CSRs, protocols, regulatory strategies, and more. I have access to up-to-date regulatory guidelines and can help ensure your documents comply with the latest requirements. What specific area would you like help with?";
    }
    
    return {
      id: 'ai-' + Date.now().toString(),
      type: MESSAGE_TYPE.ASSISTANT,
      content: responseContent,
      timestamp: new Date()
    };
  };
  
  /**
   * Handle input key press (submit on Enter)
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  /**
   * Render chat message
   */
  const renderMessage = (message) => {
    switch (message.type) {
      case MESSAGE_TYPE.USER:
        return (
          <div key={message.id} className="flex justify-end mb-4">
            <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg p-3">
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block text-right">
                {formatMessageTime(message.timestamp)}
              </span>
            </div>
          </div>
        );
        
      case MESSAGE_TYPE.ASSISTANT:
        return (
          <div key={message.id} className="flex mb-4">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="/logo.png" alt="AI Assistant" />
              <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
            </Avatar>
            <div className="max-w-[80%] bg-muted rounded-lg p-3">
              <p className="text-sm">{message.content}</p>
              <span className="text-xs text-muted-foreground mt-1 block">
                {formatMessageTime(message.timestamp)}
              </span>
            </div>
          </div>
        );
        
      case MESSAGE_TYPE.SYSTEM:
        return (
          <div key={message.id} className="flex justify-center mb-4">
            <div className={`text-sm py-2 px-3 rounded-md ${message.error ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
              {message.error && <AlertCircle className="h-4 w-4 inline-block mr-1" />}
              {message.content}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  /**
   * Format message timestamp
   */
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  /**
   * Render insights card
   */
  const renderInsightCard = (insight) => {
    return (
      <Card key={insight.title} className="mb-3">
        <CardContent className="p-3">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <Badge variant={
                insight.relevance === 'high' ? 'default' : 
                insight.relevance === 'medium' ? 'outline' : 
                'secondary'
              }>
                {insight.relevance}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">{insight.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{insight.source}</span>
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  <span className="text-xs mr-1">Details</span>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  /**
   * Render recommendation card
   */
  const renderRecommendationCard = (recommendation) => {
    return (
      <Card key={recommendation.title} className="mb-3">
        <CardContent className="p-3">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <Badge variant={
                recommendation.priority === 'high' ? 'destructive' : 
                recommendation.priority === 'medium' ? 'outline' : 
                'secondary'
              }>
                {recommendation.priority}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">{recommendation.title}</h4>
              <p className="text-xs text-muted-foreground mb-2">{recommendation.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase text-muted-foreground">{recommendation.category}</span>
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  <span className="text-xs mr-1">Apply</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/logo.png" alt="AI Assistant" />
                <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-lg">TrialSage AI Assistant</SheetTitle>
                <SheetDescription className="text-xs mt-0">
                  Powered by the Regulatory Intelligence Core
                </SheetDescription>
              </div>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <XCircle className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        
        <Tabs defaultValue="chat" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 px-4 pt-2">
            <TabsTrigger value="chat" className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
                
                {isProcessing && (
                  <div className="flex justify-center py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <Input
                  ref={inputRef}
                  placeholder="Ask a question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!inputMessage.trim() || isProcessing}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="text-xs text-muted-foreground mt-2 flex items-center">
                <Brain className="h-3 w-3 mr-1" />
                <span>Powered by GPT-4o for regulatory intelligence</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="flex-1 flex flex-col p-0 m-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1 text-primary" />
                    Regulatory Insights
                  </h3>
                  {insights ? (
                    <div>
                      {insights.map(renderInsightCard)}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading insights...</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Workflow className="h-4 w-4 mr-1 text-primary" />
                    Smart Recommendations
                  </h3>
                  {recommendations ? (
                    <div>
                      {recommendations.map(renderRecommendationCard)}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading recommendations...</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="resources" className="flex-1 flex flex-col p-0 m-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-1 text-primary" />
                    Learning Resources
                  </h3>
                  
                  <Card className="mb-3">
                    <CardContent className="p-3">
                      <h4 className="text-sm font-medium mb-1">TrialSage Platform Guide</h4>
                      <p className="text-xs text-muted-foreground mb-2">Comprehensive guide to using the TrialSage platform and all its modules.</p>
                      <Button variant="outline" size="sm" className="w-full">View Guide</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-3">
                    <CardContent className="p-3">
                      <h4 className="text-sm font-medium mb-1">Regulatory Writing Best Practices</h4>
                      <p className="text-xs text-muted-foreground mb-2">Learn effective techniques for creating compliant regulatory documents.</p>
                      <Button variant="outline" size="sm" className="w-full">View Guide</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-3">
                    <CardContent className="p-3">
                      <h4 className="text-sm font-medium mb-1">Video Tutorials</h4>
                      <p className="text-xs text-muted-foreground mb-2">Step-by-step video guides for common regulatory writing tasks.</p>
                      <Button variant="outline" size="sm" className="w-full">View Tutorials</Button>
                    </CardContent>
                  </Card>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <BarChart className="h-4 w-4 mr-1 text-primary" />
                    Regulatory Analytics
                  </h3>
                  
                  <Card className="mb-3">
                    <CardContent className="p-3">
                      <h4 className="text-sm font-medium mb-1">FDA Approval Trends</h4>
                      <p className="text-xs text-muted-foreground mb-2">Analysis of recent FDA approval patterns and success factors.</p>
                      <Button variant="outline" size="sm" className="w-full">View Analysis</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="mb-3">
                    <CardContent className="p-3">
                      <h4 className="text-sm font-medium mb-1">Regulatory Submission Metrics</h4>
                      <p className="text-xs text-muted-foreground mb-2">Performance metrics for regulatory submissions across therapeutic areas.</p>
                      <Button variant="outline" size="sm" className="w-full">View Metrics</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default AIAssistantPanel;