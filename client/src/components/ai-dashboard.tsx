import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, Brain, TrendingUp, AlertTriangle, FileText, DollarSign, Calendar, Users, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AIAssistantModal from "@/components/modals/ai-assistant-modal";
import EHRSyncModal from "@/components/modals/ehr-sync-modal";

interface AIMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  description: string;
}

interface AutomationTask {
  id: string;
  name: string;
  type: 'insurance_claim' | 'billing_followup' | 'appointment_reminder' | 'ehr_sync';
  status: 'active' | 'completed' | 'pending' | 'error';
  progress: number;
  lastRun: string;
  nextRun: string;
  impact: string;
}

export default function AIDashboard() {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showEHRSync, setShowEHRSync] = useState(false);

  const aiMetrics: AIMetric[] = [
    {
      id: '1',
      title: 'Claims Success Rate',
      value: '94.2%',
      change: 3.2,
      changeType: 'increase',
      icon: FileText,
      description: 'AI-optimized claims have higher approval rates'
    },
    {
      id: '2',
      title: 'Revenue Prediction',
      value: '$138K',
      change: 12.5,
      changeType: 'increase',
      icon: DollarSign,
      description: 'Next month projected revenue'
    },
    {
      id: '3',
      title: 'Automation Savings',
      value: '120 hrs',
      change: 18.3,
      changeType: 'increase',
      icon: Zap,
      description: 'Time saved this month through automation'
    },
    {
      id: '4',
      title: 'Patient Satisfaction',
      value: '4.6/5',
      change: 0.3,
      changeType: 'increase',
      icon: Users,
      description: 'Improved through AI-powered communication'
    }
  ];

  const automationTasks: AutomationTask[] = [
    {
      id: '1',
      name: 'Insurance Claims Processing',
      type: 'insurance_claim',
      status: 'active',
      progress: 85,
      lastRun: '10 minutes ago',
      nextRun: 'Continuous',
      impact: '94% approval rate'
    },
    {
      id: '2',
      name: 'Billing Follow-ups',
      type: 'billing_followup',
      status: 'active',
      progress: 92,
      lastRun: '2 hours ago',
      nextRun: 'Daily at 9 AM',
      impact: '$12K recovered this week'
    },
    {
      id: '3',
      name: 'Appointment Reminders',
      type: 'appointment_reminder',
      status: 'completed',
      progress: 100,
      lastRun: '1 hour ago',
      nextRun: '6 PM today',
      impact: '8.3% no-show rate'
    },
    {
      id: '4',
      name: 'EHR Data Sync',
      type: 'ehr_sync',
      status: 'pending',
      progress: 0,
      lastRun: '3 hours ago',
      nextRun: 'Every 4 hours',
      impact: '2,400+ records synced'
    }
  ];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'insurance_claim': return FileText;
      case 'billing_followup': return DollarSign;
      case 'appointment_reminder': return Calendar;
      case 'ehr_sync': return Brain;
      default: return Bot;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            AI Medical Agent Dashboard
          </h1>
          <p className="text-text-secondary">
            Production-ready AI automation for medical practice management
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowEHRSync(true)}
            data-testid="button-ehr-sync"
          >
            <Brain className="w-4 h-4 mr-2" />
            EHR Integration
          </Button>
          <Button
            onClick={() => setShowAIAssistant(true)}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-ai-assistant"
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
        </div>
      </div>

      {/* AI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">{metric.title}</p>
                      <p className="text-xl font-bold text-text-primary" data-testid={`metric-value-${metric.id}`}>
                        {metric.value}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    {getChangeIcon(metric.changeType)}
                    <span className={metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-2">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insights Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Brain className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>AI Insight:</strong> Claims submitted with AI pre-analysis have a 94.2% approval rate, 
          15% higher than manual submissions. Consider enabling full automation for routine claims.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Active Automations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {automationTasks.map((task) => {
                const TaskIcon = getTaskIcon(task.type);
                return (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <TaskIcon className="w-5 h-5 text-gray-600" />
                        <div>
                          <h4 className="font-semibold text-sm" data-testid={`task-name-${task.id}`}>
                            {task.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Last run: {task.lastRun} • Next: {task.nextRun}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(task.status)} data-testid={`task-status-${task.id}`}>
                        {task.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                    
                    <p className="text-xs text-blue-600 mt-2 font-medium">{task.impact}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-l-green-500 bg-green-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-green-800">
                    Enable Full Claims Automation
                  </h4>
                  <Badge className="bg-green-100 text-green-800">High Impact</Badge>
                </div>
                <p className="text-xs text-green-700 mb-2">
                  Based on 94% success rate, automate routine claim submissions to save 40+ hours/week
                </p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Enable Now
                </Button>
              </div>

              <div className="border-l-4 border-l-yellow-500 bg-yellow-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-yellow-800">
                    Optimize Appointment Scheduling
                  </h4>
                  <Badge className="bg-yellow-100 text-yellow-800">Medium Impact</Badge>
                </div>
                <p className="text-xs text-yellow-700 mb-2">
                  AI detected peak hours 9-11 AM, 2-4 PM. Adjust scheduling to reduce wait times
                </p>
                <Button size="sm" variant="outline">
                  Review Schedule
                </Button>
              </div>

              <div className="border-l-4 border-l-blue-500 bg-blue-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-blue-800">
                    EHR Integration Upgrade
                  </h4>
                  <Badge className="bg-blue-100 text-blue-800">Low Impact</Badge>
                </div>
                <p className="text-xs text-blue-700 mb-2">
                  Connect Cerner EHR to access additional 2,000+ patient records
                </p>
                <Button size="sm" variant="outline">
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal 
        open={showAIAssistant} 
        onOpenChange={setShowAIAssistant}
      />

      {/* EHR Sync Modal */}
      <EHRSyncModal
        open={showEHRSync}
        onOpenChange={setShowEHRSync}
      />
    </div>
  );
}