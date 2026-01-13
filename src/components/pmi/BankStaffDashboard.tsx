import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Search, Eye, MessageSquare } from "lucide-react";
import { supabase, getCurrentUserId } from "@/lib/supabase";
import {
  LoanApplication,
  BranchApplication,
  BankProduct,
} from "@/types/supabase";

interface BankStaffDashboardProps {
  staffId?: string;
}

interface ApplicationWithBranch extends LoanApplication {
  branch_applications: (BranchApplication & {
    bank_products: BankProduct | null;
  })[];
}

export default function BankStaffDashboard({
  staffId,
}: BankStaffDashboardProps = {}) {
  const [applications, setApplications] = useState<ApplicationWithBranch[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationWithBranch[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationWithBranch | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);

  useEffect(() => {
    initializeStaff();
  }, []);

  useEffect(() => {
    if (currentStaffId) {
      fetchApplications();
    }
  }, [currentStaffId]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm]);

  const initializeStaff = async () => {
    try {
      const userId = await getCurrentUserId();
      console.log("Current user ID:", userId);

      if (!userId) {
        console.log("No user ID found");
        setLoading(false);
        return;
      }

      // Get bank staff info
      const { data: staffData, error } = await supabase
        .from("bank_staff")
        .select("*")
        .eq("user_id", userId)
        .single();

      console.log("Bank staff query result:", { staffData, error });

      if (error) {
        console.error("Error fetching staff info:", error);
        if (error.code === "PGRST116") {
          console.log("No bank staff record found for user:", userId);
        }
        setLoading(false);
      } else if (staffData) {
        console.log("Bank staff found:", staffData);
        setCurrentStaffId(staffData.id);
      } else {
        console.log("No bank staff data returned");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in initializeStaff:", error);
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      if (!currentStaffId) {
        console.log("No staff ID available yet");
        setLoading(false);
        return;
      }

      console.log("Fetching applications for staff ID:", currentStaffId);

      // Get staff info to find their branch
      const { data: staffInfo, error: staffError } = await supabase
        .from("bank_staff")
        .select("branch_id, bank_id")
        .eq("id", currentStaffId)
        .single();

      console.log("Staff info query result:", { staffInfo, staffError });

      if (staffError) {
        console.error("Error fetching staff info:", staffError);
        setLoading(false);
        return;
      }

      if (!staffInfo?.branch_id) {
        console.log(
          "Staff has no assigned branch, showing all validated applications",
        );

        // If no branch assigned, show all validated applications
        const { data, error } = await supabase
          .from("loan_applications")
          .select(
            `
            *,
            branch_applications(
              *,
              bank_products(*)
            )
          `,
          )
          .eq("status", "Validated")
          .order("created_at", { ascending: false });

        console.log("All validated applications query result:", {
          data,
          error,
        });

        if (error) {
          console.error("Error fetching all applications:", error);
        } else {
          // Filter applications that have branch assignments
          const appsWithBranches = (data || []).filter(
            (app) =>
              app.branch_applications && app.branch_applications.length > 0,
          );
          console.log(
            "Applications with branch assignments:",
            appsWithBranches.length,
          );
          setApplications(appsWithBranches);
        }
        setLoading(false);
        return;
      }

      console.log("Staff branch ID:", staffInfo.branch_id);

      // Get applications that are validated and assigned to this staff's branch
      const { data, error } = await supabase
        .from("loan_applications")
        .select(
          `
          *,
          branch_applications!inner(
            *,
            bank_products(*)
          )
        `,
        )
        .eq("status", "Validated")
        .eq("branch_applications.branch_id", staffInfo.branch_id)
        .order("created_at", { ascending: false });

      console.log("Branch applications query result:", {
        data,
        error,
        count: data?.length,
      });

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        console.log("Applications found:", data?.length || 0);
        setApplications(data || []);
      }
    } catch (error) {
      console.error("Error in fetchApplications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.phone_number?.includes(searchTerm) ||
          app.work_location?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredApplications(filtered);
  };

  const handleApplicationAction = async (
    applicationId: string,
    branchApplicationId: string,
    action: "approve" | "reject",
  ) => {
    if (!comments.trim() && action === "reject") {
      alert("Please provide comments for rejection");
      return;
    }

    if (!currentStaffId) {
      alert("Staff information not found");
      return;
    }

    setProcessing(applicationId);
    try {
      const newStatus =
        action === "approve" ? "Bank Approved" : "Bank Rejected";

      // Update loan application status
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (action === "approve") {
        updateData.bank_approved_at = new Date().toISOString();
      }

      const { error: appError } = await supabase
        .from("loan_applications")
        .update(updateData)
        .eq("id", applicationId);

      if (appError) {
        console.error("Error updating application:", appError);
        alert("Error updating application. Please try again.");
        return;
      }

      // Create bank review record
      const { error: reviewError } = await supabase
        .from("bank_reviews")
        .insert({
          branch_application_id: branchApplicationId,
          reviewed_by: currentStaffId,
          status: action === "approve" ? "Approved" : "Rejected",
          comments: comments.trim() || null,
        });

      if (reviewError) {
        console.error("Error creating review:", reviewError);
        alert("Error creating review record. Please try again.");
        return;
      }

      alert(
        `Application ${action === "approve" ? "approved" : "rejected"} successfully!`,
      );
      fetchApplications();
      setSelectedApplication(null);
      setComments("");
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating application. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  if (selectedApplication) {
    const branchApp = selectedApplication.branch_applications[0];

    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedApplication(null);
              setComments("");
            }}
            className="mb-4"
          >
            ← Back to Applications
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#5680E9]">
                Bank Review - {selectedApplication.full_name}
              </CardTitle>
              <p className="text-gray-600">
                Application has been validated by Lendana and requires bank
                approval
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Application Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-[#5680E9]">
                  Application Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Applicant</Label>
                    <p className="font-medium">
                      {selectedApplication.full_name}
                    </p>
                  </div>
                  <div>
                    <Label>Loan Amount</Label>
                    <p className="font-medium">
                      Rp {selectedApplication.loan_amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label>Tenor</Label>
                    <p className="font-medium">
                      {selectedApplication.tenor_months} months
                    </p>
                  </div>
                  <div>
                    <Label>Work Location</Label>
                    <p className="font-medium">
                      {selectedApplication.work_location}
                    </p>
                  </div>
                  <div>
                    <Label>Bank Product</Label>
                    <p className="font-medium">
                      {branchApp?.bank_products?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label>Interest Rate</Label>
                    <p className="font-medium">
                      {branchApp?.bank_products?.interest_rate || "N/A"}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#5680E9]">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="font-medium">
                      {selectedApplication.full_name}
                    </p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p className="font-medium">{selectedApplication.gender}</p>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <p className="font-medium">{selectedApplication.age}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="font-medium">
                      {selectedApplication.phone_number}
                    </p>
                  </div>
                  <div>
                    <Label>NIK KTP</Label>
                    <p className="font-medium">{selectedApplication.nik_ktp}</p>
                  </div>
                  <div>
                    <Label>Education</Label>
                    <p className="font-medium">
                      {selectedApplication.last_education}
                    </p>
                  </div>
                  <div>
                    <Label>Sisko PMI</Label>
                    <p className="font-medium">
                      {selectedApplication.nomor_sisko}
                    </p>
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#5680E9]">
                  Work Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Institution</Label>
                    <p className="font-medium">
                      {selectedApplication.institution}
                    </p>
                  </div>
                  <div>
                    <Label>Major/Field</Label>
                    <p className="font-medium">{selectedApplication.major}</p>
                  </div>
                  <div>
                    <Label>Experience</Label>
                    <p className="font-medium">
                      {selectedApplication.work_experience}
                    </p>
                  </div>
                  <div>
                    <Label>Work Location</Label>
                    <p className="font-medium">
                      {selectedApplication.work_location}
                    </p>
                  </div>
                  <div>
                    <Label>Employer</Label>
                    <p className="font-medium">
                      {selectedApplication.nama_pemberi_kerja}
                    </p>
                  </div>
                  <div>
                    <Label>Employer Phone</Label>
                    <p className="font-medium">
                      {selectedApplication.telp_pemberi_kerja}
                    </p>
                  </div>
                  <div>
                    <Label>Departure Date</Label>
                    <p className="font-medium">
                      {selectedApplication.tanggal_keberangkatan
                        ? new Date(
                          selectedApplication.tanggal_keberangkatan,
                        ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Employer Address</Label>
                  <p className="font-medium">
                    {selectedApplication.alamat_pemberi_kerja}
                  </p>
                </div>
              </div>

              {/* Bank Review Comments */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#5680E9]">
                  Bank Review Comments
                </h3>
                <div>
                  <Label htmlFor="comments">
                    Comments (required for rejection)
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Add your review comments here..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6 border-t">
                <Button
                  onClick={() =>
                    handleApplicationAction(
                      selectedApplication.id,
                      branchApp.id,
                      "approve",
                    )
                  }
                  disabled={processing === selectedApplication.id}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {processing === selectedApplication.id
                    ? "Processing..."
                    : "Approve Loan"}
                </Button>
                <Button
                  onClick={() =>
                    handleApplicationAction(
                      selectedApplication.id,
                      branchApp.id,
                      "reject",
                    )
                  }
                  disabled={
                    processing === selectedApplication.id || !comments.trim()
                  }
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {processing === selectedApplication.id
                    ? "Processing..."
                    : "Reject Loan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#5680E9] mb-2">
            Bank Staff Dashboard
          </h1>
          <p className="text-gray-600">
            Review and approve loan applications validated by Lendana
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Application Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Applications</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, phone, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Applications for Bank Review ({filteredApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No applications pending bank review
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {currentStaffId
                    ? "Applications will appear here once they are validated by Lendana and assigned to your branch."
                    : "Unable to load staff information. Please contact administrator."}
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  <p>Debug Info:</p>
                  <p>Staff ID: {currentStaffId || "Not found"}</p>
                  <p>Applications loaded: {applications.length}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const branchApp = application.branch_applications[0];
                  return (
                    <Card
                      key={application.id}
                      className="border-l-4 border-l-green-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {application.full_name}
                              </h3>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                                {application.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Email:</span>{" "}
                                {application.email}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Work Location:
                                </span>{" "}
                                {application.work_location}
                              </div>
                              <div>
                                <span className="font-medium">Product:</span>{" "}
                                {branchApp?.bank_products?.name || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Loan Amount:
                                </span>{" "}
                                Rp {application.loan_amount?.toLocaleString()}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Validated:{" "}
                              {application.validated_by_lendana_at
                                ? new Date(
                                  application.validated_by_lendana_at,
                                ).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedApplication(application)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                            <Button
                              onClick={() => {
                                const branchApp =
                                  application.branch_applications[0];
                                handleApplicationAction(
                                  application.id,
                                  branchApp.id,
                                  "approve",
                                );
                              }}
                              disabled={processing === application.id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() =>
                                setSelectedApplication(application)
                              }
                              disabled={processing === application.id}
                              size="sm"
                              variant="destructive"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
