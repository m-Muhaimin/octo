import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PatientTable from "@/components/patient-table";
import CreateModal from "@/components/modals/create-modal";
import { toast } from "@/hooks/use-toast";
import type { Patient } from "@shared/schema";

export default function Patients() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState("table");

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const handleBulkAction = (action: string) => {
    toast({ title: `Bulk ${action} feature coming soon!` });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Patients</h1>
          <p className="text-text-secondary">Manage all your patients and their information</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-medisight-teal hover:bg-medisight-dark-teal"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Patients</p>
              <p className="text-2xl font-bold text-text-primary">{patients?.length || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-blue-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">New This Month</p>
              <p className="text-2xl font-bold text-text-primary">24</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-user-plus text-green-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active Cases</p>
              <p className="text-2xl font-bold text-text-primary">156</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-medical text-orange-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Critical</p>
              <p className="text-2xl font-bold text-text-primary">3</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Table View</SelectItem>
              <SelectItem value="cards">Card View</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Bulk Actions
                <MoreHorizontal className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                Export Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("archive")}>
                Archive Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("delete")}>
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Patient Table */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : patients ? (
        <PatientTable patients={patients} />
      ) : (
        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <p className="text-text-secondary">Failed to load patients data</p>
        </div>
      )}

      <CreateModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}