import React from 'react';
import ChatPanelComponent from '../components/ChatPanel';
import TopNavigation from '../components/TopNavigation';

const ChatPanel: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavigation />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Chat with TrialSage AI</h1>
        <p className="text-gray-600 mb-6">
          Ask questions about your clinical trial documents and get AI-powered answers with relevant citations.
        </p>
        <ChatPanelComponent />
      </div>
    </div>
  );
};

export default ChatPanel;