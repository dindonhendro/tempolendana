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
  Users,
  Edit,
  Building2,
  QrCode,
  Sparkles,
} from "lucide-react";
import {
  supabase,
  getInsuranceCompanies,
  getCollectorCompanies,
} from "@/lib/supabase";
import { LoanApplication, Tables } from "@/types/supabase";
import ImmutabilityConfirmationDialog from "@/components/pmi/ImmutabilityConfirmationDialog";
import LoanApplicationForm from "./LoanApplicationForm";
import P3MIBusinessLoanForm from "./P3MIBusinessLoanForm";
import HiBankHandoffModal from "./HiBankHandoffModal";
import HiBankEkycSimulatorModal from "./HiBankEkycSimulatorModal";
import {
  initiateHiTalangReferral,
  getHiBankReferral,
  HiBankReferralData,
} from "@/lib/hibankService";

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
  const [collectorCompanies, setCollectorCompanies] = useState<
    Tables<"collector_companies">[]
  >([]);
  const [showCollectorDialog, setShowCollectorDialog] = useState(false);
  const [editingApplication, setEditingApplication] = useState<LoanApplication | null>(null);
  const [selectedApplicationForCollector, setSelectedApplicationForCollector] =
    useState<LoanApplication | null>(null);
  const [selectedCollectorCompany, setSelectedCollectorCompany] = useState("");

  // Immutability dialog state
  const [showImmutabilityDialog, setShowImmutabilityDialog] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    transactionId: string;
    applicationId: string;
    dataHash?: string;
    submittedAt: string;
    applicantName: string;
    submissionType: string;
  } | null>(null);

  // HiBank Handoff & Simulator state
  const [activeHandoffReferral, setActiveHandoffReferral] = useState<HiBankReferralData | null>(null);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [isInitiatingHiBank, setIsInitiatingHiBank] = useState<string | null>(null);

  const handleOpenHiBankHandoff = async (application: any) => {
    try {
      setIsInitiatingHiBank(application.id);
      const referral = await initiateHiTalangReferral(application);
      setActiveHandoffReferral(referral);
      setShowHandoffModal(true);
    } catch (e) {
      console.error("Error initiating HiBank handoff", e);
    } finally {
      setIsInitiatingHiBank(null);
    }
  };

  const handleRefreshHiBankStatus = () => {
    if (activeHandoffReferral) {
      const updated = getHiBankReferral(activeHandoffReferral.applicationId);
      if (updated) {
        setActiveHandoffReferral({ ...updated });
      }
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchInsuranceCompanies();
    fetchCollectorCompanies();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("loan_applications")
        .select(`
          *,
          banks(name),
          bank_products(name)
        `)
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

  const fetchCollectorCompanies = async () => {
    try {
      const companies = await getCollectorCompanies();
      setCollectorCompanies(companies);
    } catch (error) {
      console.error("Error fetching collector companies:", error);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter((app) => {
        const searchTermLower = searchTerm.toLowerCase();

        // Basic info search
        if (app.full_name?.toLowerCase().includes(searchTermLower)) return true;
        if (app.email?.toLowerCase().includes(searchTermLower)) return true;
        if (app.phone_number?.includes(searchTerm)) return true;

        // New fields search
        if ((app as any).banks?.name?.toLowerCase().includes(searchTermLower)) return true;
        if ((app as any).bank_products?.name?.toLowerCase().includes(searchTermLower)) return true;
        if (app.negara_penempatan?.toLowerCase().includes(searchTermLower)) return true;

        return false;
      });
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
        // If validated, compute hash and show immutability dialog
        if (action === "validate") {
          // Compute hash via RPC
          const { data: hashData, error: hashError } = await supabase.rpc(
            'compute_loan_application_hash',
            { p_loan_application_id: applicationId }
          );

          if (hashError) {
            console.error("Error computing hash:", hashError);
          } else {
            // Update with hash
            await supabase
              .from('loan_applications')
              .update({ data_hash: hashData })
              .eq('id', applicationId);
          }

          // Get application details for dialog
          const application = applications.find(app => app.id === applicationId);
          if (application) {
            setValidationResult({
              transactionId: application.transaction_id || "N/A",
              applicationId: applicationId,
              dataHash: hashData || undefined,
              submittedAt: new Date().toISOString(),
              applicantName: application.full_name || "",
              submissionType: application.submission_type || "",
            });
            setShowImmutabilityDialog(true);
          }
        } else {
          alert(`Application rejected successfully!`);
        }

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
        console.error("Detailed error checking existing insurance assignment:", checkError);
        alert(`Error checking existing insurance assignment: ${checkError.message || "Unknown error"}. Details: ${JSON.stringify(checkError)}`);
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
        console.error("Detailed error creating insurance assignment:", error);
        alert(`Error assigning insurance company: ${error.message || "Unknown error"}`);
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

  const handleAssignCollector = async () => {
    if (!selectedApplicationForCollector || !selectedCollectorCompany) {
      alert("Please select a collector company");
      return;
    }

    try {
      // Check if collector assignment already exists
      const { data: existingAssignment, error: checkError } = await supabase
        .from("collector_assignments")
        .select("id")
        .eq("loan_application_id", selectedApplicationForCollector.id)
        .maybeSingle();

      if (checkError) {
        console.error("Detailed error checking existing collector assignment:", checkError);
        alert(`Error checking existing collector assignment: ${checkError.message || "Unknown error"}. Details: ${JSON.stringify(checkError)}`);
        return;
      }

      if (existingAssignment) {
        alert("This application is already assigned to a collector company");
        return;
      }

      // Create collector assignment
      const { error } = await supabase.from("collector_assignments").insert({
        loan_application_id: selectedApplicationForCollector.id,
        collector_company_id: selectedCollectorCompany,
        assigned_by: validatorId,
        status: "Assigned",
      });

      if (error) {
        console.error("Detailed error creating collector assignment:", error);
        alert(`Error assigning collector company: ${error.message || "Unknown error"}`);
        return;
      }

      alert("Collector company assigned successfully!");
      setShowCollectorDialog(false);
      setSelectedApplicationForCollector(null);
      setSelectedCollectorCompany("");
    } catch (error) {
      console.error("Error:", error);
      alert("Error assigning collector company. Please try again.");
    }
  };

  if (editingApplication) {
    const isP3MIBusinessLoan =
      editingApplication.submission_type === "P3MI_BUSINESS_LOAN";
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => {
              setEditingApplication(null);
            }}
            className="mb-4"
          >
            ← Back to Validator Dashboard
          </Button>
        </div>
        {isP3MIBusinessLoan ? (
          <P3MIBusinessLoanForm
            editData={editingApplication}
            onSubmit={() => {
              setEditingApplication(null);
              fetchApplications();
            }}
          />
        ) : (
          <LoanApplicationForm
            editData={editingApplication}
            onSubmit={() => {
              setEditingApplication(null);
              fetchApplications();
            }}
          />
        )}
      </div>
    );
  }

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
                {filteredApplications.map((application) => {
                  const hibankRef = getHiBankReferral(application.id);
                  return (
                    <Card
                      key={application.id}
                      className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg text-slate-900">
                                {application.full_name}
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                {application.status}
                              </span>
                              {hibankRef && (
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                                  hibankRef.status === "EKYC_COMPLETED"
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                    : hibankRef.status === "EXPIRED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700 border border-blue-300"
                                }`}>
                                  <Building2 className="h-3 w-3" />
                                  {hibankRef.status === "EKYC_COMPLETED"
                                    ? "eKYC HiBank Berhasil"
                                    : hibankRef.status === "EXPIRED"
                                    ? "Sesi HiBank Kedaluwarsa"
                                    : "Menunggu eKYC HiBank"}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium text-slate-500">Bank / Product:</span>{" "}
                                <span className="font-medium text-slate-800">
                                  {(application as any).banks?.name || "-"} / {(application as any).bank_products?.name || "HiTalang"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-500">Destination:</span>{" "}
                                <span className="font-medium text-slate-800">{application.negara_penempatan || "-"}</span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-500">Institution:</span>{" "}
                                <span className="font-medium text-slate-800">{application.institution}</span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-500">Loan Amount:</span>{" "}
                                <span className="font-semibold text-emerald-600">
                                  Rp {application.loan_amount?.toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Submitted: {new Date(application.created_at).toLocaleDateString("id-ID")}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              onClick={() => handleOpenHiBankHandoff(application)}
                              disabled={isInitiatingHiBank === application.id}
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-sm"
                            >
                              <Building2 className="h-4 w-4 mr-1.5" />
                              {hibankRef ? "HiBank Hub" : "Kirim ke HiBank"}
                            </Button>
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
                              onClick={() => setEditingApplication(application)}
                              disabled={processing === application.id}
                              size="sm"
                              variant="outline"
                              className="border-[#5680E9] text-[#5680E9] hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedApplicationForCollector(application);
                                setShowCollectorDialog(true);
                              }}
                              disabled={processing === application.id}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Collector
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
                  );
                })}
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

        {/* Collector Assignment Dialog */}
        <Dialog
          open={showCollectorDialog}
          onOpenChange={setShowCollectorDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Collector Company</DialogTitle>
            </DialogHeader>
            {selectedApplicationForCollector && (
              <div className="space-y-4">
                <div>
                  <Label>Applicant</Label>
                  <p className="font-medium">
                    {selectedApplicationForCollector.full_name}
                  </p>
                </div>
                <div>
                  <Label>Loan Amount</Label>
                  <p className="font-medium">
                    Rp{" "}
                    {selectedApplicationForCollector.loan_amount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label htmlFor="collectorCompany">
                    Select Collector Company
                  </Label>
                  <Select
                    value={selectedCollectorCompany}
                    onValueChange={setSelectedCollectorCompany}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a collector company" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectorCompanies.map((company) => (
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
                      setShowCollectorDialog(false);
                      setSelectedApplicationForCollector(null);
                      setSelectedCollectorCompany("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignCollector}
                    disabled={!selectedCollectorCompany}
                    className="bg-[#5680E9] hover:bg-[#4a6bc7] text-white"
                  >
                    Assign Collector
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Immutability Confirmation Dialog */}
      {validationResult && (
        <ImmutabilityConfirmationDialog
          open={showImmutabilityDialog}
          onClose={() => setShowImmutabilityDialog(false)}
          transactionId={validationResult.transactionId}
          applicationId={validationResult.applicationId}
          dataHash={validationResult.dataHash}
          submittedAt={validationResult.submittedAt}
          applicantName={validationResult.applicantName}
          submissionType={validationResult.submissionType}
        />
      )}

      {/* HiBank Validator Handoff Hub Modal */}
      <HiBankHandoffModal
        isOpen={showHandoffModal}
        onClose={() => setShowHandoffModal(false)}
        referralData={activeHandoffReferral}
        onOpenSimulator={() => setShowSimulatorModal(true)}
        onRefreshStatus={handleRefreshHiBankStatus}
      />

      {/* HiBank Mobile eKYC Simulator Modal */}
      <HiBankEkycSimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
        referralData={activeHandoffReferral}
        onEkycCompleted={() => {
          handleRefreshHiBankStatus();
          fetchApplications();
        }}
      />
    </div>
  );
}
