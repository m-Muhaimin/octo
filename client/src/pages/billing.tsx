import { useState } from "react";
import { Plus, Search, Download, DollarSign, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface BillingRecord {
  id: string;
  patientName: string;
  patientId: string;
  service: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
  dueDate: string;
}

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const billingRecords: BillingRecord[] = [
    {
      id: "INV-001",
      patientName: "Brooklyn Simmons",
      patientId: "#OMT23AA",
      service: "Allergy Testing",
      amount: 250.00,
      status: "paid",
      date: "2024-08-15",
      dueDate: "2024-08-30",
    },
    {
      id: "INV-002", 
      patientName: "Jenny Wilson",
      patientId: "#JW345II",
      service: "Routine Checkup",
      amount: 150.00,
      status: "pending",
      date: "2024-08-14",
      dueDate: "2024-08-29",
    },
    {
      id: "INV-003",
      patientName: "Robert Fox",
      patientId: "#RF012HH",
      service: "Surgery Consultation",
      amount: 500.00,
      status: "overdue",
      date: "2024-08-10",
      dueDate: "2024-08-25",
    },
    {
      id: "INV-004",
      patientName: "Kristin Watson",
      patientId: "#KW678JJ",
      service: "Mental Health Assessment",
      amount: 200.00,
      status: "paid",
      date: "2024-08-12",
      dueDate: "2024-08-27",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = billingRecords.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = billingRecords.reduce((sum, record) => sum + record.amount, 0);
  const paidAmount = billingRecords
    .filter(record => record.status === 'paid')
    .reduce((sum, record) => sum + record.amount, 0);
  const pendingAmount = billingRecords
    .filter(record => record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);
  const overdueAmount = billingRecords
    .filter(record => record.status === 'overdue')
    .reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Billing & Invoices</h1>
          <p className="text-text-secondary">Manage payments and financial records</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-medisight-teal hover:bg-medisight-dark-teal">
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Revenue</p>
              <p className="text-2xl font-bold text-text-primary">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Overdue</p>
              <p className="text-2xl font-bold text-red-600">${overdueAmount.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
            <Input
              type="text"
              placeholder="Search invoices..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Invoice ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Patient
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Service
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Due Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-text-secondary">
                    {searchTerm ? "No invoices found matching your search" : "No invoices available"}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium text-text-primary">{record.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-text-primary">{record.patientName}</p>
                        <p className="text-sm text-text-secondary">{record.patientId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {record.service}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-text-primary">${record.amount.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {new Date(record.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {record.status !== 'paid' && (
                          <Button size="sm" className="bg-medisight-teal hover:bg-medisight-dark-teal">
                            Collect
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}