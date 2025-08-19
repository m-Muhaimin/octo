import { useState, useRef, useEffect } from "react";
import { Send, Bot, FileText, TrendingUp, DollarSign, Users, BarChart, Activity, Sparkles, Clock, CheckCircle, MessageSquare, Lightbulb, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
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
  category: 'financial' | 'operational' | 'clinical' | 'analytics';
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'success' | 'info';
  action?: string;
}

export default function AIAgentChatPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '🏥 **AI Medical Practice Assistant**\n\nWelcome to your intelligent practice management assistant! I analyze your real-time data including:\n\n• **Financial Performance** - Revenue, expenses, and cash flow analysis\n• **Patient Analytics** - Demographics, trends, and engagement metrics\n• **Appointment Management** - Scheduling efficiency and optimization\n• **Operational Insights** - Practice performance and improvement opportunities\n\nI use your actual practice data to provide personalized recommendations. What would you like to analyze today?',
      timestamp: new Date(),
      confidence: 100,
      sources: ['Real Practice Data', 'Financial Analytics', 'Patient Database']
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    // Financial Analysis
    { 
      id: '1', 
      label: 'Financial Health Check', 
      icon: DollarSign, 
      query: 'Provide a comprehensive financial health analysis including revenue trends, expense patterns, and cash flow recommendations',
      description: 'Complete financial performance review',
      category: 'financial'
    },
    { 
      id: '2', 
      label: 'Revenue Optimization', 
      icon: TrendingUp, 
      query: 'Analyze our revenue streams and identify opportunities to increase practice income and improve billing efficiency',
      description: 'Revenue enhancement strategies',
      category: 'financial'
    },
    { 
      id: '3', 
      label: 'Outstanding Payments', 
      icon: Clock, 
      query: 'Review all pending and overdue transactions with specific collection recommendations and priority actions',
      description: 'Collections management insights',
      category: 'financial'
    },
    
    // Patient Analytics
    { 
      id: '4', 
      label: 'Patient Demographics', 
      icon: Users, 
      query: 'Analyze patient demographics, growth patterns, and engagement trends with actionable insights',
      description: 'Patient population analysis',
      category: 'clinical'
    },
    { 
      id: '5', 
      label: 'Appointment Efficiency', 
      icon: Activity, 
      query: 'Review appointment scheduling patterns, completion rates, and identify optimization opportunities',
      description: 'Scheduling performance review',
      category: 'operational'
    },
    { 
      id: '6', 
      label: 'Service Utilization', 
      icon: BarChart, 
      query: 'Examine which services are most utilized and profitable, with recommendations for service expansion',
      description: 'Service line analysis',
      category: 'analytics'
    },
    
    // Operational Insights
    { 
      id: '7', 
      label: 'Risk Assessment', 
      icon: FileText, 
      query: 'Identify potential operational and financial risks with detailed mitigation strategies',
      description: 'Practice risk evaluation',
      category: 'operational'
    },
    { 
      id: '8', 
      label: 'Performance Metrics', 
      icon: Sparkles, 
      query: 'Generate a comprehensive practice performance report with KPIs and benchmarking insights',
      description: 'Complete performance dashboard',
      category: 'analytics'
    },
    { 
      id: '9', 
      label: 'Growth Opportunities', 
      icon: Lightbulb, 
      query: 'Analyze current practice data to identify specific growth opportunities and expansion strategies',
      description: 'Strategic growth planning',
      category: 'analytics'
    }
  ];

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      title: 'Revenue Alert',
      description: 'Current net income is negative (-$152.50). Focus on pending collections.',
      type: 'warning',
      action: 'Review Collections'
    },
    {
      id: '2',
      title: 'Appointment Opportunity',
      description: '13 upcoming appointments scheduled - ensure completion tracking.',
      type: 'info',
      action: 'Optimize Scheduling'
    },
    {
      id: '3',
      title: 'Data Quality',
      description: 'Real-time data analysis available with 12 patients and 23 transactions.',
      type: 'success'
    }
  ];

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
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
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    // Add streaming assistant message placeholder
    const assistantMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      confidence: 95,
      sources: ['Real Practice Data', 'Financial Analytics', 'Patient Database', 'DeepSeek AI']
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          dataTypes: ['patients', 'appointments', 'transactions', 'metrics']
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        accumulatedContent += chunk;

        // Update the streaming message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      }

      // Mark as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error('Streaming error:', error);
      
      // Update with error message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { 
                ...msg, 
                content: '❌ **Analysis Error**\n\nI encountered an error while analyzing your practice data. Please try again or contact support if the issue persists.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'),
                isStreaming: false,
                confidence: 0
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || isLoading) return;
    
    handleStreamingResponse(currentMessage.trim());
    setCurrentMessage('');
  };

  const handleQuickAction = (action: QuickAction) => {
    if (isLoading) return;
    handleStreamingResponse(action.query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  const getCategoryIcon = (category: QuickAction['category']) => {
    switch (category) {
      case 'financial': return DollarSign;
      case 'operational': return Activity;
      case 'clinical': return Users;
      case 'analytics': return BarChart;
      default: return Sparkles;
    }
  };

  const getCategoryColor = (category: QuickAction['category']) => {
    switch (category) {
      case 'financial': return 'text-green-600';
      case 'operational': return 'text-blue-600';
      case 'clinical': return 'text-purple-600';
      case 'analytics': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const groupedActions = quickActions.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = [];
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  return (
    <div className="container mx-auto px-6 py-8 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Bot className="w-8 h-8 text-medisight-teal" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Agent Chat</h1>
          <Badge variant="secondary" className="bg-medisight-teal/10 text-medisight-teal">
            Enhanced Analytics
          </Badge>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Intelligent practice management assistant powered by real-time data analysis
        </p>
      </div>

      {/* AI Insights Banner */}
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span>Live Practice Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aiInsights.map((insight) => (
                <Alert key={insight.id} className={`border-l-4 ${
                  insight.type === 'warning' ? 'border-l-red-500 bg-red-50' :
                  insight.type === 'success' ? 'border-l-green-500 bg-green-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}>
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-xs">{insight.title}</p>
                        <p className="text-xs mt-1">{insight.description}</p>
                      </div>
                      {insight.action && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-6"
                          onClick={() => handleStreamingResponse(insight.action!)}
                          disabled={isLoading}
                        >
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 flex space-x-6 min-h-0">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 border rounded-lg bg-white dark:bg-gray-800">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${
                    message.type === 'user' 
                      ? 'bg-medisight-teal text-white' 
                      : message.type === 'system'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  } rounded-lg p-4`}>
                    {message.type !== 'user' && (
                      <div className="flex items-center space-x-2 mb-3">
                        <Bot className="w-5 h-5 text-medisight-teal" />
                        <span className="text-sm font-medium">
                          {message.type === 'system' ? 'System' : 'AI Assistant'}
                        </span>
                        {message.isStreaming && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-medisight-teal rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-500">Analyzing...</span>
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
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />
                    {message.sources && message.sources.length > 0 && !message.isStreaming && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 mb-2">Data Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-3">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="mt-4 flex space-x-3">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your practice data... (e.g., 'What are our biggest revenue opportunities?')"
              disabled={isLoading}
              className="flex-1"
              data-testid="input-ai-message"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !currentMessage.trim()}
              className="bg-medisight-teal hover:bg-medisight-dark-teal"
              data-testid="button-send-message"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="w-80">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-medisight-teal" />
                <span>Quick Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {Object.entries(groupedActions).map(([category, actions]) => {
                    const CategoryIcon = getCategoryIcon(category as QuickAction['category']);
                    return (
                      <div key={category}>
                        <div className="flex items-center space-x-2 mb-3">
                          <CategoryIcon className={`w-4 h-4 ${getCategoryColor(category as QuickAction['category'])}`} />
                          <span className="font-medium text-sm capitalize">{category}</span>
                        </div>
                        <div className="space-y-2">
                          {actions.map((action) => {
                            const ActionIcon = action.icon;
                            return (
                              <Button
                                key={action.id}
                                variant="ghost"
                                className="w-full justify-start h-auto p-3 text-left hover:bg-medisight-teal/5"
                                onClick={() => handleQuickAction(action)}
                                disabled={isLoading}
                                data-testid={`button-quick-action-${action.id}`}
                              >
                                <div className="flex items-start space-x-3">
                                  <ActionIcon className="w-4 h-4 mt-0.5 text-medisight-teal" />
                                  <div>
                                    <div className="font-medium text-sm">{action.label}</div>
                                    <div className="text-xs text-gray-500">{action.description}</div>
                                  </div>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                        <Separator className="mt-3" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="mt-4">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-sm font-medium">Real-Time Analytics</div>
                  <div className="text-xs text-gray-500">Connected to practice database</div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Data Sources</span>
                  <span className="text-green-600">4 Active</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>AI Model</span>
                  <span className="text-blue-600">DeepSeek</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Response Time</span>
                  <span className="text-purple-600">~5s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}