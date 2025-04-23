import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, Send, Sparkles, User, MessageSquare, 
  Clock, Bookmark, FileText, X, ThumbsUp, ThumbsDown
} from 'lucide-react';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Demonstration conversation history
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'system',
      content: 'Welcome to Ask Lumen™ - Your AI regulatory assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, userMessage]);
    setMessage('');
    
    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: getSimulatedResponse(message),
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1500);
  };
  
  // This is just for demonstration - in a real app you would call an API
  const getSimulatedResponse = (query) => {
    if (query.toLowerCase().includes('ind')) {
      return "An Investigational New Drug (IND) application is a regulatory document submitted to the FDA. For a typical IND submission, you need to include: cover letter, table of contents, investigational plan, investigator brochure, clinical protocols, CMC information, pharmacology and toxicology information, and previous human experience data.";
    } else if (query.toLowerCase().includes('cmc')) {
      return "Chemistry, Manufacturing, and Controls (CMC) documentation is a critical part of regulatory submissions. CMC information demonstrates that the product is manufactured consistently and meets quality standards. Key components include drug substance information, drug product information, stability data, quality control methods, and facility information.";
    } else {
      return "I'm your regulatory assistant focused on drug development, clinical trials, and regulatory submissions. I can help with IND/NDA preparation, clinical trial protocols, CMC documentation, regulatory strategy, and compliance questions. How can I assist you today?";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center">
            <Link to="/">
              <a className="flex items-center text-[#0071e3] font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </a>
            </Link>
            <h1 className="text-xl font-semibold text-[#1d1d1f] ml-6">Ask Lumen™ AI Regulatory Assistant</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-80 border-r border-[#e5e5e7] bg-[#f5f5f7]">
          <div className="p-4">
            <button className="flex items-center justify-center gap-2 w-full bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-lg px-4 py-2.5 font-medium">
              <Sparkles className="w-4 h-4" />
              New Conversation
            </button>
          </div>
          
          <div className="border-b border-[#e5e5e7] pb-2">
            <div className="px-4 py-2 flex gap-2">
              <button 
                className={`px-3 py-1.5 text-sm rounded-full ${activeCategory === 'all' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#424245] hover:bg-white/50'}`}
                onClick={() => setActiveCategory('all')}
              >
                All
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-full ${activeCategory === 'regulatory' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#424245] hover:bg-white/50'}`}
                onClick={() => setActiveCategory('regulatory')}
              >
                Regulatory
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-full ${activeCategory === 'clinical' ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#424245] hover:bg-white/50'}`}
                onClick={() => setActiveCategory('clinical')}
              >
                Clinical
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1 py-2">
            <div className="px-2 space-y-1">
              <button className="flex items-center gap-3 w-full p-2 rounded-lg bg-white shadow-sm">
                <MessageSquare className="w-4 h-4 text-[#0071e3]" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[#1d1d1f] truncate">Current Chat</div>
                  <div className="text-xs text-[#86868b] truncate">Today</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 w-full p-2 rounded-lg text-[#424245] hover:bg-white/70">
                <MessageSquare className="w-4 h-4" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium truncate">CMC Requirements for EMA</div>
                  <div className="text-xs text-[#86868b] truncate">Yesterday</div>
                </div>
              </button>
              
              <button className="flex items-center gap-3 w-full p-2 rounded-lg text-[#424245] hover:bg-white/70">
                <MessageSquare className="w-4 h-4" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium truncate">IND Submission Process</div>
                  <div className="text-xs text-[#86868b] truncate">2 days ago</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col max-h-screen">
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10">
            {messages.map(msg => (
              <div key={msg.id} className={`mb-6 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                <div className={`max-w-3xl ${msg.role === 'user' ? 'bg-[#f0f7ff] rounded-t-2xl rounded-bl-2xl' : 'bg-white border border-[#e5e5e7] rounded-t-2xl rounded-br-2xl'} p-4 shadow-sm`}>
                  <div className="flex items-center mb-2">
                    <div className={`p-1.5 rounded-full ${msg.role === 'user' ? 'bg-[#0071e3]' : 'bg-[#f5f5f7]'} mr-2`}>
                      {msg.role === 'user' ? (
                        <User className={`w-4 h-4 ${msg.role === 'user' ? 'text-white' : 'text-[#0071e3]'}`} />
                      ) : (
                        <Sparkles className={`w-4 h-4 ${msg.role === 'user' ? 'text-white' : 'text-[#0071e3]'}`} />
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {msg.role === 'user' ? 'You' : 'Lumen AI'}
                    </div>
                    <div className="ml-auto text-xs text-[#86868b] flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-[#1d1d1f] whitespace-pre-line">
                    {msg.content}
                  </div>
                  
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#e5e5e7]">
                      <div className="flex space-x-3">
                        <button className="text-[#86868b] hover:text-[#0071e3] flex items-center text-xs">
                          <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                          Helpful
                        </button>
                        <button className="text-[#86868b] hover:text-[#0071e3] flex items-center text-xs">
                          <ThumbsDown className="w-3.5 h-3.5 mr-1" />
                          Not helpful
                        </button>
                      </div>
                      <div className="flex space-x-3">
                        <button className="text-[#86868b] hover:text-[#0071e3] flex items-center text-xs">
                          <Bookmark className="w-3.5 h-3.5 mr-1" />
                          Save
                        </button>
                        <button className="text-[#86868b] hover:text-[#0071e3] flex items-center text-xs">
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-[#e5e5e7] p-4 bg-white">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about regulatory requirements or guidance..."
                  className="w-full px-4 py-3 pr-12 border border-[#e5e5e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0071e3] hover:text-[#0077ed]"
                  disabled={!message.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-center text-[#86868b] mt-2">
                Powered by OpenAI GPT-4o technology · Ask regulatory questions for FDA, EMA, or PMDA markets
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}