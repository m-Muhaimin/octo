import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Edit, Trash2, Save, Calendar, MapPin, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, InsertPatient } from "@shared/schema";

interface PatientDetailModalProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PatientDetailModal({ patient, open, onOpenChange }: PatientDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<InsertPatient>({
    name: "",
    gender: "Male",
    dateOfBirth: "",
    department: "",
    patientId: "",
    avatar: null
  });

  const queryClient = useQueryClient();

  // Initialize edit data when patient changes
  useState(() => {
    if (patient) {
      setEditData({
        name: patient.name,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        department: patient.department,
        patientId: patient.patientId,
        avatar: patient.avatar
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertPatient) => {
      if (!patient) return;
      const response = await apiRequest(`/api/patients/${patient.id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      setIsEditing(false);
      toast({ title: "Patient updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update patient", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!patient) return;
      await apiRequest(`/api/patients/${patient.id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      onOpenChange(false);
      toast({ title: "Patient deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete patient", variant: "destructive" });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Edit Patient" : "Patient Details"}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  data-testid="button-edit-patient"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" data-testid="button-delete-patient">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {patient.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="button-confirm-delete"
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
                  data-testid="button-save-patient"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Patient Avatar and Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                      {getInitials(patient.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing ? (
                    <div className="w-full space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editData.name}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          data-testid="input-edit-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="patientId">Patient ID</Label>
                        <Input
                          id="patientId"
                          value={editData.patientId}
                          onChange={(e) => setEditData(prev => ({ ...prev, patientId: e.target.value }))}
                          data-testid="input-edit-patient-id"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold" data-testid="text-patient-name">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-500" data-testid="text-patient-id">
                          {patient.patientId}
                        </p>
                      </div>
                      <Badge variant="secondary" data-testid="badge-patient-status">
                        Active Patient
                      </Badge>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={editData.gender}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, gender: value }))}
                      >
                        <SelectTrigger data-testid="select-edit-gender">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={editData.dateOfBirth}
                        onChange={(e) => setEditData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        data-testid="input-edit-dob"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={editData.department}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger data-testid="select-edit-department">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cardiology">Cardiology</SelectItem>
                          <SelectItem value="Neurology">Neurology</SelectItem>
                          <SelectItem value="Oncology">Oncology</SelectItem>
                          <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="Dermatology">Dermatology</SelectItem>
                          <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Gynecology">Gynecology</SelectItem>
                          <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Gender</p>
                          <p className="text-sm text-gray-600" data-testid="text-patient-gender">
                            {patient.gender}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Age</p>
                          <p className="text-sm text-gray-600" data-testid="text-patient-age">
                            {calculateAge(patient.dateOfBirth)} years old
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Department</p>
                          <p className="text-sm text-gray-600" data-testid="text-patient-department">
                            {patient.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Date of Birth</p>
                          <p className="text-sm text-gray-600" data-testid="text-patient-dob">
                            {formatDate(patient.dateOfBirth)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        {!isEditing && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" data-testid="button-schedule-appointment">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button variant="outline" size="sm" data-testid="button-view-history">
                  View Medical History
                </Button>
                <Button variant="outline" size="sm" data-testid="button-send-message">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" size="sm" data-testid="button-generate-report">
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}