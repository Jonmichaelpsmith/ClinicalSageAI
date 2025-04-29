import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, User, Cpu, Copy, CheckCircle, Brain, FileQuestion, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function LumenChatPane({ contextId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'system',
      content: 'Welcome to Lumen AI Assistant! Ask me anything about regulatory guidelines or drafting help for this section.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const scrollAreaRef = useRef(null);
  const inputRef = useRef(null);
  
  // Simulate automatic scrolling to bottom of chat
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  }, [messages]);
  
  // Function to add a user message and generate a response
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simulate AI typing indicator
    setIsTyping(true);
    
    // Simulate AI response based on context
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, contextId);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse
      }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay to feel more natural
  };
  
  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Copy message content to clipboard
  const handleCopyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied to clipboard."
      });
      
      // Reset copied status after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    });
  };
  
  // Insert AI suggestion into editor
  const handleInsertSuggestion = (text) => {
    // This would typically dispatch an event to the parent component
    // or use a context/state management to update the editor content
    toast({
      title: "Content inserted",
      description: "AI suggestion has been inserted into your draft."
    });
  };
  
  // Simulate AI responses based on the question and section context
  const generateAIResponse = (question, sectionId) => {
    // Context-aware responses based on the specific section
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('ich') && lowerQuestion.includes('e3')) {
      return `## ICH E3 Guidelines for Section ${sectionId}\n\nFor the Clinical Summary section, ICH E3 recommends:\n\n1. **Comprehensive Overview:** Provide a clear, concise summary of all clinical findings.\n\n2. **Study Design:** Summarize the design of pivotal studies, including randomization methods and blinding procedures.\n\n3. **Efficacy Results:** Present the primary and secondary endpoint results with appropriate statistical analyses.\n\n4. **Safety Analysis:** Include a thorough evaluation of adverse events, laboratory findings, and other safety parameters.\n\n5. **Benefit-Risk Assessment:** Conclude with an integrated benefit-risk assessment supporting the proposed indication.`;
    }
    
    if (lowerQuestion.includes('template') || lowerQuestion.includes('structure')) {
      return `# Recommended Structure for Section ${sectionId}\n\n## 2.7.1 Summary of Biopharmaceutic Studies\n- Bioavailability results\n- Comparative BA/BE studies\n- In vitro dissolution studies\n\n## 2.7.2 Summary of Clinical Pharmacology\n- Mechanism of action\n- PK characteristics\n- Drug interactions\n\n## 2.7.3 Summary of Clinical Efficacy\n- Study demographics\n- Primary endpoints\n- Secondary analyses\n- Subgroup analyses\n\n## 2.7.4 Summary of Clinical Safety\n- Exposure\n- Adverse events\n- Laboratory findings\n- Vital signs\n\nI can help draft any of these subsections for you.`;
    }
    
    if (lowerQuestion.includes('table') || lowerQuestion.includes('data')) {
      return `Here's a sample data table format for Section ${sectionId}:\n\n| Study ID | Design | N | Primary Endpoint | Result | P-value |\n|---------|--------|---|-----------------|--------|--------|\n| ABC-123 | RCT, DB, PC | 305 | HbA1c change | -1.2% | <0.001 |\n| ABC-124 | RCT, DB, AC | 411 | HbA1c change | -1.1% | <0.001 |\n| ABC-125 | OL, Extension | 527 | TEAE incidence | 12.3% | - |\n\nWould you like me to generate a specific table for your clinical data?`;
    }
    
    if (lowerQuestion.includes('references') || lowerQuestion.includes('cite')) {
      return `For Section ${sectionId}, include these key references:\n\n1. Smith J, et al. (2023). Novel approaches for treatment of diabetes mellitus. *J Clin Res*. 45(2):112-119.\n\n2. European Medicines Agency (2024). Guideline on clinical development of products for treatment of diabetes mellitus. EMA/CHMP/27994/2024.\n\n3. FDA Guidance (2023). Type 2 Diabetes Mellitus: Developing Drugs and Therapeutic Biologics for Treatment and Prevention. FDA-2023-D-3005.\n\nI can format these references according to your preferred citation style.`;
    }
    
    // Default response when no specific context is detected
    return `I can help you draft content for Section ${sectionId}. For the Clinical Summary, consider including:\n\n- Overview of clinical development program\n- Summary of key efficacy findings across studies\n- Integrated safety analysis with focus on serious adverse events\n- Dose-response relationships and key subgroup analyses\n- Benefit-risk conclusions supporting the proposed indication\n\nWould you like me to help draft any specific part of this section?`;
  };
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between bg-blue-50 p-3 border-b">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-800">Lumen AI Chat Assistant</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <FileQuestion className="h-4 w-4" />
            <span>Section {contextId} Context-Aware</span>
          </div>
        </div>
        
        <ScrollArea className="h-[350px] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                      : message.role === 'system'
                        ? 'bg-gray-100 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg border border-gray-200'
                        : 'bg-gradient-to-r from-indigo-50 to-blue-50 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg border border-blue-100'
                  } p-3 relative`}
                >
                  {message.role !== 'user' && (
                    <div className="flex-shrink-0 mt-1">
                      {message.role === 'system' ? (
                        <Cpu className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Sparkles className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    <div className="text-sm whitespace-pre-wrap" style={{ overflowWrap: 'break-word' }}>
                      {message.content}
                    </div>
                    
                    {/* Action buttons for AI messages */}
                    {message.role === 'assistant' && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-gray-600 hover:text-blue-700 hover:bg-blue-100"
                          onClick={() => handleCopyToClipboard(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-gray-600 hover:text-blue-700 hover:bg-blue-100"
                          onClick={() => handleInsertSuggestion(message.content)}
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span>Insert</span>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 mt-1 ml-2">
                      <User className="h-5 w-5 text-blue-200" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* AI typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-3 max-w-[80%] flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <div className="flex space-x-1 items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-2">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask Lumen AI about regulatory guidelines, section content, or drafting help..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              className="focus-visible:ring-blue-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-1 px-2">
            Context: Clinical Summary (Section {contextId}) • Powered by LumenAI™
          </div>
        </div>
      </CardContent>
    </Card>
  );
}