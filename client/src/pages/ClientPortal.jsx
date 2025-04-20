import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Users, 
  FileText, 
  BarChart, 
  Calendar, 
  Clock, 
  FileDown, 
  ArrowRight, 
  MessageSquare, 
  BriefcaseMedical, 
  ClipboardEdit,
  BarChart2,
  Clock3,
  Bell,
  Zap,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

// Client Portal Profile Card Component
const ProfileCard = ({ client }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
    <div className="flex items-center mb-4">
      <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center">
        <Users className="h-8 w-8 text-rose-600" />
      </div>
      <div className="ml-4">
        <h3 className="text-xl font-semibold text-gray-900">{client.name}</h3>
        <p className="text-sm text-gray-500">{client.type}</p>
      </div>
    </div>
    <div className="border-t border-gray-100 pt-4 mt-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500">Client ID</p>
          <p className="text-sm font-medium">{client.id}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Status</p>
          <p className="text-sm font-medium flex items-center">
            <span className={`w-2 h-2 rounded-full mr-1.5 ${client.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            {client.status}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Primary Contact</p>
          <p className="text-sm font-medium">{client.contact}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Projects</p>
          <p className="text-sm font-medium">{client.projectCount}</p>
        </div>
      </div>
    </div>
  </div>
);

// Recent Activity Component
const ActivityCard = ({ activities }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Clock className="mr-2 h-5 w-5 text-rose-600" />
      Recent Activity
    </h3>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
          <div className="flex items-start">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${activity.iconBg}`}>
              {activity.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
    <button className="text-rose-600 hover:text-rose-800 text-sm font-medium mt-3 inline-flex items-center">
      View All Activity
      <ArrowRight size={14} className="ml-1" />
    </button>
  </div>
);

// Quick Actions Component
const QuickActionsCard = ({ actions }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Zap className="mr-2 h-5 w-5 text-rose-600" />
      Quick Actions
    </h3>
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <Link key={index} href={action.link}>
          <div className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${action.iconBg}`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium">{action.title}</span>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

// Project Stats Component
const ProjectStatsCard = ({ stats }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <BarChart className="mr-2 h-5 w-5 text-rose-600" />
        Project Statistics
      </h3>
      <select className="text-sm border-gray-200 rounded-md px-2 py-1">
        <option>Last 30 Days</option>
        <option>Last 90 Days</option>
        <option>Year to Date</option>
      </select>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
          {stat.icon}
          <p className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</p>
          <p className="text-xs font-medium text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

// AI Chat Widget Component
const AIChatWidget = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your TrialSage AI assistant. How can I help with your clinical and regulatory projects today?", isAI: true },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef(null);

  // Function to handle sending messages to the AI Co-pilot
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message to the chat
    const newUserMessage = { text: inputValue, isAI: false };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Clear input field
    setInputValue('');
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Make API call to OpenAI service
      const response = await fetch('/api/cer/ai-copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          history: messages.map(msg => ({
            role: msg.isAI ? 'assistant' : 'user',
            content: msg.text
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI Co-pilot');
      }
      
      const data = await response.json();
      
      // Add AI response to the chat
      setMessages(prev => [...prev, { text: data.response, isAI: true }]);
    } catch (error) {
      console.error('Error communicating with AI Co-pilot:', error);
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I'm having trouble connecting to the AI service. Please try again in a moment.", 
        isAI: true 
      }]);
    } finally {
      // Clear loading state
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Auto-scroll to the bottom of the chat when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          <h3 className="font-semibold">AI Industry Co-pilot</h3>
        </div>
        <div className="flex space-x-2">
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-rose-700 text-white">
            Pharma Expert
          </span>
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-rose-700 text-white">
            Regulatory
          </span>
        </div>
      </div>
      
      <div className="h-72 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-3 ${message.isAI ? 'flex' : 'flex justify-end'}`}
          >
            {message.isAI && (
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center mr-2 flex-shrink-0">
                <Lightbulb className="h-3.5 w-3.5 text-rose-600" />
              </div>
            )}
            <div 
              className={`py-2 px-3 rounded-lg ${
                message.isAI 
                  ? 'bg-white border border-gray-200 text-gray-800' 
                  : 'bg-rose-600 text-white'
              } max-w-[80%]`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex mb-3">
            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center mr-2 flex-shrink-0">
              <Lightbulb className="h-3.5 w-3.5 text-rose-600" />
            </div>
            <div className="py-2 px-3 rounded-lg bg-white border border-gray-200 max-w-[80%]">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            placeholder="Ask me anything about your clinical trials..."
            className="flex-1 border border-gray-200 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="bg-rose-600 text-white px-4 py-2 rounded-r-md hover:bg-rose-700 transition-colors disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Upcoming Deadlines Component
const UpcomingDeadlines = ({ deadlines }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Calendar className="mr-2 h-5 w-5 text-rose-600" />
      Upcoming Deadlines
    </h3>
    <div className="space-y-3">
      {deadlines.map((deadline, index) => (
        <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
          <div className={`w-10 h-10 rounded-md flex items-center justify-center mr-3 ${deadline.urgencyClass}`}>
            {deadline.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
            <p className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {deadline.dueDate}
            </p>
          </div>
          <Link href={deadline.link}>
            <button className="text-rose-600 hover:text-rose-800">
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      ))}
    </div>
  </div>
);

// Document List Component
const RecentDocuments = ({ documents }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <FileText className="mr-2 h-5 w-5 text-rose-600" />
      Recent Documents
    </h3>
    <div className="space-y-3">
      {documents.map((document, index) => (
        <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-md group">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
            <FileText className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{document.title}</p>
            <p className="text-xs text-gray-500">{document.type} • {document.date}</p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="text-gray-500 hover:text-rose-600 p-1"
              title="Download"
            >
              <FileDown size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
    <button className="text-rose-600 hover:text-rose-800 text-sm font-medium mt-3 inline-flex items-center">
      View All Documents
      <ArrowRight size={14} className="ml-1" />
    </button>
  </div>
);

export default function ClientPortal() {
  // Sample client data
  const client = {
    id: "CLT-2023-0458",
    name: "BioPharma Innovations, Inc.",
    type: "Pharmaceutical",
    status: "Active",
    contact: "Sarah Johnson",
    projectCount: 7
  };

  // Sample project statistics
  const projectStats = [
    { 
      icon: <FileText className="h-6 w-6 text-blue-500 mx-auto" />,
      value: "12", 
      label: "Active CSRs" 
    },
    { 
      icon: <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />,
      value: "4", 
      label: "Completed" 
    },
    { 
      icon: <Clock3 className="h-6 w-6 text-amber-500 mx-auto" />,
      value: "3", 
      label: "Pending Review" 
    },
    { 
      icon: <Bell className="h-6 w-6 text-rose-500 mx-auto" />,
      value: "2", 
      label: "Due This Week" 
    }
  ];

  // Sample quick actions
  const quickActions = [
    {
      title: "New CSR",
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      iconBg: "bg-blue-100",
      link: "/cer-generator"
    },
    {
      title: "IND Submission",
      icon: <BriefcaseMedical className="h-4 w-4 text-green-500" />,
      iconBg: "bg-green-100",
      link: "/submission-builder"
    },
    {
      title: "QC Review",
      icon: <ClipboardEdit className="h-4 w-4 text-amber-500" />,
      iconBg: "bg-amber-100",
      link: "/qc-dashboard"
    },
    {
      title: "Analytics",
      icon: <BarChart2 className="h-4 w-4 text-purple-500" />,
      iconBg: "bg-purple-100",
      link: "/analytics"
    }
  ];

  // Sample recent activities
  const activities = [
    {
      title: "CSR Report Generated",
      description: "FDA Clinical Evaluation Report for Oncology Drug X was successfully generated.",
      time: "Today, 2:45 PM",
      icon: <FileText className="h-4 w-4 text-white" />,
      iconBg: "bg-blue-500"
    },
    {
      title: "IND Submission Prepared",
      description: "IND submission package for Project Theta was prepared and is ready for QC.",
      time: "Yesterday, 11:30 AM",
      icon: <BriefcaseMedical className="h-4 w-4 text-white" />,
      iconBg: "bg-green-500"
    },
    {
      title: "QC Review Completed",
      description: "Module 2.7 Clinical Summary passed QC review with no major findings.",
      time: "Apr 18, 2025",
      icon: <CheckCircle className="h-4 w-4 text-white" />,
      iconBg: "bg-rose-500"
    }
  ];

  // Sample upcoming deadlines
  const deadlines = [
    {
      title: "FDA Response for BLA123456",
      dueDate: "Due in 2 days",
      urgencyClass: "bg-red-100 text-red-600",
      icon: <Clock className="h-5 w-5" />,
      link: "/projects/bla123456"
    },
    {
      title: "Module 3 QC Review",
      dueDate: "Due in 5 days",
      urgencyClass: "bg-amber-100 text-amber-600",
      icon: <ClipboardEdit className="h-5 w-5" />,
      link: "/qc/module3-review"
    },
    {
      title: "PMDA Annual Report Submission",
      dueDate: "Due in 14 days",
      urgencyClass: "bg-blue-100 text-blue-600",
      icon: <FileText className="h-5 w-5" />,
      link: "/reports/pmda-annual"
    }
  ];

  // Sample recent documents
  const documents = [
    {
      title: "Oncology Drug X - FDA CER",
      type: "Clinical Evaluation Report",
      date: "Apr 20, 2025"
    },
    {
      title: "Project Theta - Module 2.5",
      type: "Clinical Overview",
      date: "Apr 19, 2025"
    },
    {
      title: "Antibody Therapy - EMA CER",
      type: "Clinical Evaluation Report",
      date: "Apr 15, 2025"
    },
    {
      title: "Project Gamma - Module 1",
      type: "Administrative Information",
      date: "Apr 10, 2025"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-800 to-rose-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Client Portal</h1>
          <p className="text-rose-100 mt-1">
            Access your clinical and regulatory projects, reports, and AI assistance.
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <ProfileCard client={client} />
            
            {/* Project Stats */}
            <ProjectStatsCard stats={projectStats} />
            
            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActivityCard activities={activities} />
              <QuickActionsCard actions={quickActions} />
            </div>
            
            {/* Deadlines & Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UpcomingDeadlines deadlines={deadlines} />
              <RecentDocuments documents={documents} />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Chat Widget */}
            <AIChatWidget />
            
            {/* Quick Links */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/cer-generator">
                  <a className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-rose-600" />
                    CER Generator
                  </a>
                </Link>
                <Link href="/submission-builder">
                  <a className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium flex items-center">
                    <BriefcaseMedical className="h-4 w-4 mr-2 text-rose-600" />
                    Submission Builder
                  </a>
                </Link>
                <Link href="/analytics">
                  <a className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-rose-600" />
                    Analytics Dashboard
                  </a>
                </Link>
                <Link href="/account">
                  <a className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2 text-rose-600" />
                    Account Settings
                  </a>
                </Link>
              </div>
            </div>
            
            {/* Help & Support */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-100 p-5">
              <h3 className="text-lg font-semibold text-rose-900 mb-2">Need Help?</h3>
              <p className="text-sm text-rose-800 mb-3">
                Our support team is available 24/7 to assist you with any questions.
              </p>
              <button className="text-sm bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}