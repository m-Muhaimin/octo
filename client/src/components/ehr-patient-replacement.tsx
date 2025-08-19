import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function EHRPatientReplacement() {
  const [isReplacing, setIsReplacing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Replace patients mutation
  const replacePatientsMutation = useMutation({
    mutationFn: () => apiRequest("/api/ehr/replace-patients", { method: "POST" }),
    onSuccess: (data) => {
      toast({
        title: "Patients replaced successfully",
        description: `${data.result.imported} patients imported, ${data.result.cleared} existing patients cleared.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsReplacing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Patient replacement failed",
        description: error.message || "Failed to replace patients with EHR data.",
        variant: "destructive",
      });
      setIsReplacing(false);
    },
  });

  const handleReplacePatients = () => {
    setIsReplacing(true);
    replacePatientsMutation.mutate();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5" />
          <span>Replace Patients with EHR Data</span>
        </CardTitle>
        <CardDescription>
          This will clear all existing patients and replace them with data from the EHR database.
          This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-muted-foreground">
            Warning: This will permanently delete all current patient records
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleReplacePatients}
            disabled={isReplacing || replacePatientsMutation.isPending}
            variant="destructive"
          >
            {isReplacing || replacePatientsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Replace All Patients
          </Button>
          
          {replacePatientsMutation.isSuccess && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Completed</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}