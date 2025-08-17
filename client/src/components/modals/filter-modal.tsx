import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  departments: string[];
  genders: string[];
  ageRange: { min: number | null; max: number | null };
  status: string;
}

export default function FilterModal({ open, onOpenChange, onApplyFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    departments: [],
    genders: [],
    ageRange: { min: null, max: null },
    status: 'all',
  });

  const departments = [
    'Cardiology', 'Dermatology', 'Emergency', 'Gynecology', 
    'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Psychiatry'
  ];

  const genders = ['Male', 'Female', 'Other'];

  const handleDepartmentChange = (department: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      departments: checked 
        ? [...prev.departments, department]
        : prev.departments.filter(d => d !== department)
    }));
  };

  const handleGenderChange = (gender: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      genders: checked 
        ? [...prev.genders, gender]
        : prev.genders.filter(g => g !== gender)
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters = {
      departments: [],
      genders: [],
      ageRange: { min: null, max: null },
      status: 'all',
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Patients</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Department Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Department</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {departments.map((department) => (
                <div key={department} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dept-${department}`}
                    checked={filters.departments.includes(department)}
                    onCheckedChange={(checked) => handleDepartmentChange(department, checked as boolean)}
                  />
                  <Label htmlFor={`dept-${department}`} className="text-sm">
                    {department}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Gender</Label>
            <div className="space-y-2">
              {genders.map((gender) => (
                <div key={gender} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${gender}`}
                    checked={filters.genders.includes(gender)}
                    onCheckedChange={(checked) => handleGenderChange(gender, checked as boolean)}
                  />
                  <Label htmlFor={`gender-${gender}`} className="text-sm">
                    {gender}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status" className="text-sm font-medium mb-3 block">Status</Label>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}