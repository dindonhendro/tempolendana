import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Send,
  Download,
} from "lucide-react";
import {
  supabase,
  getBanks,
  getBankBranches,
  getBankProducts,
  assignApplicationToBranch,
} from "@/lib/supabase";
import { LoanApplication } from "@/types/supabase";

interface AgentDashboardProps {
  agentId?: string;
}

export default function AgentDashboard({ agentId }: AgentDashboardProps = {}) {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<
    LoanApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<LoanApplication | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Assignment states
  const [banks, setBanks] = useState<any[]>([]);
  const [bankProducts, setBankProducts] = useState<any[]>([]);
  const [bankBranches, setBankBranches] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [assigningApplication, setAssigningApplication] = useState<
    string | null
  >(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchBanks();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm]);

  const fetchApplications = async () => {
    try {
      // Get current user to find their agent company
      const { getCurrentUser } = await import("@/lib/supabase");
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        console.log("No current user found");
        setLoading(false);
        return;
      }

      console.log("Current user:", currentUser.email, currentUser.id);

      // Get agent staff record to find agent company
      const { data: agentStaff, error: agentError } = await supabase
        .from("agent_staff")
        .select("agent_company_id")
        .eq("user_id", currentUser.id)
        .single();

      if (agentError || !agentStaff) {
        console.error("Error fetching agent info:", agentError);
        console.log("Agent staff data:", agentStaff);
        setLoading(false);
        return;
      }

      console.log("Agent company ID:", agentStaff.agent_company_id);

      // First, let's check all applications to see what's available
      const { data: allApps, error: allAppsError } = await supabase
        .from("loan_applications")
        .select("id, full_name, email, status, assigned_agent_id, created_at")
        .order("created_at", { ascending: false });

      if (allAppsError) {
        console.error("Error fetching all applications:", allAppsError);
      } else {
        console.log("All applications:", allApps);
        console.log(
          "Looking for application ID: 99f68260-6ab8-4605-9d99-7e4825577f3f",
        );
        const targetApp = allApps?.find(
          (app) => app.id === "99f68260-6ab8-4605-9d99-7e4825577f3f",
        );
        if (targetApp) {
          console.log("Found target application:", targetApp);
        } else {
          console.log("Target application not found in database");
        }
      }

      // Fetch applications assigned to this agent's company
      const { data, error } = await supabase
        .from("loan_applications")
        .select("*")
        .eq("assigned_agent_id", agentStaff.agent_company_id)
        .in("status", ["Submitted", "Checked"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        console.log("Filtered applications for agent:", data);
        setApplications(data || []);
      }

      // Also try fetching without status filter to see if there are other statuses
      const { data: allAssignedApps, error: allAssignedError } = await supabase
        .from("loan_applications")
        .select("id, full_name, email, status, assigned_agent_id")
        .eq("assigned_agent_id", agentStaff.agent_company_id)
        .order("created_at", { ascending: false });

      if (allAssignedError) {
        console.error(
          "Error fetching all assigned applications:",
          allAssignedError,
        );
      } else {
        console.log(
          "All applications assigned to this agent (any status):",
          allAssignedApps,
        );
      }
    } catch (error) {
      console.error("Error:", error);
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
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.phone_number.includes(searchTerm) ||
          app.work_location.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredApplications(filtered);
  };

  const fetchBanks = async () => {
    try {
      const banksData = await getBanks();
      setBanks(banksData);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const handleBankChange = async (bankId: string) => {
    setSelectedBank(bankId);
    setSelectedProduct("");
    setSelectedBranch("");
    setBankProducts([]);
    setBankBranches([]);

    if (bankId) {
      try {
        const [productsData, branchesData] = await Promise.all([
          getBankProducts(bankId),
          getBankBranches(bankId),
        ]);
        setBankProducts(productsData);
        setBankBranches(branchesData);
      } catch (error) {
        console.error("Error fetching bank data:", error);
      }
    }
  };

  const handleAssignApplication = async (applicationId: string) => {
    if (!selectedBank || !selectedProduct || !selectedBranch) {
      alert(
        "All fields are mandatory: Please select bank, product, and branch before assigning.",
      );
      return;
    }

    setAssigningApplication(applicationId);
    try {
      console.log("Attempting to assign application:", {
        applicationId,
        selectedBank,
        selectedProduct,
        selectedBranch,
      });

      // Assign to branch (this will also update status to 'Checked')
      const result = await assignApplicationToBranch(
        applicationId,
        selectedProduct,
        selectedBranch,
      );

      console.log("Assignment successful:", result);
      alert("Application assigned successfully with status 'Checked'!");

      // Refresh the applications list
      await fetchApplications();

      // Reset selections
      setSelectedBank("");
      setSelectedProduct("");
      setSelectedBranch("");
      setBankProducts([]);
      setBankBranches([]);
    } catch (error: any) {
      console.error("Error assigning application:", error);

      // Provide more specific error messages
      let errorMessage = "Error assigning application. Please try again.";

      if (error?.message) {
        if (error.message.includes("already assigned")) {
          errorMessage =
            "This application has already been assigned to a branch.";
        } else if (error.message.includes("not found")) {
          errorMessage =
            "Selected bank product or branch not found. Please refresh and try again.";
        } else if (error.message.includes("Application not found")) {
          errorMessage =
            "Application not found. It may have been processed by another agent.";
        } else {
          errorMessage = `Assignment failed: ${error.message}`;
        }
      }

      alert(errorMessage);

      // Refresh applications in case the status changed
      await fetchApplications();
    } finally {
      setAssigningApplication(null);
    }
  };

  const fetchAssignedApplicationsReport = async () => {
    try {
      // Get current user to find their agent company
      const { getCurrentUser } = await import("@/lib/supabase");
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        return [];
      }

      // Get agent staff record to find agent company
      const { data: agentStaff, error: agentError } = await supabase
        .from("agent_staff")
        .select("agent_company_id")
        .eq("user_id", currentUser.id)
        .single();

      if (agentError || !agentStaff) {
        console.error("Error fetching agent info:", agentError);
        return [];
      }

      // Fetch all applications assigned to this agent's company (including processed ones)
      const { data, error } = await supabase
        .from("loan_applications")
        .select(
          `
          *,
          branch_applications!inner(
            id,
            assigned_at,
            bank_products!inner(
              name,
              banks!inner(name)
            ),
            bank_branches!inner(
              name,
              city,
              province
            )
          )
        `,
        )
        .eq("assigned_agent_id", agentStaff.agent_company_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching assigned applications:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching report data:", error);
      return [];
    }
  };

  const generateCSVReport = (applications: any[]) => {
    const headers = [
      "Application ID",
      "Full Name",
      "Email",
      "Phone Number",
      "Work Location",
      "Loan Amount (Rp)",
      "Tenor (months)",
      "Status",
      "Submission Date",
      "Assigned Bank",
      "Bank Product",
      "Branch Name",
      "Branch Location",
      "Assignment Date",
    ];

    const csvContent = [
      headers.join(","),
      ...applications.map((app) => {
        const branchApp = app.branch_applications?.[0];
        const bankProduct = branchApp?.bank_products;
        const bank = bankProduct?.banks;
        const branch = branchApp?.bank_branches;

        return [
          app.id,
          `"${app.full_name}"`,
          `"${app.email || ""}"`,
          `"${app.phone_number || ""}"`,
          `"${app.work_location || ""}"`,
          app.loan_amount || 0,
          app.tenor_months || 0,
          `"${app.status}"`,
          new Date(app.created_at).toLocaleDateString(),
          `"${bank?.name || ""}"`,
          `"${bankProduct?.name || ""}"`,
          `"${branch?.name || ""}"`,
          `"${branch?.city || ""}, ${branch?.province || ""}"`,
          branchApp?.assigned_at
            ? new Date(branchApp.assigned_at).toLocaleDateString()
            : "",
        ].join(",");
      }),
    ].join("\n");

    return csvContent;
  };

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      const assignedApplications = await fetchAssignedApplicationsReport();

      if (assignedApplications.length === 0) {
        alert("No assigned applications found to generate report.");
        return;
      }

      const csvContent = generateCSVReport(assignedApplications);

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `agent_applications_report_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(
        `Report downloaded successfully! Found ${assignedApplications.length} assigned applications.`,
      );
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleApplicationAction = async (
    applicationId: string,
    action: "approve" | "reject",
  ) => {
    setProcessing(applicationId);
    try {
      const newStatus = action === "approve" ? "Checked" : "Rejected";

      const { error } = await supabase
        .from("loan_applications")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (error) {
        console.error("Error updating application:", error);
        alert("Error updating application. Please try again.");
      } else {
        alert(
          `Application ${action === "approve" ? "approved" : "rejected"} successfully!`,
        );
        fetchApplications();
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error updating application. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  if (selectedApplication) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setSelectedApplication(null)}
            className="mb-4"
          >
            ← Back to Applications
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#5680E9]">
                Application Review - {selectedApplication.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Data */}
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
                    <Label>Birth Place</Label>
                    <p className="font-medium">
                      {selectedApplication.birth_place}
                    </p>
                  </div>
                  <div>
                    <Label>Birth Date</Label>
                    <p className="font-medium">
                      {new Date(
                        selectedApplication.birth_date,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <p className="font-medium">
                      {selectedApplication.phone_number}
                    </p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <Label>NIK KTP</Label>
                    <p className="font-medium">{selectedApplication.nik_ktp}</p>
                  </div>
                  <div>
                    <Label>Last Education</Label>
                    <p className="font-medium">
                      {selectedApplication.last_education}
                    </p>
                  </div>
                  <div>
                    <Label>Nomor Sisko PMI</Label>
                    <p className="font-medium">
                      {selectedApplication.nomor_sisko}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Address KTP</Label>
                  <p className="font-medium">
                    {selectedApplication.address_ktp}
                  </p>
                </div>
                <div className="mt-4">
                  <Label>Address Domicile</Label>
                  <p className="font-medium">
                    {selectedApplication.address_domicile}
                  </p>
                </div>
              </div>

              {/* Family Data */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#5680E9]">
                  Family Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Mother's Name</Label>
                    <p className="font-medium">
                      {selectedApplication.nama_ibu_kandung}
                    </p>
                  </div>
                  {selectedApplication.nama_pasangan && (
                    <div>
                      <Label>Spouse Name</Label>
                      <p className="font-medium">
                        {selectedApplication.nama_pasangan}
                      </p>
                    </div>
                  )}
                  {selectedApplication.ktp_pasangan && (
                    <div>
                      <Label>Spouse KTP</Label>
                      <p className="font-medium">
                        {selectedApplication.ktp_pasangan}
                      </p>
                    </div>
                  )}
                  {selectedApplication.telp_pasangan && (
                    <div>
                      <Label>Spouse Phone</Label>
                      <p className="font-medium">
                        {selectedApplication.telp_pasangan}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Details */}
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
                    <Label>Major</Label>
                    <p className="font-medium">{selectedApplication.major}</p>
                  </div>
                  <div>
                    <Label>Work Experience</Label>
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
                    <Label>Employer Name</Label>
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

              {/* Loan Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#5680E9]">
                  Loan Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label>Submission Date</Label>
                    <p className="font-medium">
                      {new Date(
                        selectedApplication.created_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6 border-t">
                <Button
                  onClick={() =>
                    handleApplicationAction(selectedApplication.id, "approve")
                  }
                  disabled={processing === selectedApplication.id}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {processing === selectedApplication.id
                    ? "Processing..."
                    : "Approve Application"}
                </Button>
                <Button
                  onClick={() =>
                    handleApplicationAction(selectedApplication.id, "reject")
                  }
                  disabled={processing === selectedApplication.id}
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
            Agent Dashboard
          </h1>
          <p className="text-gray-600">
            Review and process submitted loan applications
          </p>
        </div>

        {/* Debug Information */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-yellow-700">
              <p>
                This debug section will help identify why applications might not
                be showing up.
              </p>
              <p className="mt-2">
                Check the browser console (F12) for detailed logs about:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Current user information</li>
                <li>Agent company ID</li>
                <li>All applications in database</li>
                <li>Applications assigned to this agent</li>
              </ul>
            </div>
          </CardContent>
        </Card>

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
              <div className="flex items-end gap-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  disabled={downloadingReport}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadingReport ? "Generating..." : "Download Report"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-[#5680E9]">
              Assign Applications to Bank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Select Bank *</Label>
                <Select
                  value={selectedBank}
                  onValueChange={handleBankChange}
                  required
                >
                  <SelectTrigger
                    className={!selectedBank ? "border-red-300" : ""}
                  >
                    <SelectValue placeholder="Choose a bank (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedBank && (
                  <p className="text-sm text-red-500 mt-1">
                    Bank selection is required
                  </p>
                )}
              </div>

              <div>
                <Label>Select Product *</Label>
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                  disabled={!selectedBank}
                  required
                >
                  <SelectTrigger
                    className={
                      selectedBank && !selectedProduct ? "border-red-300" : ""
                    }
                  >
                    <SelectValue placeholder="Choose a product (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.interest_rate}% (Rp{" "}
                        {product.min_amount?.toLocaleString()} - Rp{" "}
                        {product.max_amount?.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBank && !selectedProduct && (
                  <p className="text-sm text-red-500 mt-1">
                    Product selection is required
                  </p>
                )}
              </div>

              <div>
                <Label>Select Branch *</Label>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                  disabled={!selectedBank}
                  required
                >
                  <SelectTrigger
                    className={
                      selectedBank && !selectedBranch ? "border-red-300" : ""
                    }
                  >
                    <SelectValue placeholder="Choose a branch (required)" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} - {branch.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBank && !selectedBranch && (
                  <p className="text-sm text-red-500 mt-1">
                    Branch selection is required
                  </p>
                )}
              </div>
            </div>

            {selectedBank && selectedProduct && selectedBranch && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Ready to assign applications to:{" "}
                  <strong>
                    {banks.find((b) => b.id === selectedBank)?.name}
                  </strong>{" "}
                  -
                  <strong>
                    {bankProducts.find((p) => p.id === selectedProduct)?.name}
                  </strong>{" "}
                  -
                  <strong>
                    {bankBranches.find((b) => b.id === selectedBranch)?.name}
                  </strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Submitted Applications ({filteredApplications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No submitted applications found</p>
                <p className="text-sm text-gray-500 mt-2">
                  If you expect to see applications here, please check:
                  <br />• Applications are assigned to your agent company
                  <br />• Applications have status 'Submitted' or 'Checked'
                  <br />• Your agent account is properly configured
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card
                    key={application.id}
                    className="border-l-4 border-l-blue-500"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {application.full_name}
                            </h3>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                              {application.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Email:</span>{" "}
                              {application.email}
                            </div>
                            <div>
                              <span className="font-medium">Phone:</span>{" "}
                              {application.phone_number}
                            </div>
                            <div>
                              <span className="font-medium">
                                Work Location:
                              </span>{" "}
                              {application.work_location}
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
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>

                          <Button
                            onClick={() =>
                              handleAssignApplication(application.id)
                            }
                            disabled={
                              assigningApplication === application.id ||
                              !selectedBank ||
                              !selectedProduct ||
                              !selectedBranch
                            }
                            size="sm"
                            className={`${
                              !selectedBank ||
                              !selectedProduct ||
                              !selectedBranch
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#5680E9] hover:bg-[#4a6bc7]"
                            } text-white`}
                            title={
                              !selectedBank ||
                              !selectedProduct ||
                              !selectedBranch
                                ? "Please select bank, product, and branch first"
                                : "Assign application to selected bank"
                            }
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {assigningApplication === application.id
                              ? "Assigning..."
                              : "Assign"}
                          </Button>

                          <Button
                            onClick={() =>
                              handleApplicationAction(application.id, "approve")
                            }
                            disabled={processing === application.id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() =>
                              handleApplicationAction(application.id, "reject")
                            }
                            disabled={processing === application.id}
                            size="sm"
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
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
      </div>
    </div>
  );
}
