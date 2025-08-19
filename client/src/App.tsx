import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import Appointments from "@/pages/appointments";
import Messages from "@/pages/messages";
import Billing from "@/pages/billing";
import Transactions from "@/pages/transactions";
import Settings from "@/pages/settings";
import PatientScheduling from "@/components/patient-scheduling";
import AIDashboard from "@/pages/agent-dashboard";
import AIAgentChat from "@/pages/ai-agent-chat";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-[100VH] bg-white">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex-1 overflow-hidden min-w-0 flex flex-col">
        <div className="sticky top-0 z-10">
          <Header onSidebarToggle={toggleSidebar} />
        </div>

        <div className="flex-1 overflow-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/patients" component={Patients} />
            <Route path="/appointments" component={Appointments} />
            <Route path="/messages" component={Messages} />
            <Route path="/billing" component={Billing} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/settings" component={Settings} />
            <Route path="/ai-agent" component={PatientScheduling} />
            <Route path="/ai-chat" component={AIAgentChat} />
            <Route path="/agent-overview" component={AIDashboard} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
