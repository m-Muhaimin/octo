import { useState } from "react";
import { Sun, Bell, Download, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import CreateModal from "@/components/modals/create-modal";
import NotificationsModal from "@/components/modals/notifications-modal";
import Sidebar from "@/components/sidebar";
import type { Patient, Appointment } from "@shared/schema";
import { SidebarMenuItem } from "./ui/sidebar";

interface HeaderProps {
  onSidebarToggle: () => void;
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [location] = useLocation();

  // Map routes to page titles
  const getPageTitle = (path: string) => {
    const routes = {
      '/': 'Dashboard',
      '/patients': 'Patients',
      '/appointments': 'Appointments',
      '/billing': 'Billing & Payments',
      '/analytics': 'Analytics',
      '/ai-assistant': 'AI Assistant',
      '/settings': 'Settings'
    };
    return routes[path as keyof typeof routes] || 'Medisight';
  };

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const handleExport = () => {
    if (!patients || !appointments) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    // Create CSV data with new schema
    const csvHeaders = ['First Name', 'Last Name', 'Gender', 'Date of Birth', 'Race', 'Ethnicity', 'Primary Language', 'Marital Status', 'Insurance Type', 'Department', 'Patient ID'];
    const csvData = patients.map(patient => [
      patient.firstName || '',
      patient.lastName || '',
      patient.gender || '',
      patient.dateOfBirth || '',
      patient.race || '',
      patient.ethnicity || '',
      patient.primaryLanguage || '',
      patient.maritalStatus || '',
      patient.insuranceType || '',
      patient.department || '',
      patient.patientId || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({ title: "Data exported successfully!" });
  };

  return (
    <>
      <header className="bg-white border-b border-gray-300 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              data-testid="button-mobile-menu"
            >
              <Menu className="h-4 w-4 text-text-secondary" />
            </button>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-medium text-text-primary" data-testid="page-title">
                {getPageTitle(location)}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowNotificationsModal(true)}
              className="relative text-text-secondary hover:text-text-primary p-1.5 rounded-md hover:bg-gray-100"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">2</span>
            </button>
            <Button 
              onClick={handleExport}
              variant="outline" 
              size="sm"
              className="flex items-center space-x-1 text-text-secondary text-xs px-3 py-1.5 h-8 border-gray-300 hover:border-medisight-teal"
              data-testid="button-export"
            >
              <Download className="h-3 w-3" />
              <span>Export</span>
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              size="sm"
              className="flex items-center space-x-1 bg-medisight-teal text-white hover:bg-medisight-dark-teal text-xs px-3 py-1.5 h-8"
              data-testid="button-create-new"
            >
              <Plus className="h-3 w-3" />
              <span>Create new</span>
            </Button>
          </div>
        </div>
      </header>
      
      <CreateModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <NotificationsModal open={showNotificationsModal} onOpenChange={setShowNotificationsModal} />
    </>
  );
}
