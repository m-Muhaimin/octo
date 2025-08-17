import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { InsertAppointment, Patient } from "@shared/schema";

interface CreateAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAppointmentModal({ open, onOpenChange }: CreateAppointmentModalProps) {
  const [formData, setFormData] = useState<InsertAppointment>({
    patientId: "",
    patientName: "",
    appointmentType: "",
    appointmentDate: "",
    appointmentTime: "",
    status: "scheduled",
  });

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const queryClient = useQueryClient();

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointment: InsertAppointment) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });
      if (!response.ok) throw new Error("Failed to create appointment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({ title: "Appointment created successfully!" });
      onOpenChange(false);
      setFormData({
        patientId: "",
        patientName: "",
        appointmentType: "",
        appointmentDate: "",
        appointmentTime: "",
        status: "scheduled",
      });
    },
    onError: () => {
      toast({ title: "Error creating appointment", variant: "destructive" });
    },
  });

  const handlePatientChange = (patientId: string) => {
    const patient = patients?.find(p => p.id === patientId);
    setFormData({
      ...formData,
      patientId,
      patientName: patient?.name || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAppointmentMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patient">Patient</Label>
            <Select
              value={formData.patientId}
              onValueChange={handlePatientChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.patientId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="appointmentType">Appointment Type</Label>
            <Select
              value={formData.appointmentType}
              onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Routine Checkup">Routine Checkup</SelectItem>
                <SelectItem value="Allergy Testing">Allergy Testing</SelectItem>
                <SelectItem value="Routine Lab Tests">Routine Lab Tests</SelectItem>
                <SelectItem value="Chronic Disease Management">Chronic Disease Management</SelectItem>
                <SelectItem value="Acute Illness">Acute Illness</SelectItem>
                <SelectItem value="Surgery Consultation">Surgery Consultation</SelectItem>
                <SelectItem value="Mental Health Assessment">Mental Health Assessment</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="appointmentDate">Date</Label>
            <Input
              id="appointmentDate"
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="appointmentTime">Time</Label>
            <Input
              id="appointmentTime"
              type="time"
              value={formData.appointmentTime}
              onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAppointmentMutation.isPending}>
              {createAppointmentMutation.isPending ? "Creating..." : "Create Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}