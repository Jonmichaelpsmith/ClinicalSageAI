import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  MessageSquare, 
  FileText, 
  BarChart, 
  Database, 
  Zap, 
  BookOpen,
  ClipboardCheck, 
  PieChart, 
  Share2, 
  Download, 
  Copy, 
  ChevronRight, 
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Info,
  Edit,
  ClipboardList,
  Shield
} from 'lucide-react';

// Agent Capability Card Component
const CapabilityCard = ({ title, description, icon, color }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

// Response Card Component for AI-generated content
const ResponseCard = ({ title, content, type, onDownload, onCopy }) => {
  const [expanded, setExpanded] = useState(false);

  // Set the appropriate icon based on content type
  let icon;
  switch (type) {
    case 'text':
      icon = <FileText className="h-4 w-4 text-blue-500" />;
      break;
    case 'data':
      icon = <Database className="h-4 w-4 text-indigo-500" />;
      break;
    case 'analysis':
      icon = <BarChart className="h-4 w-4 text-amber-500" />;
      break;
    default:
      icon = <FileText className="h-4 w-4 text-gray-500" />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div 
        className="px-4 py-3 bg-gray-50 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          {icon}
          <h3 className="text-sm font-medium text-gray-900 ml-2">{title}</h3>
        </div>
        <div className="flex items-center">
          {onCopy && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
          {onDownload && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500 ml-1" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 text-sm text-gray-700 border-t border-gray-200 whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
};

// Citation Component
const Citation = ({ source, title, url }) => (
  <div className="flex items-start space-x-2 p-2 border-b border-gray-100 last:border-0">
    <BookOpen className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-gray-500">{source}</p>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
          View Source
        </a>
      )}
    </div>
  </div>
);

// AI Message Types
const messageTypes = {
  THINKING: 'thinking',
  ANSWER: 'answer',
  ERROR: 'error',
  CITATION: 'citation',
  USER: 'user',
  ANALYSIS: 'analysis',
  FILES: 'files'
};

export default function AIAdvancedAgent() {
  // Chat state
  const [messages, setMessages] = useState([
    { 
      type: messageTypes.ANSWER,
      content: "Hello, I'm your TrialSage AI Industry Co-pilot. I specialize in regulatory and clinical document analysis, generation, and intelligence extraction. How can I assist you today?"
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMode, setActiveMode] = useState('analyst'); // analyst, generator, advisor
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Sample AI agent capabilities
  const capabilities = {
    analyst: [
      {
        title: 'CSR Analysis',
        description: 'Extract key insights and data points from Clinical Study Reports',
        icon: <FileText className="h-5 w-5 text-white" />,
        color: 'bg-blue-500'
      },
      {
        title: 'Regulatory Comparison',
        description: 'Compare requirements across FDA, EMA, PMDA, and Health Canada',
        icon: <ClipboardCheck className="h-5 w-5 text-white" />,
        color: 'bg-green-500'
      },
      {
        title: 'Safety Signal Detection',
        description: 'Identify potential safety signals from FAERS and other data sources',
        icon: <AlertCircle className="h-5 w-5 text-white" />,
        color: 'bg-amber-500'
      },
      {
        title: 'Data Visualization',
        description: 'Generate visual representations of clinical and regulatory data',
        icon: <PieChart className="h-5 w-5 text-white" />,
        color: 'bg-purple-500'
      }
    ],
    generator: [
      {
        title: 'CER Template Generation',
        description: 'Create region-specific clinical evaluation report templates',
        icon: <FileText className="h-5 w-5 text-white" />,
        color: 'bg-rose-500'
      },
      {
        title: 'IND Section Drafting',
        description: 'Generate draft content for IND sections based on guidelines',
        icon: <Edit className="h-5 w-5 text-white" />,
        color: 'bg-indigo-500'
      },
      {
        title: 'Protocol Development',
        description: 'Create study protocol sections aligned with best practices',
        icon: <ClipboardList className="h-5 w-5 text-white" />,
        color: 'bg-cyan-500'
      },
      {
        title: 'Summary Creation',
        description: 'Generate executive summaries from complex clinical data',
        icon: <FileText className="h-5 w-5 text-white" />,
        color: 'bg-emerald-500'
      }
    ],
    advisor: [
      {
        title: 'Regulatory Strategy',
        description: 'Provide guidance on optimal submission strategies by region',
        icon: <Lightbulb className="h-5 w-5 text-white" />,
        color: 'bg-amber-500'
      },
      {
        title: 'Scientific Advice',
        description: 'Offer insights on study design and clinical development',
        icon: <Brain className="h-5 w-5 text-white" />,
        color: 'bg-purple-500'
      },
      {
        title: 'Best Practices',
        description: 'Recommend industry best practices for documentation and submissions',
        icon: <CheckCircle className="h-5 w-5 text-white" />,
        color: 'bg-green-500'
      },
      {
        title: 'Compliance Guidance',
        description: 'Advise on regulatory compliance requirements and updates',
        icon: <Shield className="h-5 w-5 text-white" />,
        color: 'bg-blue-500'
      }
    ]
  };

  // Agent personas
  const personas = {
    analyst: {
      title: 'Regulatory Intelligence Analyst',
      description: 'Specialized in data extraction, pattern recognition, and regulatory intelligence.',
      icon: <Database className="h-5 w-5 text-white" />,
      color: 'bg-blue-600'
    },
    generator: {
      title: 'Document Generation Expert',
      description: 'Focused on creating compliant regulatory and clinical documents.',
      icon: <FileText className="h-5 w-5 text-white" />,
      color: 'bg-rose-600'
    },
    advisor: {
      title: 'Strategic Regulatory Advisor',
      description: 'Provides strategic guidance on regulatory submissions and pathways.',
      icon: <Lightbulb className="h-5 w-5 text-white" />,
      color: 'bg-amber-600'
    }
  };

  // Handle chat input submission
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = {
      type: messageTypes.USER,
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Show thinking state
    setIsProcessing(true);
    setMessages(prev => [
      ...prev, 
      { type: messageTypes.THINKING, content: 'Searching for relevant information...' }
    ]);
    
    try {
      // Make API call to OpenAI service
      const response = await fetch('/api/cer/ai-copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          history: messages
            .filter(msg => msg.type === messageTypes.USER || msg.type === messageTypes.ANSWER)
            .map(msg => ({
              role: msg.type === messageTypes.USER ? 'user' : 'assistant',
              content: msg.content
            })),
          mode: activeMode
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI agent');
      }
      
      const data = await response.json();
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.type !== messageTypes.THINKING));
      
      // Add AI response
      setMessages(prev => [...prev, { 
        type: messageTypes.ANSWER, 
        content: data.response 
      }]);
      
      // Add citations if available
      if (data.citations && data.citations.length > 0) {
        setMessages(prev => [...prev, { 
          type: messageTypes.CITATION, 
          content: data.citations 
        }]);
      }
      
      // Add analysis if available
      if (data.analysis) {
        setMessages(prev => [...prev, { 
          type: messageTypes.ANALYSIS, 
          content: data.analysis,
          title: 'Detailed Analysis'
        }]);
      }
      
    } catch (error) {
      console.error('Error communicating with AI agent:', error);
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.type !== messageTypes.THINKING));
      
      // Add error message
      setMessages(prev => [...prev, { 
        type: messageTypes.ERROR, 
        content: "I'm sorry, I encountered an error while processing your request. Please try again in a moment." 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Function to handle copying content to clipboard
  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        // Show toast or notification (implement later)
        console.log('Content copied to clipboard');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  // Function to handle downloading content
  const handleDownloadContent = (content, title = 'ai-response') => {
    const blob = new Blob([content], { type: 'text/plain' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Focus input after sending a message
    if (!isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isProcessing]);

  // Render chat message based on type
  const renderMessage = (message, index) => {
    switch (message.type) {
      case messageTypes.USER:
        return (
          <div key={index} className="flex justify-end mb-4">
            <div className="bg-rose-600 text-white rounded-lg py-2 px-4 max-w-[80%]">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        );
      
      case messageTypes.ANSWER:
        return (
          <div key={index} className="flex mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
              <Brain className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 max-w-[80%] shadow-sm">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        );
      
      case messageTypes.THINKING:
        return (
          <div key={index} className="flex mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
              <Brain className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 max-w-[80%] shadow-sm">
              <div className="flex items-center">
                <p className="text-sm text-gray-600 mr-2">{message.content}</p>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case messageTypes.ERROR:
        return (
          <div key={index} className="flex mb-4">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2 flex-shrink-0">
              <AlertCircle className="h-4.5 w-4.5 text-red-600" />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg py-3 px-4 max-w-[80%]">
              <p className="text-sm text-red-800">{message.content}</p>
            </div>
          </div>
        );
      
      case messageTypes.CITATION:
        return (
          <div key={index} className="mb-4 ml-10 max-w-[80%]">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                <Info className="h-3.5 w-3.5 mr-1" />
                Sources & Citations
              </h4>
              <div className="divide-y divide-gray-100">
                {message.content.map((citation, idx) => (
                  <Citation 
                    key={idx} 
                    source={citation.source} 
                    title={citation.title} 
                    url={citation.url} 
                  />
                ))}
              </div>
            </div>
          </div>
        );
      
      case messageTypes.ANALYSIS:
        return (
          <div key={index} className="mb-4 ml-10 max-w-[80%]">
            <ResponseCard
              title={message.title || 'Analysis'}
              content={message.content}
              type="analysis"
              onCopy={() => handleCopyContent(message.content)}
              onDownload={() => handleDownloadContent(message.content, message.title || 'Analysis')}
            />
          </div>
        );
      
      case messageTypes.FILES:
        return (
          <div key={index} className="mb-4 ml-10 max-w-[80%]">
            <ResponseCard
              title="Generated Files"
              content={message.content}
              type="text"
              onDownload={() => handleDownloadContent(message.content, 'Generated Files')}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TrialSage AI Industry Co-pilot</h1>
              <p className="text-blue-100 mt-1">
                Advanced conversational agent for regulatory and clinical intelligence
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agent Mode Selector */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Persona</h3>
              
              <div className="space-y-3">
                {Object.entries(personas).map(([key, persona]) => (
                  <div 
                    key={key}
                    onClick={() => setActiveMode(key)}
                    className={`
                      flex items-center p-3 rounded-lg cursor-pointer
                      ${activeMode === key 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}
                    `}
                  >
                    <div className={`w-9 h-9 rounded-full ${persona.color} flex items-center justify-center mr-3`}>
                      {persona.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{persona.title}</h4>
                      <p className="text-xs text-gray-500">{persona.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Agent Capabilities */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Capabilities</h3>
              <div className="grid grid-cols-1 gap-3">
                {capabilities[activeMode].map((capability, index) => (
                  <CapabilityCard 
                    key={index}
                    title={capability.title}
                    description={capability.description}
                    icon={capability.icon}
                    color={capability.color}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[calc(100vh-12rem)]">
              {/* Chat Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${personas[activeMode].color} flex items-center justify-center mr-2`}>
                      {personas[activeMode].icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{personas[activeMode].title}</h3>
                      <p className="text-xs text-gray-500">Powered by Concept2Cures.AI</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-500 hover:text-gray-700 p-1 text-xs rounded-md border border-gray-200 bg-white px-2 py-1 flex items-center">
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      Share
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 p-1 text-xs rounded-md border border-gray-200 bg-white px-2 py-1 flex items-center">
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="p-4 overflow-y-auto h-[calc(100%-8rem)]">
                <div className="space-y-4">
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end">
                  <textarea
                    ref={inputRef}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 min-h-[2.5rem] max-h-[8rem] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    placeholder={`Ask ${personas[activeMode].title.toLowerCase()} a question...`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isProcessing}
                    rows={1}
                  />
                  <button
                    className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isProcessing}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>Powered by Concept2Cures.AI's regulatory and clinical intelligence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}