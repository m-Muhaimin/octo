import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidence?: number;
  actions?: string[];
}

interface EligibilityResult {
  isEligible: boolean;
  coverage: any;
  copay?: number;
  deductible?: number;
  authRequired: boolean;
  referralRequired: boolean;
  errors?: string[];
}

interface WorkflowStep {
  step: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  data?: any;
  error?: string;
  timestamp: Date;
}

interface AppointmentSlot {
  id: string;
  providerId: string;
  providerName: string;
  locationId: string;
  locationName: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
}

export default function PatientScheduling() {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI healthcare scheduling assistant. I can help you:\n\n• Schedule appointments\n• Check insurance eligibility\n• Find available providers\n• Handle appointment changes\n\nHow can I help you today?",
      timestamp: new Date(),
      confidence: 100,
    },
  ]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityResult | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);

  // Execute scheduling workflow
  const scheduleMutation = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      patientName: string;
      serviceType: string;
      urgency?: string;
    }) => {
      return apiRequest("/api/ai/schedule", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (result) => {
      if (result.status === "success") {
        toast({
          title: "Appointment Scheduled!",
          description: `Successfully scheduled ${result.result.isNewPatient ? "new patient" : "patient"} appointment.`,
        });
        // Invalidate and refetch relevant data
        queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
        queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      }
    },
    onError: (error) => {
      toast({
        title: "Scheduling Failed",
        description: "Unable to schedule appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Chat with AI agent
  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; sessionId?: string }) => {
      return apiRequest("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: data.message,
          sessionId: data.sessionId,
          channel: "web",
        }),
      });
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        confidence: data.confidence,
        actions: data.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Show next step actions
      if (data.actions && data.actions.length > 0) {
        const actionText = data.actions.join(", ");
        toast({
          title: "Next Steps",
          description: `Required actions: ${actionText}`,
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check insurance eligibility
  const eligibilityMutation = useMutation({
    mutationFn: async (data: { patientId: string; serviceType: string }) => {
      return apiRequest("/api/ai/eligibility", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setEligibilityResult(data.eligibility);
      toast({
        title: "Eligibility Check Complete",
        description: data.eligibility.isEligible
          ? "Insurance coverage verified"
          : "Coverage issue detected",
        variant: data.eligibility.isEligible ? "default" : "destructive",
      });
    },
  });

  // Execute scheduling workflow
  const schedulingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/ai/schedule", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setWorkflowSteps(data.result.steps);
      toast({
        title: data.result.success
          ? "Appointment Scheduled"
          : "Scheduling Failed",
        description: data.result.success
          ? `Appointment ID: ${data.result.appointmentId}`
          : "Please see workflow details",
        variant: data.result.success ? "default" : "destructive",
      });
    },
  });

  // Query available slots
  const { data: slotsData, refetch: refetchSlots } = useQuery<{
    slots: AppointmentSlot[];
  }>({
    queryKey: ["/api/ai/slots"],
    enabled: false,
  });

  const handleSendMessage = () => {
    if (!currentMessage.trim() || chatMutation.isPending) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Send to AI agent
    chatMutation.mutate({
      message: currentMessage,
      sessionId: sessionId || undefined,
    });

    setCurrentMessage("");
  };

  const handleQuickAction = (action: string) => {
    const quickMessages: Record<string, string> = {
      schedule_cardiology: "I need to schedule a cardiology appointment",
      check_eligibility: "Can you check my insurance eligibility?",
      reschedule: "I need to reschedule my existing appointment",
      urgent_care: "I need urgent medical attention",
      specialist_referral: "I need a referral to see a specialist",
    };

    const message = quickMessages[action] || action;
    setCurrentMessage(message);

    // Trigger send message after a brief delay to ensure state update
    setTimeout(() => {
      if (message.trim() && !chatMutation.isPending) {
        const userMessage: Message = {
          role: "user",
          content: message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        chatMutation.mutate({
          message: message,
          sessionId: sessionId || undefined,
        });

        setCurrentMessage("");
      }
    }, 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex  px-6 pt-2">
      {/* Chat Interface */}
      <Card className="flex flex-col h-[650px] w-[700px]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            AI Scheduling Assistant
          </CardTitle>
          {sessionId && (
            <Badge variant="secondary" className="w-fit">
              Session: {sessionId.split("-").pop()}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-medisight-teal text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.confidence && (
                      <div className="mt-2 text-xs opacity-75">
                        Confidence: {message.confidence}%
                      </div>
                    )}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.actions.map((action, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {action}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="mb-4">
            <Label className="text-sm text-gray-600 mb-2 block">
              Quick Actions:
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("schedule_cardiology")}
                data-testid="button-schedule-cardiology"
                className="border-medisight-teal text-medisight-teal hover:bg-medisight-light-teal"
              >
                Schedule Cardiology
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("check_eligibility")}
                data-testid="button-check-eligibility"
                className="border-medisight-teal text-medisight-teal hover:bg-medisight-light-teal"
              >
                Check Coverage
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction("urgent_care")}
                data-testid="button-urgent-care"
                className="border-medisight-teal text-medisight-teal hover:bg-medisight-light-teal"
              >
                Urgent Care
              </Button>
            </div>
          </div>

          {/* Message Input */}
          <div className="flex border px-2 py-2 border-gray-300 rounded-[10px] focus:border-medisight-teal">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message here..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={chatMutation.isPending}
              data-testid="input-message"
              className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || chatMutation.isPending}
              data-testid="button-send-message"
              className="bg-medisight-teal hover:bg-medisight-dark-teal ml-[-20px] text-white"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
