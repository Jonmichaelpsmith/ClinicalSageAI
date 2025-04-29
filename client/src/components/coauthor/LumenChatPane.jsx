import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Send, User, Bot, Paperclip, ArrowDown, Copy } from 'lucide-react';

export default function LumenChatPane({ contextId }) {
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'system-1',
      role: 'system',
      content: `Welcome to Ask Lumen, your regulatory AI assistant. I have context about section ${contextId} and can help you draft content, check compliance, or answer questions about regulatory requirements.`
    },
    {
      id: 'assistant-1',
      role: 'assistant',
      content: 'How can I help with your Clinical Summary section today?'
    }
  ]);
  
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: getAiResponse(inputText)
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };
  
  // Simple deterministic responses for demo
  const getAiResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('ich') && lowerQuery.includes('e3')) {
      return 'ICH E3 guideline requires the Clinical Summary (Section 2.7) to provide a detailed yet concise summary of all clinical data relevant to the drug\'s efficacy and safety. You should organize by indication, with clear tables and figures supporting key findings. The most critical studies should be highlighted with comprehensive analysis.';
    }
    
    if (lowerQuery.includes('stat') || lowerQuery.includes('significance')) {
      return 'For statistical significance in your Clinical Summary, you should:\n\n1. Clearly state your primary and secondary endpoints\n2. Define statistical methods used for each analysis\n3. Report p-values and confidence intervals\n4. Discuss clinical relevance of statistically significant findings\n5. Address any multiple comparison issues\n\nWould you like me to help draft a statistical methods section?';
    }
    
    if (lowerQuery.includes('template') || lowerQuery.includes('structure')) {
      return 'Here\'s a recommended structure for your Clinical Summary:\n\n**2.7.1 Summary of Biopharmaceutic Studies**\n- Bioavailability results\n- In vitro-in vivo correlation\n\n**2.7.2 Summary of Clinical Pharmacology**\n- Mechanism of action\n- Drug-drug interactions\n\n**2.7.3 Summary of Clinical Efficacy**\n- Study designs and results\n- Dose response relationships\n\n**2.7.4 Summary of Clinical Safety**\n- Exposure data\n- Adverse events analysis\n\nWould you like me to expand on any section?';
    }
    
    return 'I can help with that. Would you like me to suggest specific content for your Clinical Summary section, provide regulatory guidance, or analyze your current draft for compliance issues?';
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg flex items-center">
          <BrainCircuit className="h-5 w-5 mr-2 text-purple-600" />
          Ask Lumen AI
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[350px] overflow-y-auto p-4">
          {chatMessages.map(message => (
            <div 
              key={message.id}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[80%] rounded-lg p-3
                  ${message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.role === 'system' 
                      ? 'bg-gray-100 text-gray-700 italic border'
                      : 'bg-gray-100 text-gray-800 border'
                  }
                `}
              >
                <div className="flex items-center mb-1">
                  {message.role === 'user' ? (
                    <>
                      <span className="font-medium text-sm">You</span>
                      <User className="h-3 w-3 ml-1" />
                    </>
                  ) : message.role === 'system' ? (
                    <span className="font-medium text-sm text-gray-500">System</span>
                  ) : (
                    <>
                      <span className="font-medium text-sm">Lumen AI</span>
                      <Bot className="h-3 w-3 ml-1" />
                    </>
                  )}
                </div>
                <div className="text-sm whitespace-pre-line">
                  {message.content}
                </div>
                
                {/* Action buttons for assistant messages */}
                {message.role === 'assistant' && message.content.length > 20 && (
                  <div className="flex justify-end mt-2 gap-2">
                    <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </button>
                    <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                      <ArrowDown className="h-3 w-3 mr-1" /> Insert
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-3 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about regulations, writing help, analysis..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button variant="outline" size="icon" title="Attach file">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Lumen has context about Section 2.7 and relevant regulatory requirements
          </p>
        </div>
      </CardContent>
    </Card>
  );
}