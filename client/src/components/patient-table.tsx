import { useState } from "react";
import { Search, Filter, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import FilterModal, { type FilterOptions } from "@/components/modals/filter-modal";
import PatientDetailModal from "@/components/modals/patient-detail-modal";
import type { Patient } from "@shared/schema";

interface PatientTableProps {
  patients: Patient[];
}

export default function PatientTable({ patients }: PatientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    departments: [],
    genders: [],
    ageRange: { min: null, max: null },
    status: 'all',
  });

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return '??';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (firstName: string, lastName: string) => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-indigo-100 text-indigo-600',
    ];
    const fullName = `${firstName || ''}${lastName || ''}`;
    const index = fullName.length % colors.length;
    return colors[index];
  };

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} years old`;
  };

  const filteredPatients = patients.filter(patient => {
    // Search filter
    const fullName = `${patient.firstName} ${patient.lastName}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.medicalRecordNumber && patient.medicalRecordNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // For now, we'll skip department filtering since it's not in the new schema
    const matchesDepartment = true;
    
    // Gender filter
    const matchesGender = activeFilters.genders.length === 0 ||
      activeFilters.genders.includes(patient.gender);
    
    // Status filter (using statusFilter for backward compatibility)
    const matchesStatus = statusFilter === 'all' || activeFilters.status === 'all';
    
    return matchesSearch && matchesDepartment && matchesGender && matchesStatus;
  });

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    setStatusFilter(filters.status);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatients(filteredPatients.map(p => p.id));
    } else {
      setSelectedPatients([]);
    }
  };

  const handleSelectPatient = (patientId: string, checked: boolean) => {
    if (checked) {
      setSelectedPatients([...selectedPatients, patientId]);
    } else {
      setSelectedPatients(selectedPatients.filter(id => id !== patientId));
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  return (
    <div className="bg-white rounded-[17px] border border-gray-200 shadow-sm">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-base font-semibold text-text-primary mb-4">Patient list</h3>
        
        {/* Search and Filter */}
        <div className="flex items-center justify-between space-x-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 h-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-patient-search"
            />
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => setShowFilterModal(true)}
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2 text-text-secondary text-xs px-3 py-1.5 h-8 border-gray-300 hover:border-medisight-teal"
              data-testid="button-filter"
            >
              <Filter className="h-3 w-3" />
              <span>Filter</span>
              {(activeFilters.departments.length > 0 || activeFilters.genders.length > 0) && (
                <span className="ml-1 w-2 h-2 bg-medisight-teal rounded-full"></span>
              )}
            </Button>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-8 text-xs" data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-5 text-xs font-medium text-text-secondary uppercase tracking-wider">
                <Checkbox
                  checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                  onCheckedChange={handleSelectAll}
                  data-testid="checkbox-select-all"
                />
              </th>
              <th className="text-left py-2 px-5 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Name
              </th>
              <th className="text-left py-2 px-5 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Gender
              </th>
              <th className="text-left py-2 px-5 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Date of Birth
              </th>
              <th className="text-left py-2 px-5 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Age
              </th>
              <th className="text-left py-2 px-5 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Insurance
              </th>
              <th className="text-left py-2 px-5 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Medical Record #
              </th>
              <th className="text-center py-2 px-5 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-text-secondary">
                  {searchTerm ? "No patients found matching your search" : "No patients available"}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient, index) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-gray-50 transition-colors"
                  data-testid={`row-patient-${index}`}
                >
                  <td className="py-3 px-5">
                    <Checkbox
                      checked={selectedPatients.includes(patient.id)}
                      onCheckedChange={(checked) => handleSelectPatient(patient.id, checked as boolean)}
                      data-testid={`checkbox-patient-${index}`}
                    />
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(patient.firstName, patient.lastName)}`}>
                        <span className="font-semibold text-xs">
                          {getInitials(patient.firstName, patient.lastName)}
                        </span>
                      </div>
                      <span className="font-medium text-sm text-text-primary" data-testid={`text-patient-name-${index}`}>
                        {patient.firstName} {patient.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-sm text-text-secondary" data-testid={`text-patient-gender-${index}`}>
                    {patient.gender}
                  </td>
                  <td className="py-3 px-5 text-sm text-text-secondary" data-testid={`text-patient-dob-${index}`}>
                    {patient.dateOfBirth}
                  </td>
                  <td className="py-3 px-5 text-sm text-text-secondary" data-testid={`text-patient-age-${index}`}>
                    {calculateAge(patient.dateOfBirth)}
                  </td>
                  <td className="py-3 px-5 text-sm text-text-secondary" data-testid={`text-patient-department-${index}`}>
                    {patient.insuranceType || 'Not specified'}
                  </td>
                  <td className="py-3 px-5 text-sm text-text-secondary" data-testid={`text-patient-id-${index}`}>
                    {patient.medicalRecordNumber || 'N/A'}
                  </td>
                  <td className="py-3 px-5 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPatient(patient)}
                      className="h-8 w-8 p-0"
                      data-testid={`button-view-patient-${index}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FilterModal 
        open={showFilterModal} 
        onOpenChange={setShowFilterModal}
        onApplyFilters={handleApplyFilters}
      />

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 p-4">
        {filteredPatients.length === 0 ? (
          <div className="py-8 text-center text-text-secondary">
            {searchTerm ? "No patients found matching your search" : "No patients available"}
          </div>
        ) : (
          filteredPatients.map((patient, index) => (
            <div 
              key={patient.id} 
              className="p-4 border border-gray-200 rounded-[17px] hover:bg-gray-50 transition-colors"
              data-testid={`card-patient-${index}`}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={selectedPatients.includes(patient.id)}
                  onCheckedChange={(checked) => handleSelectPatient(patient.id, checked as boolean)}
                  data-testid={`checkbox-patient-mobile-${index}`}
                  className="mt-1"
                />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(patient.firstName, patient.lastName)} flex-shrink-0`}>
                  <span className="font-semibold text-sm">
                    {getInitials(patient.firstName, patient.lastName)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-text-primary truncate" data-testid={`text-patient-name-mobile-${index}`}>
                      {patient.firstName} {patient.lastName}
                    </h4>
                    <span className="text-xs text-text-secondary bg-gray-100 px-2 py-1 rounded ml-2" data-testid={`text-patient-id-mobile-${index}`}>
                      {patient.medicalRecordNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                    <div>
                      <span className="font-medium">Gender:</span> {patient.gender}
                    </div>
                    <div>
                      <span className="font-medium">Age:</span> {calculateAge(patient.dateOfBirth)}
                    </div>
                    <div>
                      <span className="font-medium">DOB:</span> {patient.dateOfBirth}
                    </div>
                    <div>
                      <span className="font-medium">Insurance:</span> {patient.insuranceType || 'Not specified'}
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPatient(patient)}
                      className="w-full"
                      data-testid={`button-view-patient-mobile-${index}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <FilterModal 
        open={showFilterModal} 
        onOpenChange={setShowFilterModal}
        onApplyFilters={handleApplyFilters}
      />

      <PatientDetailModal
        patient={selectedPatient}
        open={showPatientModal}
        onOpenChange={setShowPatientModal}
      />
    </div>
  );
}
