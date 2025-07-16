import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Search, Eye, FileText, CheckCircle } from "lucide-react";
import {
  supabase,
  getCurrentUserId,
  uploadFileToStorage,
} from "@/lib/supabase";
import { Tables } from "@/types/supabase";

interface InsuranceDashboardProps {
  staffId?: string;
}

interface InsuranceAssignmentWithDetails
  extends Tables<"insurance_assignments"> {
  loan_applications: Tables<"loan_applications">;
  insurance_companies: Tables<"insurance_companies">;
}

export default function InsuranceDashboard({
  staffId,
}: InsuranceDashboardProps = {}) {
  const [assignments, setAssignments] = useState<
    InsuranceAssignmentWithDetails[]
  >([]);
  const [filteredAssignments, setFilteredAssignments] = useState<
    InsuranceAssignmentWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignment, setSelectedAssignment] =
    useState<InsuranceAssignmentWithDetails | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [policyNumber, setPolicyNumber] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [premiumAmount, setPremiumAmount] = useState("");

  useEffect(() => {
    initializeStaff();
  }, []);

  useEffect(() => {
    if (currentStaffId) {
      fetchAssignments();
    } else if (currentStaffId === null) {
      // Staff ID is explicitly null (no staff record found)
      setLoading(false);
    }
  }, [currentStaffId]);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchTerm]);

  const initializeStaff = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.log("No user ID found");
        setLoading(false);
        return;
      }

      // Get insurance staff info
      const { data: staffData, error } = await supabase
        .from("insurance_staff")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching staff info:", error);
        if (error.code === "PGRST116") {
          console.log("No insurance staff record found for user:", userId);
        }
        setCurrentStaffId(null);
        setLoading(false);
      } else if (staffData) {
        setCurrentStaffId(staffData.id);
      } else {
        console.log("No staff data returned");
        setCurrentStaffId(null);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in initializeStaff:", error);
      setCurrentStaffId(null);
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      if (!currentStaffId) {
        console.log("No staff ID available yet");
        setLoading(false);
        return;
      }

      // Get staff info to find their insurance company
      const { data: staffInfo, error: staffError } = await supabase
        .from("insurance_staff")
        .select("insurance_company_id")
        .eq("id", currentStaffId)
        .single();

      if (staffError) {
        console.error("Error fetching staff info:", staffError);
        setLoading(false);
        return;
      }

      if (!staffInfo?.insurance_company_id) {
        console.error("Staff has no assigned insurance company");
        setLoading(false);
        return;
      }

      // Check if insurance_assignments table exists by trying to fetch assignments
      const { data, error } = await supabase
        .from("insurance_assignments")
        .select(
          `
          *,
          loan_applications(*),
          insurance_companies(*)
        `,
        )
        .eq("insurance_company_id", staffInfo.insurance_company_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching assignments:", error);
        if (error.code === "42P01") {
          console.log("Insurance assignments table does not exist yet");
        }
        setAssignments([]);
      } else {
        setAssignments(data || []);
      }
    } catch (error) {
      console.error("Error in fetchAssignments:", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.loan_applications?.full_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assignment.loan_applications?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          assignment.loan_applications?.phone_number?.includes(searchTerm) ||
          assignment.policy_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredAssignments(filtered);
  };

  const handleUploadPolicy = async (assignmentId: string) => {
    if (
      !policyFile ||
      !policyNumber.trim() ||
      !coverageAmount.trim() ||
      !premiumAmount.trim()
    ) {
      alert("Please fill in all required fields and select a policy document");
      return;
    }

    setProcessing(assignmentId);
    try {
      // Upload policy document
      const uploadResult = await uploadFileToStorage(
        policyFile,
        "insurance_policies",
      );
      if (uploadResult.error) {
        alert(`Upload failed: ${uploadResult.error}`);
        return;
      }

      // Update insurance assignment
      const { error } = await supabase
        .from("insurance_assignments")
        .update({
          policy_document_url: uploadResult.url,
          policy_number: policyNumber.trim(),
          coverage_amount: parseFloat(coverageAmount),
          premium_amount: parseFloat(premiumAmount),
          status: "Policy Uploaded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId);

      if (error) {
        console.error("Error updating assignment:", error);
        alert("Error updating assignment. Please try again.");
        return;
      }

      alert("Insurance policy uploaded successfully!");
      fetchAssignments();
      setSelectedAssignment(null);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      alert("Error uploading policy. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const resetForm = () => {
    setPolicyFile(null);
    setPolicyNumber("");
    setCoverageAmount("");
    setPremiumAmount("");
  };

  if (selectedAssignment) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedAssignment(null);
              resetForm();
            }}
            className="mb-4"
          >
            ← Back to Assignments
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#5680E9]">
                Upload Insurance Policy -{" "}
                {selectedAssignment.loan_applications?.full_name}
              </CardTitle>
              <p className="text-gray-600">
                Upload insurance policy document and details for this PMI loan
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Application Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-[#5680E9]">
                  Loan Application Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Applicant</Label>
                    <p className="font-medium">
                      {selectedAssignment.loan_applications?.full_name}
                    </p>
                  </div>
                  <div>
                    <Label>Loan Amount</Label>
                    <p className="font-medium">
                      Rp{" "}
                      {selectedAssignment.loan_applications?.loan_amount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label>Work Location</Label>
                    <p className="font-medium">
                      {selectedAssignment.loan_applications?.work_location}
                    </p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">
                      {selectedAssignment.loan_applications?.email}
                    </p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="font-medium">
                      {selectedAssignment.loan_applications?.phone_number}
                    </p>
                  </div>
                  <div>
                    <Label>Assignment Date</Label>
                    <p className="font-medium">
                      {new Date(
                        selectedAssignment.assigned_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Policy Status */}
              {selectedAssignment.policy_document_url && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-green-700">
                    Current Policy Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Policy Number</Label>
                      <p className="font-medium">
                        {selectedAssignment.policy_number}
                      </p>
                    </div>
                    <div>
                      <Label>Coverage Amount</Label>
                      <p className="font-medium">
                        Rp{" "}
                        {selectedAssignment.coverage_amount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label>Premium Amount</Label>
                      <p className="font-medium">
                        Rp {selectedAssignment.premium_amount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label>Policy Document</Label>
                      <a
                        href={selectedAssignment.policy_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Document
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Policy Form */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#5680E9]">
                  {selectedAssignment.policy_document_url ? "Update" : "Upload"}{" "}
                  Insurance Policy
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      placeholder="Enter policy number"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      defaultValue={selectedAssignment.policy_number || ""}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coverageAmount">
                        Coverage Amount (Rp)
                      </Label>
                      <Input
                        id="coverageAmount"
                        type="number"
                        placeholder="Enter coverage amount"
                        value={coverageAmount}
                        onChange={(e) => setCoverageAmount(e.target.value)}
                        defaultValue={
                          selectedAssignment.coverage_amount?.toString() || ""
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="premiumAmount">Premium Amount (Rp)</Label>
                      <Input
                        id="premiumAmount"
                        type="number"
                        placeholder="Enter premium amount"
                        value={premiumAmount}
                        onChange={(e) => setPremiumAmount(e.target.value)}
                        defaultValue={
                          selectedAssignment.premium_amount?.toString() || ""
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="policyFile">Policy Document (PDF)</Label>
                    <Input
                      id="policyFile"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setPolicyFile(e.target.files?.[0] || null)
                      }
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload the insurance policy document (PDF, JPG, or PNG,
                      max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6 border-t">
                <Button
                  onClick={() => handleUploadPolicy(selectedAssignment.id)}
                  disabled={
                    processing === selectedAssignment.id ||
                    !policyFile ||
                    !policyNumber.trim()
                  }
                  className="bg-[#5680E9] hover:bg-[#4a6bc7] text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {processing === selectedAssignment.id
                    ? "Uploading..."
                    : selectedAssignment.policy_document_url
                      ? "Update Policy"
                      : "Upload Policy"}
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
            Insurance Dashboard
          </h1>
          <p className="text-gray-600">
            Manage insurance policies for assigned PMI loan applications
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Assignment Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Assignments</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, phone, or policy number..."
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
              Insurance Assignments ({filteredAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Loading assignments...</p>
              </div>
            ) : !currentStaffId ? (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Insurance Staff Setup Required
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Your account is not yet set up as insurance staff. Please
                    contact an administrator to:
                  </p>
                  <ul className="text-left text-yellow-700 space-y-1">
                    <li>• Create an insurance staff record for your account</li>
                    <li>• Assign you to an insurance company</li>
                  </ul>
                </div>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    No Insurance Assignments
                  </h3>
                  <p className="text-blue-700">
                    No insurance assignments have been created yet. Assignments
                    will appear here when PMI loan applications are assigned to
                    your insurance company.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                  <Card
                    key={assignment.id}
                    className={`border-l-4 ${
                      assignment.status === "Policy Uploaded"
                        ? "border-l-green-500"
                        : "border-l-orange-500"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {assignment.loan_applications?.full_name}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                assignment.status === "Policy Uploaded"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              {assignment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Email:</span>{" "}
                              {assignment.loan_applications?.email}
                            </div>
                            <div>
                              <span className="font-medium">
                                Work Location:
                              </span>{" "}
                              {assignment.loan_applications?.work_location}
                            </div>
                            <div>
                              <span className="font-medium">Loan Amount:</span>{" "}
                              Rp{" "}
                              {assignment.loan_applications?.loan_amount?.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">
                                Policy Number:
                              </span>{" "}
                              {assignment.policy_number || "Not set"}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Assigned:{" "}
                            {new Date(
                              assignment.assigned_at,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAssignment(assignment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            onClick={() => setSelectedAssignment(assignment)}
                            disabled={processing === assignment.id}
                            size="sm"
                            className="bg-[#5680E9] hover:bg-[#4a6bc7] text-white"
                          >
                            {assignment.status === "Policy Uploaded" ? (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            {assignment.status === "Policy Uploaded"
                              ? "Update"
                              : "Upload"}{" "}
                            Policy
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
    </div>
  );
}
