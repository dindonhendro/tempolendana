import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Search,
  Eye,
  MessageSquare,
  Shield,
} from "lucide-react";
import { supabase, getInsuranceCompanies } from "@/lib/supabase";
import { LoanApplication, Tables } from "@/types/supabase";

interface ValidatorDashboardProps {
  validatorId?: string;
}

export default function ValidatorDashboard({
  validatorId,
}: ValidatorDashboardProps = {}) {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    LoanApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<LoanApplication | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [comments, setComments] = useState("");
  const [insuranceCompanies, setInsuranceCompanies] = useState<
    Tables<"insurance_companies">[]
  >([]);
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [selectedApplicationForInsurance, setSelectedApplicationForInsurance] =
    useState<LoanApplication | null>(null);
  const [selectedInsuranceCompany, setSelectedInsuranceCompany] = useState("");

  useEffect(() => {
    fetchApplications();
    fetchInsuranceCompanies();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("loan_applications")
        .select("*")
        .eq("status", "Checked")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        setApplications(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsuranceCompanies = async () => {
    try {
      const companies = await getInsuranceCompanies();
      setInsuranceCompanies(companies);
    } catch (error) {
      console.error("Error fetching insurance companies:", error);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.phone_number.includes(searchTerm) ||
          app.work_location.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredApplications(filtered);
  };

  const handleApplicationAction = async (
    applicationId: string,
    action: "validate" | "reject",
  ) => {
    if (!comments.trim() && action === "reject") {
      alert("Please provide comments for rejection");
      return;
    }

    setProcessing(applicationId);
    try {
      const newStatus = action === "validate" ? "Validated" : "Rejected";

      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (action === "validate") {
        updateData.validated_by_lendana = validatorId;
        updateData.validated_by_lendana_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("loan_applications")
        .update(updateData)
        .eq("id", applicationId);

      if (error) {
        console.error("Error updating application:", error);
        alert("Error updating application. Please try again.");
      } else {
        // If there are comments, we could store them in a separate comments table
        // For now, we'll just show success message
        alert(
          `Application ${action === "validate" ? "validated" : "rejected"} successfully!`,
        );
        fetchApplications();
        setSelectedApplication(null);
        setComments("");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating application. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const handleAssignInsurance = async () => {
    if (!selectedApplicationForInsurance || !selectedInsuranceCompany) {
      alert("Please select an insurance company");
      return;
    }

    try {
      // Check if insurance assignment already exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from("insurance_assignments")
        .select("id")
        .eq("loan_application_id", selectedApplicationForInsurance.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing assignment:", checkError);
        alert("Error checking existing assignment. Please try again.");
        return;
      }

      if (existingAssignment) {
        alert("This application is already assigned to an insurance company");
        return;
      }

      // Create insurance assignment
      const { error } = await supabase.from("insurance_assignments").insert({
        loan_application_id: selectedApplicationForInsurance.id,
        insurance_company_id: selectedInsuranceCompany,
        assigned_by: validatorId,
        status: "Assigned",
      });

      if (error) {
        console.error("Error creating insurance assignment:", error);
        alert("Error assigning insurance company. Please try again.");
        return;
      }

      alert("Insurance company assigned successfully!");
      setShowInsuranceDialog(false);
      setSelectedApplicationForInsurance(null);
      setSelectedInsuranceCompany("");
    } catch (error) {
      console.error("Error:", error);
      alert("Error assigning insurance company. Please try again.");
    }
  };

  if (selectedApplication) {
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
                Validation Review - {selectedApplication.full_name}
              </CardTitle>
              <p className="text-gray-600">
                Application has been approved by agent and requires validation
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
                    <Label>Institution</Label>
                    <p className="font-medium">
                      {selectedApplication.institution}
                    </p>
                  </div>
                  <div>
                    <Label>Submission Date</Label>
                    <p className="font-medium">
                      {new Date(
                        selectedApplication.created_at,
                      ).toLocaleDateString()}
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
                      {new Date(
                        selectedApplication.tanggal_keberangkatan,
                      ).toLocaleDateString()}
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

              {/* Validation Comments */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#5680E9]">
                  Validation Comments
                </h3>
                <div>
                  <Label htmlFor="comments">
                    Comments (required for rejection)
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Add your validation comments here..."
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
                    handleApplicationAction(selectedApplication.id, "validate")
                  }
                  disabled={processing === selectedApplication.id}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {processing === selectedApplication.id
                    ? "Processing..."
                    : "Validate Application"}
                </Button>
                <Button
                  onClick={() =>
                    handleApplicationAction(selectedApplication.id, "reject")
                  }
                  disabled={
                    processing === selectedApplication.id || !comments.trim()
                  }
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {processing === selectedApplication.id
                    ? "Processing..."
                    : "Reject Application"}
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
            Validator Dashboard
          </h1>
          <p className="text-gray-600">
            Validate loan applications approved by agents
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
              Applications for Validation ({filteredApplications.length})
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
                  No applications pending validation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card
                    key={application.id}
                    className="border-l-4 border-l-orange-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {application.full_name}
                            </h3>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
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
                              <span className="font-medium">Institution:</span>{" "}
                              {application.institution}
                            </div>
                            <div>
                              <span className="font-medium">Loan Amount:</span>{" "}
                              Rp {application.loan_amount?.toLocaleString()}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Submitted:{" "}
                            {new Date(
                              application.created_at,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() =>
                              handleApplicationAction(
                                application.id,
                                "validate",
                              )
                            }
                            disabled={processing === application.id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Validate
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedApplicationForInsurance(application);
                              setShowInsuranceDialog(true);
                            }}
                            disabled={processing === application.id}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Assign Insurance
                          </Button>
                          <Button
                            onClick={() => setSelectedApplication(application)}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insurance Assignment Dialog */}
        <Dialog
          open={showInsuranceDialog}
          onOpenChange={setShowInsuranceDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Insurance Company</DialogTitle>
            </DialogHeader>
            {selectedApplicationForInsurance && (
              <div className="space-y-4">
                <div>
                  <Label>Applicant</Label>
                  <p className="font-medium">
                    {selectedApplicationForInsurance.full_name}
                  </p>
                </div>
                <div>
                  <Label>Loan Amount</Label>
                  <p className="font-medium">
                    Rp{" "}
                    {selectedApplicationForInsurance.loan_amount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label htmlFor="insuranceCompany">
                    Select Insurance Company
                  </Label>
                  <Select
                    value={selectedInsuranceCompany}
                    onValueChange={setSelectedInsuranceCompany}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an insurance company" />
                    </SelectTrigger>
                    <SelectContent>
                      {insuranceCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowInsuranceDialog(false);
                      setSelectedApplicationForInsurance(null);
                      setSelectedInsuranceCompany("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignInsurance}
                    disabled={!selectedInsuranceCompany}
                    className="bg-[#5680E9] hover:bg-[#4a6bc7] text-white"
                  >
                    Assign Insurance
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
