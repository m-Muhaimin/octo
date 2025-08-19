import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import CreateModal from "@/components/modals/create-modal";
import AppointmentDetailModal from "@/components/modals/appointment-detail-modal";
import type { Appointment, Patient } from "@shared/schema";

export default function Appointments() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'no show':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleReschedule = (appointment: Appointment) => {
    toast({ 
      title: "Reschedule Appointment", 
      description: `Rescheduling appointment for ${appointment.patientName}`
    });
  };

  const handleComplete = (appointment: Appointment) => {
    toast({ 
      title: "Complete Appointment", 
      description: `Marking appointment as completed for ${appointment.patientName}`
    });
  };

  const handleSendReminder = (appointment: Appointment) => {
    toast({ 
      title: "Reminder Sent", 
      description: `Appointment reminder sent to ${appointment.patientName}`
    });
  };

  const filteredAppointments = appointments?.filter(appointment => {
    if (filterStatus !== 'all' && appointment.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
          <p className="text-text-secondary">Manage all appointments and schedules</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-medisight-teal hover:bg-medisight-dark-teal"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Today's Appointments</p>
              <p className="text-2xl font-bold text-text-primary">8</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">This Week</p>
              <p className="text-2xl font-bold text-text-primary">{appointments?.length || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Pending</p>
              <p className="text-2xl font-bold text-text-primary">3</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock text-orange-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Completed</p>
              <p className="text-2xl font-bold text-text-primary">42</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-check-circle text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="no show">No Show</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDate} onValueChange={setFilterDate}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      {appointmentsLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : filteredAppointments && filteredAppointments.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="font-semibold text-text-primary mb-4">All Appointments</h3>
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <div 
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(appointment.patientName)}`}>
                      <span className="font-semibold text-sm">
                        {getInitials(appointment.patientName)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">{appointment.patientName}</h4>
                      <p className="text-sm text-text-secondary">{appointment.appointmentType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="font-medium text-text-primary">{appointment.appointmentTime}</p>
                      <p className="text-sm text-text-secondary">{formatDate(appointment.appointmentDate)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status || 'scheduled')}`}>
                      {appointment.status || 'scheduled'}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDetails(appointment)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-text-secondary">No appointments found</p>
        </div>
      )}

      <CreateModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <AppointmentDetailModal 
        appointment={selectedAppointment}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />
    </div>
  );
}