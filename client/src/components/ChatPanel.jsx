import { useState } from "react";

export default function ChatPanel() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState([]);

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      
      const data = await response.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (error) {
      console.error("Error asking question:", error);
      setAnswer("An error occurred while processing your question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chat with TrialSage AI</h1>
      
      <div className="flex mb-4">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask a question about your clinical trials..."
          onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
        />
        <button
          onClick={askQuestion}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r font-medium transition-colors disabled:bg-blue-400"
        >
          {isLoading ? "Processing..." : "Ask"}
        </button>
      </div>

      {answer && (
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <h2 className="font-semibold text-gray-700 mb-2">Answer:</h2>
            <div className="prose max-w-none" 
                 dangerouslySetInnerHTML={{ __html: answer.replace(/\n/g, "<br>") }} />
          </div>
          
          {sources.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-gray-600 mb-2">Sources:</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                {sources.map((source, index) => (
                  <li key={index}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}