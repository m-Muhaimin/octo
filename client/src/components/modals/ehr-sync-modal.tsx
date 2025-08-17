import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RotateCcw as Sync, Database, CheckCircle, AlertCircle, Clock, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

interface EHRSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EHRSystem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'beta' | 'planned';
  lastSync?: string;
  recordCount?: number;
  syncProgress?: number;
}

interface SyncOperation {
  id: string;
  system: string;
  operation: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
  startTime: Date;
  endTime?: Date;
  errorMessage?: string;
}

export default function EHRSyncModal({ open, onOpenChange }: EHRSyncModalProps) {
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);

  const ehrSystems: EHRSystem[] = [
    {
      id: 'athenahealth',
      name: 'athenahealth',
      status: 'active',
      lastSync: '2024-08-17 08:30:00',
      recordCount: 1247,
      syncProgress: 100
    },
    {
      id: 'drchrono',
      name: 'DrChrono',
      status: 'active',
      lastSync: '2024-08-17 07:45:00',
      recordCount: 856,
      syncProgress: 100
    },
    {
      id: 'epic',
      name: 'Epic',
      status: 'beta',
      lastSync: '2024-08-16 18:20:00',
      recordCount: 2134,
      syncProgress: 75
    },
    {
      id: 'cerner',
      name: 'Cerner',
      status: 'planned',
      recordCount: 0,
      syncProgress: 0
    }
  ];

  const syncMutation = useMutation({
    mutationFn: async (systemId: string) => {
      // Simulate EHR sync API call
      const response = await fetch('/api/ai/ehr-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: systemId })
      });
      return response.json();
    },
    onSuccess: (data, systemId) => {
      const newOperation: SyncOperation = {
        id: Date.now().toString(),
        system: systemId,
        operation: 'Full Sync',
        status: 'running',
        progress: 0,
        recordsProcessed: 0,
        totalRecords: ehrSystems.find(s => s.id === systemId)?.recordCount || 100,
        startTime: new Date()
      };

      setSyncOperations(prev => [...prev, newOperation]);
      simulateSyncProgress(newOperation.id);
      toast({ title: `Started sync with ${systemId}` });
    },
    onError: (error) => {
      toast({ title: "Sync failed", description: error.message, variant: "destructive" });
    }
  });

  const simulateSyncProgress = (operationId: string) => {
    const interval = setInterval(() => {
      setSyncOperations(prev => prev.map(op => {
        if (op.id === operationId && op.status === 'running') {
          const newProgress = Math.min(op.progress + Math.random() * 15, 100);
          const newRecordsProcessed = Math.floor((newProgress / 100) * op.totalRecords);
          
          if (newProgress >= 100) {
            clearInterval(interval);
            return {
              ...op,
              status: 'completed' as const,
              progress: 100,
              recordsProcessed: op.totalRecords,
              endTime: new Date()
            };
          }
          
          return {
            ...op,
            progress: newProgress,
            recordsProcessed: newRecordsProcessed
          };
        }
        return op;
      }));
    }, 1000);
  };

  const handleSync = () => {
    if (selectedSystem) {
      syncMutation.mutate(selectedSystem);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOperationStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = Math.floor((end.getTime() - startTime.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Database className="w-6 h-6 text-blue-600" />
            EHR System Integration
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EHR Systems Status */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connected Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ehrSystems.map((system) => (
                    <div key={system.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Database className="w-5 h-5 text-gray-600" />
                          <div>
                            <h4 className="font-semibold" data-testid={`text-ehr-system-${system.id}`}>
                              {system.name}
                            </h4>
                            {system.lastSync && (
                              <p className="text-xs text-gray-500">
                                Last sync: {new Date(system.lastSync).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(system.status)} data-testid={`badge-ehr-status-${system.id}`}>
                          {system.status}
                        </Badge>
                      </div>
                      
                      {system.recordCount !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Records: {system.recordCount.toLocaleString()}</span>
                            <span>{system.syncProgress}%</span>
                          </div>
                          <Progress value={system.syncProgress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSystem(system.id)}
                          disabled={system.status === 'planned' || syncMutation.isPending}
                          data-testid={`button-select-ehr-${system.id}`}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          {selectedSystem === system.id ? 'Selected' : 'Configure'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sync Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sync Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select EHR System</label>
                    <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                      <SelectTrigger data-testid="select-ehr-system">
                        <SelectValue placeholder="Choose EHR system to sync" />
                      </SelectTrigger>
                      <SelectContent>
                        {ehrSystems.filter(s => s.status !== 'planned').map((system) => (
                          <SelectItem key={system.id} value={system.id}>
                            {system.name} ({system.recordCount} records)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSync}
                      disabled={!selectedSystem || syncMutation.isPending}
                      className="flex-1"
                      data-testid="button-start-sync"
                    >
                      <Sync className="w-4 h-4 mr-2" />
                      {syncMutation.isPending ? 'Starting...' : 'Start Full Sync'}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!selectedSystem}
                      data-testid="button-incremental-sync"
                    >
                      Incremental
                    </Button>
                  </div>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Full sync may take several minutes depending on the number of records. 
                      Incremental sync only processes new/updated records.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sync Operations History */}
          <div>
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Sync Activity</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  {syncOperations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Sync className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No sync operations yet</p>
                      <p className="text-sm">Start a sync to see progress here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {syncOperations.map((operation) => (
                        <Card key={operation.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {getOperationStatusIcon(operation.status)}
                                <div>
                                  <h4 className="font-semibold text-sm" data-testid={`text-operation-system-${operation.id}`}>
                                    {operation.system}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {operation.operation}
                                  </p>
                                </div>
                              </div>
                              <Badge 
                                variant={operation.status === 'completed' ? 'default' : 'secondary'}
                                data-testid={`badge-operation-status-${operation.id}`}
                              >
                                {operation.status}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>
                                  {operation.recordsProcessed.toLocaleString()} / {operation.totalRecords.toLocaleString()} records
                                </span>
                                <span>{Math.round(operation.progress)}%</span>
                              </div>
                              <Progress value={operation.progress} className="h-2" />
                            </div>

                            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                              <span>Duration: {formatDuration(operation.startTime, operation.endTime)}</span>
                              <span>{operation.startTime.toLocaleTimeString()}</span>
                            </div>

                            {operation.errorMessage && (
                              <Alert className="mt-3" variant="destructive">
                                <AlertCircle className="w-4 h-4" />
                                <AlertDescription className="text-xs">
                                  {operation.errorMessage}
                                </AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}