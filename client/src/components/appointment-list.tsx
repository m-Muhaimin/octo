import { useState } from "react";
import { MoreHorizontal, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import AppointmentDetailModal from "@/components/modals/appointment-detail-modal";
import type { Appointment } from "@shared/schema";

interface AppointmentListProps {
  appointments: Appointment[];
}

export default function AppointmentList({ appointments }: AppointmentListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-indigo-100 text-indigo-600',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "no show":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-[17px] p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary">Appointment list</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-text-primary p-1 h-auto"
              data-testid="button-appointment-options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast({ title: "View all appointments feature coming soon!" })}>
              View all
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Export appointments feature coming soon!" })}>
              Export
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Filter appointments feature coming soon!" })}>
              Filter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No appointments scheduled
          </div>
        ) : (
          appointments.map((appointment, index) => (
            <div 
              key={appointment.id} 
              className="flex items-center space-x-3 p-3 rounded-[17px] hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleViewAppointment(appointment)}
              data-testid={`appointment-item-${index}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(appointment.patientName)}`}>
                <span className="font-semibold text-xs">
                  {getInitials(appointment.patientName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-text-primary truncate" data-testid={`text-patient-name-${index}`}>
                  {appointment.patientName}
                </p>
                <p className="text-xs text-text-secondary truncate" data-testid={`text-appointment-type-${index}`}>
                  {appointment.appointmentType}
                </p>
              </div>
              <div className="text-right flex-shrink-0 flex items-center space-x-3">
                <div className="text-center">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status || "scheduled")}`}>
                    {appointment.status || "scheduled"}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-secondary" data-testid={`text-appointment-date-${index}`}>
                    {formatDate(appointment.appointmentDate)}
                  </p>
                  <p className="font-medium text-sm text-text-primary" data-testid={`text-appointment-time-${index}`}>
                    {appointment.appointmentTime}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAppointment(appointment);
                  }}
                  className="hover:bg-gray-100 p-1 h-auto"
                  data-testid={`button-view-appointment-${index}`}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <AppointmentDetailModal
        appointment={selectedAppointment}
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
      />
    </div>
  );
}
