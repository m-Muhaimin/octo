import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { X, Edit, Trash2, Save, Calendar, Clock, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Appointment, InsertAppointment, Patient } from "@shared/schema";

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AppointmentDetailModal({ appointment, open, onOpenChange }: AppointmentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<InsertAppointment>({
    patientId: "",
    patientName: "",
    appointmentType: "",
    appointmentDate: "",
    appointmentTime: "",
    status: "scheduled"
  });

  const queryClient = useQueryClient();

  // Fetch patients for the dropdown
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  // Initialize edit data when appointment changes
  useState(() => {
    if (appointment) {
      setEditData({
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        appointmentType: appointment.appointmentType,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        status: appointment.status || "scheduled"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      if (!appointment) return;
      const response = await apiRequest(`/api/appointments/${appointment.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-data"] });
      setIsEditing(false);
      toast({ title: "Appointment updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update appointment", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!appointment) return;
      await apiRequest(`/api/appointments/${appointment.id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chart-data"] });
      onOpenChange(false);
      toast({ title: "Appointment deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete appointment", variant: "destructive" });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handlePatientChange = (patientId: string) => {
    const selectedPatient = patients?.find(p => p.id === patientId);
    if (selectedPatient) {
      setEditData(prev => ({
        ...prev,
        patientId,
        patientName: selectedPatient.name
      }));
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Appointment" : "Appointment Details"}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  data-testid="button-edit-appointment"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" data-testid="button-delete-appointment">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this appointment with {appointment.patientName}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="button-confirm-delete-appointment"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {isEditing && (
              <>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  size="sm"
                  data-testid="button-save-appointment"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  data-testid="button-cancel-edit-appointment"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 mt-6">
          {/* Appointment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Appointment Information</span>
                {!isEditing && (
                  <Badge className={getStatusColor(appointment.status || "scheduled")} data-testid="badge-appointment-status">
                    {appointment.status || "scheduled"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select
                      value={editData.patientId}
                      onValueChange={handlePatientChange}
                    >
                      <SelectTrigger data-testid="select-edit-patient">
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients?.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} ({patient.patientId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="appointmentType">Appointment Type</Label>
                    <Select
                      value={editData.appointmentType}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, appointmentType: value }))}
                    >
                      <SelectTrigger data-testid="select-edit-appointment-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Routine Checkup">Routine Checkup</SelectItem>
                        <SelectItem value="Consultation">Consultation</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Surgery">Surgery</SelectItem>
                        <SelectItem value="Allergy Testing">Allergy Testing</SelectItem>
                        <SelectItem value="Routine Lab Tests">Routine Lab Tests</SelectItem>
                        <SelectItem value="Chronic Disease Management">Chronic Disease Management</SelectItem>
                        <SelectItem value="Acute Illness">Acute Illness</SelectItem>
                        <SelectItem value="Surgery Consultation">Surgery Consultation</SelectItem>
                        <SelectItem value="Mental Health Assessment">Mental Health Assessment</SelectItem>
                        <SelectItem value="Cardiology Follow-up">Cardiology Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editData.status || "scheduled"}
                      onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger data-testid="select-edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="no show">No Show</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="appointmentDate">Date</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={editData.appointmentDate}
                      onChange={(e) => setEditData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                      data-testid="input-edit-appointment-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="appointmentTime">Time</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={editData.appointmentTime}
                      onChange={(e) => setEditData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                      data-testid="input-edit-appointment-time"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Patient</p>
                        <p className="text-sm text-gray-600" data-testid="text-appointment-patient">
                          {appointment.patientName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Type</p>
                        <p className="text-sm text-gray-600" data-testid="text-appointment-type">
                          {appointment.appointmentType}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm text-gray-600" data-testid="text-appointment-date">
                          {formatDate(appointment.appointmentDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm text-gray-600" data-testid="text-appointment-time">
                          {formatTime(appointment.appointmentTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" data-testid="button-reschedule">
                    <Calendar className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-mark-completed">
                    Complete Appointment
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-send-reminder">
                    Send Reminder
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-add-notes">
                    Add Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}