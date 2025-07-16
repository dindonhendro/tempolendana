import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/supabase";
import { FileText, Users, Building2, AlertCircle } from "lucide-react";

interface CollectorDashboardProps {
  staffId: string;
}

export default function CollectorDashboard({
  staffId,
}: CollectorDashboardProps) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [collectorInfo, setCollectorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
  });

  useEffect(() => {
    fetchCollectorData();
  }, [staffId]);

  const fetchCollectorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get collector staff info
      const { data: staffData, error: staffError } = await supabase
        .from("collector_staff")
        .select(
          `
          *,
          collector_companies!inner(name, code)
        `,
        )
        .eq("user_id", staffId)
        .single();

      if (staffError) {
        console.error("Error fetching collector staff:", staffError);
        if (staffError.code === "PGRST116") {
          setError(
            "You are not registered as collector staff. Please contact your administrator to set up your collector account.",
          );
        } else {
          setError("Failed to load collector information. Please try again.");
        }
        return;
      }

      if (!staffData) {
        setError(
          "No collector staff record found. Please contact your administrator.",
        );
        return;
      }

      setCollectorInfo(staffData);

      // Then get assignments for this collector company
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("collector_assignments")
        .select(
          `
          *,
          loan_applications!inner(
            id,
            full_name,
            email,
            phone_number,
            loan_amount,
            status,
            created_at
          ),
          collector_companies!inner(name, code)
        `,
        )
        .eq("collector_company_id", staffData.collector_company_id)
        .order("created_at", { ascending: false });

      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError);
        // Don't set error here, just show empty assignments
        setAssignments([]);
      } else {
        setAssignments(assignmentsData || []);
      }

      // Calculate stats
      const totalAssignments = assignmentsData?.length || 0;
      const activeAssignments =
        assignmentsData?.filter((a) => a.status === "Active").length || 0;
      const completedAssignments =
        assignmentsData?.filter((a) => a.status === "Completed").length || 0;
      const pendingAssignments =
        assignmentsData?.filter((a) => a.status === "Pending").length || 0;

      setStats({
        totalAssignments,
        activeAssignments,
        completedAssignments,
        pendingAssignments,
      });
    } catch (error: any) {
      console.error("Error in fetchCollectorData:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateAssignmentStatus = async (
    assignmentId: string,
    newStatus: string,
  ) => {
    try {
      const { error } = await supabase
        .from("collector_assignments")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId);

      if (error) throw error;

      // Refresh data
      await fetchCollectorData();
    } catch (error: any) {
      console.error("Error updating assignment status:", error);
      alert("Failed to update assignment status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p>Loading collector dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 text-red-600">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Setup Required</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#5680E9] mb-2">
            Collector Dashboard
          </h1>
          {collectorInfo && (
            <p className="text-gray-600">
              {collectorInfo.collector_companies?.name} (
              {collectorInfo.collector_companies?.code}) -{" "}
              {collectorInfo.position}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Assignments
                  </p>
                  <p className="text-2xl font-bold text-[#5680E9]">
                    {stats.totalAssignments}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-[#5680E9]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Collections
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.activeAssignments}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.completedAssignments}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pendingAssignments}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No collection assignments found.</p>
                <p className="text-sm mt-2">
                  Assignments will appear here when validators assign collection
                  tasks to your company.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Loan Status</TableHead>
                      <TableHead>Assignment Status</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.loan_applications?.full_name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {assignment.loan_applications?.email || "-"}
                            </div>
                            <div className="text-gray-500">
                              {assignment.loan_applications?.phone_number ||
                                "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {assignment.loan_applications?.loan_amount
                            ? `Rp ${assignment.loan_applications.loan_amount.toLocaleString()}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              assignment.loan_applications?.status ===
                              "Bank Approved"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {assignment.loan_applications?.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              assignment.status === "Active"
                                ? "default"
                                : assignment.status === "Completed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(
                            assignment.assigned_at,
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {assignment.status === "Active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateAssignmentStatus(
                                    assignment.id,
                                    "Completed",
                                  )
                                }
                                className="text-green-600 hover:text-green-700"
                              >
                                Mark Complete
                              </Button>
                            )}
                            {assignment.status === "Pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateAssignmentStatus(
                                    assignment.id,
                                    "Active",
                                  )
                                }
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Start Collection
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
