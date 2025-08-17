import { useState } from "react";
import { Bot, Send, Brain, FileText, Stethoscope, DollarSign, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  actionable?: boolean;
}

interface AIInsight {
  id: string;
  type: 'claim_analysis' | 'billing_prediction' | 'patient_risk' | 'operational_efficiency';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action_required: boolean;
}

export default function AIAssistantModal({ open, onOpenChange }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI medical practice assistant. I can help you with insurance claims analysis, billing predictions, EHR integration, and operational insights. How can I assist you today?',
      timestamp: new Date(),
      confidence: 100
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'claim_analysis',
      title: 'High Approval Likelihood Claims',
      description: '15 claims analyzed with >95% approval probability',
      confidence: 97,
      priority: 'high',
      action_required: true
    },
    {
      id: '2',
      type: 'billing_prediction',
      title: 'Revenue Forecast',
      description: 'Projected $138K revenue next month (+12%)',
      confidence: 87,
      priority: 'medium',
      action_required: false
    },
    {
      id: '3',
      type: 'patient_risk',
      title: 'No-Show Risk Alert',
      description: '8 patients at high risk of missing appointments',
      confidence: 84,
      priority: 'high',
      action_required: true
    },
    {
      id: '4',
      type: 'operational_efficiency',
      title: 'Staff Optimization',
      description: 'Peak hours: 9-11 AM, 2-4 PM. Consider staffing adjustment',
      confidence: 92,
      priority: 'medium',
      action_required: true
    }
  ];

  const quickActions = [
    { id: '1', label: 'Analyze pending claims', icon: FileText, query: 'Analyze all pending insurance claims for approval likelihood' },
    { id: '2', label: 'Generate billing report', icon: DollarSign, query: 'Generate comprehensive billing analytics report' },
    { id: '3', label: 'Check appointment efficiency', icon: Calendar, query: 'Analyze appointment scheduling efficiency and suggest improvements' },
    { id: '4', label: 'Review patient risk factors', icon: Stethoscope, query: 'Identify patients with high no-show or health risk factors' },
  ];

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          channel: 'web'
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        const aiResponse: AIMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          confidence: data.confidence,
          sources: ['DeepSeek AI', 'Medical Knowledge Base', 'Practice Data'],
          actionable: data.actions && data.actions.length > 0
        };

        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (error) {
      const errorResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
        confidence: 0,
        sources: ['System'],
        actionable: false
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setCurrentMessage(query);
    setTimeout(() => handleSendMessage(), 100);
  };

  const generateAIResponse = (query: string): string => {
    // Simple AI response generation based on query keywords
    if (query.toLowerCase().includes('claim')) {
      return 'I\'ve analyzed your pending claims. Here are the key findings:\n\n• 12 claims have >90% approval likelihood\n• 3 claims need additional documentation\n• Average processing time: 3.2 days\n• Potential revenue: $42,500\n\nWould you like me to prioritize the high-risk claims for review?';
    } else if (query.toLowerCase().includes('billing')) {
      return 'Billing Analysis Complete:\n\n• Outstanding: $28,450 (15 accounts)\n• 30+ days overdue: $12,200\n• Collection success rate: 94.2%\n• Recommended actions: 5 accounts for follow-up\n\nShall I initiate automated follow-up sequences for overdue accounts?';
    } else if (query.toLowerCase().includes('appointment')) {
      return 'Appointment Efficiency Report:\n\n• Average wait time: 12 minutes\n• No-show rate: 8.3% (below industry average)\n• Peak utilization: Tuesday/Thursday 2-4 PM\n• Optimization opportunity: +15% capacity during off-peak hours\n\nRecommendation: Implement smart scheduling algorithms.';
    } else if (query.toLowerCase().includes('patient') && query.toLowerCase().includes('risk')) {
      return 'Patient Risk Assessment:\n\n• High no-show risk: 8 patients identified\n• Chronic disease management alerts: 5 patients\n• Overdue preventive care: 12 patients\n• Insurance verification needed: 3 patients\n\nShall I schedule automated outreach for these patients?';
    } else {
      return `I understand you're asking about "${query}". Based on our current data and medical knowledge base, I can help you with detailed analysis. Would you like me to:\n\n• Provide specific recommendations\n• Generate detailed reports\n• Set up automated processes\n• Schedule follow-up actions\n\nPlease let me know which area you'd like to focus on.`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'claim_analysis': return FileText;
      case 'billing_prediction': return DollarSign;
      case 'patient_risk': return AlertTriangle;
      case 'operational_efficiency': return Brain;
      default: return Brain;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bot className="w-6 h-6 text-blue-600" />
            AI Medical Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">AI Conversation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-medisight-teal text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.type === 'assistant' && message.confidence && (
                            <div className="mt-2 flex items-center justify-between text-xs opacity-75">
                              <span>Confidence: {message.confidence}%</span>
                              {message.sources && (
                                <span>{message.sources.length} sources</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ask about claims, billing, scheduling, or patient insights..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    data-testid="input-ai-message"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    data-testid="button-send-ai-message"
                    className="bg-medisight-teal hover:bg-medisight-dark-teal text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.query)}
                      className="justify-start h-auto p-3 border-medisight-teal text-medisight-teal hover:bg-medisight-light-teal"
                      data-testid={`button-quick-action-${action.id}`}
                    >
                      <action.icon className="w-4 h-4 mr-2" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Panel */}
          <div className="flex flex-col">
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {aiInsights.map((insight) => {
                      const Icon = getInsightIcon(insight.type);
                      return (
                        <Card key={insight.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                              <Badge 
                                className={getPriorityColor(insight.priority)}
                                data-testid={`badge-insight-priority-${insight.id}`}
                              >
                                {insight.priority}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-sm mb-1" data-testid={`text-insight-title-${insight.id}`}>
                              {insight.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2" data-testid={`text-insight-description-${insight.id}`}>
                              {insight.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {insight.confidence}% confidence
                              </span>
                              {insight.action_required && (
                                <Button size="sm" variant="outline" className="h-6 text-xs">
                                  Take Action
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}