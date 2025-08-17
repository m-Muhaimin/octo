import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Calendar, CreditCard, FileText } from "lucide-react";
import CreatePatientModal from "./create-patient-modal";
import CreateAppointmentModal from "./create-appointment-modal";
import CreateTransactionModal from "./create-transaction-modal";
import CreateReportModal from "./create-report-modal";

interface CreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateModal({ open, onOpenChange }: CreateModalProps) {
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const createOptions = [
    {
      icon: Users,
      title: "New Patient",
      description: "Add a new patient to the system",
      action: () => {
        onOpenChange(false);
        setShowPatientModal(true);
      },
    },
    {
      icon: Calendar,
      title: "New Appointment",
      description: "Schedule a new appointment",
      action: () => {
        onOpenChange(false);
        setShowAppointmentModal(true);
      },
    },
    {
      icon: CreditCard,
      title: "New Transaction",
      description: "Record a new payment or transaction",
      action: () => {
        onOpenChange(false);
        setShowTransactionModal(true);
      },
    },
    {
      icon: FileText,
      title: "New Report",
      description: "Generate a new medical report",
      action: () => {
        onOpenChange(false);
        setShowReportModal(true);
      },
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            {createOptions.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex items-start space-x-3 text-left"
                onClick={option.action}
              >
                <div className="w-8 h-8 bg-medisight-teal bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <option.icon className="w-4 h-4 text-medisight-teal" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-text-primary mb-1">
                    {option.title}
                  </h4>
                  <p className="text-xs text-text-secondary">
                    {option.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <CreatePatientModal 
        open={showPatientModal} 
        onOpenChange={setShowPatientModal} 
      />
      <CreateAppointmentModal 
        open={showAppointmentModal} 
        onOpenChange={setShowAppointmentModal} 
      />
      <CreateTransactionModal 
        open={showTransactionModal} 
        onOpenChange={setShowTransactionModal} 
      />
      <CreateReportModal 
        open={showReportModal} 
        onOpenChange={setShowReportModal} 
      />
    </>
  );
}