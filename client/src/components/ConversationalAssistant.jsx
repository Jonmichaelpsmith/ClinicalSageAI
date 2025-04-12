// client/components/ConversationalAssistant.jsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ConversationalAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    try {
      const res = await fetch("/api/chat/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          thread_id: threadId,
        }),
      });
      const data = await res.json();
      setThreadId(data.thread_id);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `🧠 ${data.answer}\n\n📎 CSR Evidence: ${data.citations?.join(", ") || "N/A"}`,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={input}
          placeholder="Ask about your obesity study design, AE risk, dropout prediction, etc."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={loading}>
          Send
        </Button>
      </div>

      <div className="space-y-3">
        {messages.map((msg, idx) => (
          <Card key={idx} className="whitespace-pre-wrap text-sm">
            <CardContent>
              <strong>{msg.role === "user" ? "You" : "TrialSage"}</strong>
              <div>{msg.content}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}