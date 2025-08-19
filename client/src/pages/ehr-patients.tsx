import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, Database, CheckCircle, AlertCircle } from "lucide-react";
import EHRPatientReplacement from "@/components/ehr-patient-replacement";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ConnectionStatus {
  connected: boolean;
  message: string;
  timestamp: string;
}

interface EHRPatient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  race?: string;
  ethnicity?: string;
  primary_language?: string;
  marital_status?: string;
  insurance_type?: string;
  medical_record_number?: string;
  created_at?: string;
  updated_at?: string;
}

export default function EHRPatients() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Test EHR connection
  const { data: connectionStatus, isLoading: connectionLoading } = useQuery<ConnectionStatus>({
    queryKey: ["/api/ehr/test-connection"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Fetch all EHR patients
  const { data: ehrPatients = [], isLoading: patientsLoading } = useQuery<EHRPatient[]>({
    queryKey: ["/api/ehr/patients"],
    enabled: connectionStatus?.connected === true,
  });

  // Search EHR patients
  const { data: searchResults = [], isLoading: searchLoading } = useQuery<EHRPatient[]>({
    queryKey: ["/api/ehr/search", searchTerm],
    enabled: searchTerm.length > 2 && connectionStatus?.connected === true,
  });

  // Import patient mutation
  const importPatientMutation = useMutation({
    mutationFn: (patientId: string) => apiRequest(`/api/ehr/import-patient/${patientId}`, { method: "POST" }),
    onSuccess: (data) => {
      toast({
        title: "Patient imported successfully",
        description: `${data.patient.name} has been added to your local database.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import patient.",
        variant: "destructive",
      });
    },
  });

  const displayPatients = searchTerm.length > 2 ? searchResults : ehrPatients;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EHR Patient Database</h1>
          <p className="text-muted-foreground">
            Connect and import patients from external EHR systems
          </p>
        </div>
        
        {/* Connection Status */}
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">EHR Connection</span>
              {connectionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : connectionStatus?.connected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {connectionLoading 
                ? "Testing connection..." 
                : connectionStatus?.message || "Unknown status"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Replacement */}
      <EHRPatientReplacement />

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search EHR Patients</CardTitle>
          <CardDescription>
            Search by name, phone number, or medical record number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                disabled={!connectionStatus?.connected}
              />
            </div>
            <Button 
              variant="outline" 
              disabled={!connectionStatus?.connected}
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/ehr/patients"] })}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {searchTerm.length > 2 ? "Search Results" : "All EHR Patients"}
            {!patientsLoading && !searchLoading && (
              <Badge variant="secondary" className="ml-2">
                {displayPatients.length} patients
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!connectionStatus?.connected ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">EHR Database Not Connected</h3>
              <p className="text-muted-foreground">
                Please check your EHR database connection settings.
              </p>
            </div>
          ) : (patientsLoading || searchLoading) ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading patients...</p>
            </div>
          ) : displayPatients.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm.length > 2 ? "No results found" : "No patients found"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm.length > 2 
                  ? "Try adjusting your search terms." 
                  : "No patients available in the EHR database."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayPatients.map((patient) => (
                <Card key={patient.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {patient.first_name[0]}{patient.last_name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {patient.first_name} {patient.last_name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Age: {calculateAge(patient.date_of_birth)}</span>
                              <span>Gender: {patient.gender}</span>
                              {patient.medical_record_number && (
                                <span>MRN: {patient.medical_record_number}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              {patient.phone && <span>📞 {patient.phone}</span>}
                              {patient.email && <span>✉️ {patient.email}</span>}
                            </div>
                          </div>
                        </div>
                        
                        {/* Additional Details */}
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          {patient.insurance_type && (
                            <div>
                              <span className="font-medium">Insurance:</span>
                              <span className="ml-1">{patient.insurance_type}</span>
                            </div>
                          )}
                          {patient.primary_language && (
                            <div>
                              <span className="font-medium">Language:</span>
                              <span className="ml-1">{patient.primary_language}</span>
                            </div>
                          )}
                          {patient.city && patient.state && (
                            <div>
                              <span className="font-medium">Location:</span>
                              <span className="ml-1">{patient.city}, {patient.state}</span>
                            </div>
                          )}
                          {patient.created_at && (
                            <div>
                              <span className="font-medium">Added:</span>
                              <span className="ml-1">{formatDate(patient.created_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        <Button
                          onClick={() => importPatientMutation.mutate(patient.id)}
                          disabled={importPatientMutation.isPending}
                          size="sm"
                        >
                          {importPatientMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Import
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}