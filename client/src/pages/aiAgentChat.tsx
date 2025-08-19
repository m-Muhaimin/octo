import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  BarChart,
  Activity,
  Sparkles,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface EnhancedAIAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  confidence?: number;
  sources?: string[];
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  query: string;
  description: string;
}

export default function EnhancedAIAssistantModal({
  open,
  onOpenChange,
}: EnhancedAIAssistantModalProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "1",
      type: "system",
      content:
        "🏥 **AI Medical Practice Assistant Ready**\n\nI can analyze your real practice data including patients, appointments, transactions, and financial metrics. Ask me about:\n\n• Financial performance and revenue analysis\n• Patient trends and demographics\n• Appointment scheduling efficiency\n• Transaction patterns and billing insights\n• Operational recommendations\n\nWhat would you like to analyze?",
      timestamp: new Date(),
      confidence: 100,
    },
  ]);

  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: "1",
      label: "Financial Summary",
      icon: DollarSign,
      query:
        "Provide a comprehensive financial analysis including revenue, expenses, and net income with actionable recommendations",
      description: "Revenue, expenses, and profitability analysis",
    },
    {
      id: "2",
      label: "Patient Analytics",
      icon: Users,
      query:
        "Analyze patient demographics, growth trends, and patient engagement patterns",
      description: "Patient demographics and growth analysis",
    },
    {
      id: "3",
      label: "Appointment Insights",
      icon: Activity,
      query:
        "Review appointment scheduling efficiency, completion rates, and scheduling optimization opportunities",
      description: "Scheduling efficiency and optimization",
    },
    {
      id: "4",
      label: "Transaction Analysis",
      icon: BarChart,
      query:
        "Examine transaction patterns, payment methods, and outstanding payments with collection recommendations",
      description: "Payment patterns and collection insights",
    },
    {
      id: "5",
      label: "Performance Report",
      icon: TrendingUp,
      query:
        "Generate an overall practice performance report with key metrics and improvement recommendations",
      description: "Complete practice performance overview",
    },
    {
      id: "6",
      label: "Risk Assessment",
      icon: FileText,
      query:
        "Identify potential risks in billing, appointments, and patient management with mitigation strategies",
      description: "Risk identification and mitigation",
    },
  ];

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStreamingResponse = async (query: string) => {
    setIsLoading(true);
    setIsStreaming(true);

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: "user",
      content: query,
      timestamp: new Date(),
    };

    // Add streaming assistant message placeholder
    const assistantMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      confidence: 95,
      sources: [
        "Real Practice Data",
        "Financial Analytics",
        "Patient Database",
      ],
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          dataTypes: ["patients", "appointments", "transactions", "metrics"],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        accumulatedContent += chunk;

        // Update the streaming message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: accumulatedContent }
              : msg,
          ),
        );
      }

      // Mark as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id ? { ...msg, isStreaming: false } : msg,
        ),
      );
    } catch (error) {
      console.error("Streaming error:", error);

      // Update with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content:
                  "❌ **Analysis Error**\n\nI encountered an error while analyzing your practice data. Please try again or contact support if the issue persists.\n\nError: " +
                  (error instanceof Error ? error.message : "Unknown error"),
                isStreaming: false,
                confidence: 0,
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || isLoading) return;

    handleStreamingResponse(currentMessage.trim());
    setCurrentMessage("");
  };

  const handleQuickAction = (action: QuickAction) => {
    if (isLoading) return;
    handleStreamingResponse(action.query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-medisight-teal" />
            <span>AI Practice Assistant</span>
            <Badge variant="secondary" className="ml-2">
              Enhanced Analytics
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex space-x-4 min-h-0">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea
              ref={scrollAreaRef}
              className="flex-1 p-4 border rounded-lg"
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.type === "user"
                          ? "bg-medisight-teal text-white"
                          : message.type === "system"
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-gray-50 border border-gray-200"
                      } rounded-lg p-3`}
                    >
                      {message.type !== "user" && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Bot className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {message.type === "system"
                              ? "System"
                              : "AI Assistant"}
                          </span>
                          {message.isStreaming && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-medisight-teal rounded-full animate-pulse"></div>
                              <span className="text-xs text-gray-500">
                                Analyzing...
                              </span>
                            </div>
                          )}
                          {message.confidence && !message.isStreaming && (
                            <Badge variant="outline" className="text-xs">
                              {message.confidence}% confidence
                            </Badge>
                          )}
                        </div>
                      )}
                      <div
                        className="text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: formatMessageContent(message.content),
                        }}
                      />
                      {message.sources &&
                        message.sources.length > 0 &&
                        !message.isStreaming && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">
                              Sources:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {message.sources.map((source, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {source}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      <div className="text-xs text-gray-400 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="mt-4 flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your practice data... (e.g., 'Show me this month's financial performance')"
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !currentMessage.trim()}
                className="bg-medisight-teal hover:bg-medisight-dark-teal"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="w-72">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Quick Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 text-left"
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                    >
                      <div className="flex items-start space-x-3">
                        <IconComponent className="w-4 h-4 mt-0.5 text-medisight-teal" />
                        <div>
                          <div className="font-medium text-sm">
                            {action.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Status Indicator */}
            <Card className="mt-4">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Real-Time Data</div>
                    <div className="text-xs text-gray-500">
                      Connected to practice database
                    </div>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="text-xs text-gray-500">
                  AI responses are based on your actual practice data including
                  patients, appointments, and transactions.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
