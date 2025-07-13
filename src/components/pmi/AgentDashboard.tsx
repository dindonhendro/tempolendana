import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  FileText,
  Plus,
  Upload,
} from "lucide-react";
import {
  supabase,
  getBanks,
  getBankBranches,
  getBankProducts,
  assignApplicationToBranch,
  processBulkApplications,
  parseCSVContent,
} from "@/lib/supabase";
import { LoanApplication, Tables } from "@/types/supabase";
import LoanApplicationForm from "./LoanApplicationForm";

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
  const [showNewApplicationForm, setShowNewApplicationForm] = useState(false);
  const [currentAgentCompanyId, setCurrentAgentCompanyId] = useState<
    string | null
  >(null);

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
  const [downloadingForm, setDownloadingForm] = useState<string | null>(null);

  // Bulk upload states
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [bulkUploadProgress, setBulkUploadProgress] = useState<string>("");
  const [processingBulk, setProcessingBulk] = useState(false);
  const [bulkResults, setBulkResults] = useState<any>(null);

  // Bank product information for selected application
  const [applicationBankProduct, setApplicationBankProduct] =
    useState<any>(null);
  const [loadingBankProduct, setLoadingBankProduct] = useState(false);

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
      setCurrentAgentCompanyId(agentStaff.agent_company_id);

      // Fetch applications assigned to this agent's company (including rejected ones to show comments)
      const { data, error } = await supabase
        .from("loan_applications")
        .select(
          `
          *,
          branch_applications(
            id,
            bank_reviews(
              id,
              status,
              comments,
              reviewed_at,
              bank_staff(
                id,
                position,
                users(
                  full_name
                )
              )
            )
          )
        `,
        )
        .eq("assigned_agent_id", agentStaff.agent_company_id)
        .in("status", ["Submitted", "Checked", "Rejected", "Bank Rejected"])
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

  const generateKURApplicationForm = (application: any) => {
    const formatDate = (dateString: string | null) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("id-ID");
    };

    const formatCurrency = (amount: number | null) => {
      if (!amount) return "0";
      return amount.toLocaleString("id-ID");
    };

    const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Formulir Permohonan KUR PMI</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
    }
    h2, h3 {
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    td {
      padding: 6px;
      vertical-align: top;
    }
    .section-title {
      background-color: black;
      color: white;
      font-weight: bold;
      padding: 5px;
    }
    .signature-box {
      width: 45%;
      height: 100px;
      border: 1px solid black;
      text-align: center;
      padding-top: 40px;
      margin-top: 20px;
    }
    .checkbox {
      margin-left: 20px;
    }
  </style>
</head>
<body>

<h2>FORMULIR PERMOHONAN</h2>
<h3>KREDIT USAHA RAKYAT (KUR) PENEMPATAN PMI</h3>

<p><b>Lampiran 1 - Formulir Permohonan KUR PMI BNI</b></p>

<!-- INFORMASI PRIBADI PEMOHON -->
<div class="section-title">INFORMASI PRIBADI PEMOHON</div>
<table>
  <tr><td>Nama Lengkap</td><td>: ${application.full_name || ""}</td></tr>
  <tr><td>Tempat/Tanggal Lahir</td><td>: ${application.birth_place || ""}, ${formatDate(application.birth_date)}</td></tr>
  <tr><td>Nomor Kartu Penduduk</td><td>: ${application.nik_ktp || ""}</td></tr>
  <tr><td>Nomor Sisko PMI</td><td>: ${application.nomor_sisko || ""}</td></tr>
  <tr><td>Jenis Kelamin</td><td>: ${application.gender || ""}</td></tr>
  <tr><td>Pendidikan Terakhir</td><td>: ${application.last_education || ""}</td></tr>
  <tr><td>Alamat KTP</td><td>: ${application.address_ktp || ""}</td></tr>
  <tr><td>Alamat Domisili</td><td>: ${application.address_domicile || ""}</td></tr>
  <tr><td>Nomor Telepon</td><td>: ${application.phone_number || ""}</td></tr>
  <tr><td>Email</td><td>: ${application.email || ""}</td></tr>
  <tr><td>Nama Ibu Kandung</td><td>: ${application.nama_ibu_kandung || ""}</td></tr>
</table>

<!-- INFORMASI PASANGAN / ORANG TUA -->
<div class="section-title">INFORMASI PASANGAN (Apabila Menikah) / ORANG TUA (Apabila Lajang atau Janda/Duda)</div>
<table>
  <tr><td>Nama Lengkap</td><td>: ${application.nama_pasangan || ""}</td></tr>
  <tr><td>Nomor Kartu Penduduk</td><td>: ${application.ktp_pasangan || ""}</td></tr>
  <tr><td>Alamat</td><td>: ${application.alamat_pasangan || ""}</td></tr>
  <tr><td>Nomor Telepon</td><td>: ${application.telp_pasangan || ""}</td></tr>
</table>

<!-- PERMOHONAN KREDIT -->
<div class="section-title">PERMOHONAN KREDIT</div>
<table>
  <tr><td>Maksimum Permohonan</td><td>: Rp ${formatCurrency(application.loan_amount)}</td></tr>
  <tr><td>Keperluan Kredit</td><td>: Biaya Penempatan PMI</td></tr>
  <tr><td>Jangka Waktu Pembayaran</td><td>: ${application.tenor_months || ""} bulan</td></tr>
  <tr><td>Jenis Kredit</td><td>: KUR Penempatan PMI</td></tr>
</table>

<!-- INFORMASI PEKERJAAN -->
<div class="section-title">INFORMASI PEKERJAAN PEMOHON</div>
<table>
  <tr><td>Negara Tujuan</td><td>: ${application.work_location || ""}</td></tr>
  <tr><td>Nama Pemberi Kerja</td><td>: ${application.nama_pemberi_kerja || ""}</td></tr>
  <tr><td>Alamat Pemberi Kerja</td><td>: ${application.alamat_pemberi_kerja || ""}</td></tr>
  <tr><td>No. Telp. Pemberi Kerja</td><td>: ${application.telp_pemberi_kerja || ""}</td></tr>
  <tr><td>Tanggal Rencana Pemberangkatan</td><td>: ${formatDate(application.tanggal_keberangkatan)}</td></tr>
  <tr><td>Institusi/Lembaga Pelatihan</td><td>: ${application.institution || ""}</td></tr>
  <tr><td>Jurusan/Bidang Keahlian</td><td>: ${application.major || ""}</td></tr>
  <tr><td>Pengalaman Kerja</td><td>: ${application.work_experience || ""}</td></tr>
</table>

<!-- PERNYATAAN -->
<div class="section-title">PERNYATAAN PEMOHON</div>
<ol>
  <li>Semua data yang disampaikan kepada Bank telah lengkap dan benar</li>
  <li>Bank telah memberikan informasi yang jelas dan memadai kepada Pemohon perihal prosedur, syarat dan ketentuan tentang KUR Penempatan PMI</li>
  <li>Pemohon telah membaca dan memahami ketentuan KUR Penempatan PMI dan setuju untuk terikat dan tunduk pada ketentuan KUR Penempatan PMI dari Bank</li>
  <li>Pemohon memahami maksimum kredit yang diajukan Pemohon tidak mengikat dan Bank memiliki kewenangan penuh untuk menetapkan maksimum kredit yang diberikan berdasarkan hasil analisa Bank</li>
  <li>Bank berhak menolak permohonan KUR Penempatan PMI yang diajukan Pemohon apabila Pemohon tidak memenuhi persyaratan untuk memperoleh Fasilitas KUR Penempatan PMI</li>
</ol>

<!-- TANDA TANGAN -->
<div class="section-title">TANDA TANGAN PEMOHON</div>
<table>
  <tr>
    <td style="text-align:center">
      ....................................................<br/>
      Tanda tangan Pemohon KUR sesuai dengan KTP<br/>
      (wajib diisi) sesuai KTP
    </td>
    <td style="text-align:center">
      ....................................................<br/>
      Tanda tangan Pasangan / Orang Tua Pemohon KUR<br/>
      (sesuai KTP)
    </td>
  </tr>
  <tr>
    <td class="signature-box">${application.full_name || ""}</td>
    <td class="signature-box">${application.nama_pasangan || ""}</td>
  </tr>
</table>

<p style="text-align: right; margin-top: 30px;">
  Tanggal: ${formatDate(application.created_at)}
</p>

</body>
</html>`;

    return htmlTemplate;
  };

  const handleDownloadKURForm = async (application: any) => {
    setDownloadingForm(application.id);
    try {
      const htmlContent = generateKURApplicationForm(application);

      // Create and download the file
      const blob = new Blob([htmlContent], {
        type: "text/html;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `KUR_Application_Form_${application.full_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("KUR Application Form downloaded successfully!");
    } catch (error) {
      console.error("Error generating KUR form:", error);
      alert("Error generating KUR form. Please try again.");
    } finally {
      setDownloadingForm(null);
    }
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

  const fetchApplicationBankProduct = async (applicationId: string) => {
    setLoadingBankProduct(true);
    try {
      // Get branch application with bank product details
      const { data, error } = await supabase
        .from("branch_applications")
        .select(
          `
          id,
          bank_products!inner(
            id,
            name,
            interest_rate,
            min_amount,
            max_amount,
            min_tenor,
            max_tenor,
            type,
            banks!inner(
              id,
              name,
              code
            )
          ),
          bank_branches!inner(
            id,
            name,
            city,
            province
          )
        `,
        )
        .eq("loan_application_id", applicationId)
        .single();

      if (error) {
        console.error("Error fetching bank product:", error);
        setApplicationBankProduct(null);
      } else {
        setApplicationBankProduct(data);
      }
    } catch (error) {
      console.error("Error:", error);
      setApplicationBankProduct(null);
    } finally {
      setLoadingBankProduct(false);
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

  // Fetch bank product information when application is selected
  React.useEffect(() => {
    if (selectedApplication) {
      fetchApplicationBankProduct(selectedApplication.id);
    }
  }, [selectedApplication?.id]);

  // Handle bulk upload
  const handleBulkUpload = async () => {
    if (!csvFile || !imageFiles || !currentAgentCompanyId) {
      alert("Please select CSV file and image files");
      return;
    }

    setProcessingBulk(true);
    setBulkUploadProgress("Reading CSV file...");
    setBulkResults(null);

    try {
      // Read CSV file
      const csvContent = await csvFile.text();
      const csvData = parseCSVContent(csvContent);

      setBulkUploadProgress(
        `Found ${csvData.length} records in CSV. Processing files...`,
      );

      // Create file map based on naming convention
      // Expected naming: email_ktp.jpg, email_selfie.jpg
      const fileMap = new Map<string, { ktpFile: File; selfPhotoFile: File }>();

      // Group files by email
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileName = file.name;

        // Extract email from filename (before _ktp or _selfie)
        const match = fileName.match(/^(.+)_(ktp|selfie)\.(jpg|jpeg|png)$/i);
        if (match) {
          const email = match[1];
          const type = match[2].toLowerCase();

          if (!fileMap.has(email)) {
            fileMap.set(email, {
              ktpFile: null as any,
              selfPhotoFile: null as any,
            });
          }

          const fileEntry = fileMap.get(email)!;
          if (type === "ktp") {
            fileEntry.ktpFile = file;
          } else if (type === "selfie") {
            fileEntry.selfPhotoFile = file;
          }
        }
      }

      setBulkUploadProgress(
        `Mapped ${fileMap.size} email addresses with files. Starting upload...`,
      );

      // Process bulk applications
      const results = await processBulkApplications(
        csvData,
        currentAgentCompanyId,
        fileMap,
      );

      setBulkResults(results);
      setBulkUploadProgress(
        `Completed! ${results.successful.length} successful, ${results.failed.length} failed.`,
      );

      // Refresh applications list
      await fetchApplications();
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      setBulkUploadProgress(`Error: ${error.message}`);
    } finally {
      setProcessingBulk(false);
    }
  };

  const resetBulkUpload = () => {
    setCsvFile(null);
    setImageFiles(null);
    setBulkUploadProgress("");
    setBulkResults(null);
    setShowBulkUpload(false);
  };

  const generateCSVTemplate = () => {
    const headers = [
      "full_name",
      "email",
      "phone_number",
      "gender",
      "age",
      "birth_place",
      "birth_date",
      "nik_ktp",
      "address_ktp",
      "address_domicile",
      "last_education",
      "nomor_sisko",
      "nama_ibu_kandung",
      "nama_pasangan",
      "ktp_pasangan",
      "alamat_pasangan",
      "telp_pasangan",
      "institution",
      "major",
      "work_experience",
      "work_location",
      "nama_pemberi_kerja",
      "alamat_pemberi_kerja",
      "telp_pemberi_kerja",
      "tanggal_keberangkatan",
      "loan_amount",
      "tenor_months",
      "other_certifications",
    ];

    const sampleData = [
      "John Doe",
      "john.doe@email.com",
      "081234567890",
      "Male",
      "25",
      "Jakarta",
      "1998-01-15",
      "1234567890123456",
      "Jl. Contoh No. 123, Jakarta",
      "Jl. Contoh No. 123, Jakarta",
      "SMA",
      "PMI123456",
      "Jane Doe",
      "Mary Doe",
      "1234567890123457",
      "Jl. Pasangan No. 456, Jakarta",
      "081234567891",
      "LPK Sukses",
      "Perawat",
      "2 tahun",
      "Saudi Arabia",
      "Al-Rashid Hospital",
      "King Fahd Road, Riyadh",
      "+966123456789",
      "2024-06-01",
      "25000000",
      "24",
      "Sertifikat Perawat",
    ];

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_application_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle bulk upload form
  if (showBulkUpload) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={resetBulkUpload} className="mb-4">
            ← Back to Agent Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#5680E9]">
                Bulk Application Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Upload Instructions:
                </h3>
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                  <li>
                    Download the CSV template and fill in the borrower data
                  </li>
                  <li>
                    Prepare image files with naming convention:{" "}
                    <code>email_ktp.jpg</code> and <code>email_selfie.jpg</code>
                  </li>
                  <li>
                    Example: <code>john.doe@email.com_ktp.jpg</code> and{" "}
                    <code>john.doe@email.com_selfie.jpg</code>
                  </li>
                  <li>Upload the CSV file and all image files together</li>
                  <li>
                    The system will match files to records using the email
                    address
                  </li>
                </ol>
              </div>

              {/* Template Download */}
              <div>
                <Button
                  onClick={generateCSVTemplate}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>

              {/* CSV File Upload */}
              <div>
                <Label htmlFor="csv-file">CSV File *</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                {csvFile && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>

              {/* Image Files Upload */}
              <div>
                <Label htmlFor="image-files">
                  Image Files (KTP & Selfie) *
                </Label>
                <Input
                  id="image-files"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="mt-1"
                />
                {imageFiles && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {imageFiles.length} files
                  </p>
                )}
              </div>

              {/* Progress */}
              {bulkUploadProgress && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800">{bulkUploadProgress}</p>
                </div>
              )}

              {/* Results */}
              {bulkResults && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Upload Results
                    </h4>
                    <p className="text-green-700">
                      Total Processed: {bulkResults.totalProcessed}
                      <br />
                      Successful: {bulkResults.successful.length}
                      <br />
                      Failed: {bulkResults.failed.length}
                    </p>
                  </div>

                  {bulkResults.successful.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">
                        Successful Applications:
                      </h4>
                      <div className="max-h-40 overflow-y-auto">
                        {bulkResults.successful.map(
                          (item: any, index: number) => (
                            <p key={index} className="text-sm text-green-700">
                              {item.name} ({item.email}) - ID:{" "}
                              {item.applicationId}
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {bulkResults.failed.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">
                        Failed Applications:
                      </h4>
                      <div className="max-h-40 overflow-y-auto">
                        {bulkResults.failed.map((item: any, index: number) => (
                          <p key={index} className="text-sm text-red-700">
                            {item.name} ({item.email}) - Error: {item.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleBulkUpload}
                  disabled={!csvFile || !imageFiles || processingBulk}
                  className="bg-[#5680E9] hover:bg-[#5680E9]/90 text-white px-8"
                >
                  {processingBulk ? "Processing..." : "Upload Applications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle new application form
  if (showNewApplicationForm) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => setShowNewApplicationForm(false)}
            className="mb-4"
          >
            ← Back to Agent Dashboard
          </Button>
        </div>
        <LoanApplicationForm
          onSubmit={() => {
            setShowNewApplicationForm(false);
            fetchApplications();
          }}
          preSelectedAgentId={currentAgentCompanyId || undefined}
        />
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
              setApplicationBankProduct(null);
            }}
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

                {/* Bank Product Information */}
                {loadingBankProduct ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      Loading bank product information...
                    </p>
                  </div>
                ) : applicationBankProduct ? (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3">
                      Assigned Bank Product
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-blue-700">Bank</Label>
                        <p className="font-medium text-blue-900">
                          {applicationBankProduct.bank_products.banks.name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-blue-700">Product Name</Label>
                        <p className="font-medium text-blue-900">
                          {applicationBankProduct.bank_products.name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-blue-700">Interest Rate</Label>
                        <p className="font-medium text-blue-900">
                          {applicationBankProduct.bank_products.interest_rate}%
                          per year
                        </p>
                      </div>
                      <div>
                        <Label className="text-blue-700">Loan Range</Label>
                        <p className="font-medium text-blue-900">
                          Rp{" "}
                          {applicationBankProduct.bank_products.min_amount?.toLocaleString()}{" "}
                          - Rp{" "}
                          {applicationBankProduct.bank_products.max_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-blue-700">Tenor Range</Label>
                        <p className="font-medium text-blue-900">
                          {applicationBankProduct.bank_products.min_tenor} -{" "}
                          {applicationBankProduct.bank_products.max_tenor}{" "}
                          months
                        </p>
                      </div>
                      <div>
                        <Label className="text-blue-700">Assigned Branch</Label>
                        <p className="font-medium text-blue-900">
                          {applicationBankProduct.bank_branches.name},{" "}
                          {applicationBankProduct.bank_branches.city}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-yellow-700 text-sm">
                      <strong>Note:</strong> This application has not been
                      assigned to a bank product yet. Use the assignment section
                      below to assign it to a bank.
                    </p>
                  </div>
                )}
              </div>

              {/* Rejection Comments Section */}
              {(selectedApplication.status === "Rejected" ||
                selectedApplication.status === "Bank Rejected") && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">
                    Rejection Comments
                  </h3>

                  {/* Lendana Validator Comments */}
                  {selectedApplication.status === "Rejected" && (
                    <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">
                        Rejected by Lendana Validator
                      </h4>
                      <p className="text-red-700 text-sm">
                        This application was rejected during the validation
                        process by Lendana. For specific rejection reasons,
                        please contact the validation team.
                      </p>
                      <p className="text-red-600 text-xs mt-2">
                        Status: {selectedApplication.status}
                      </p>
                    </div>
                  )}

                  {/* Bank Staff Comments */}
                  {selectedApplication.status === "Bank Rejected" &&
                    selectedApplication.branch_applications &&
                    selectedApplication.branch_applications.length > 0 && (
                      <div className="space-y-3">
                        {selectedApplication.branch_applications.map(
                          (branchApp: any) =>
                            branchApp.bank_reviews &&
                            branchApp.bank_reviews.length > 0
                              ? branchApp.bank_reviews.map(
                                  (review: any, index: number) => (
                                    <div
                                      key={review.id || index}
                                      className="p-4 bg-red-50 rounded-lg border border-red-200"
                                    >
                                      <h4 className="font-semibold text-red-800 mb-2">
                                        Rejected by Bank Staff
                                      </h4>
                                      {review.comments && (
                                        <div className="mb-3">
                                          <Label className="text-red-700 font-medium">
                                            Comments:
                                          </Label>
                                          <p className="text-red-700 bg-white p-2 rounded border mt-1">
                                            {review.comments}
                                          </p>
                                        </div>
                                      )}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <Label className="text-red-700">
                                            Reviewed by:
                                          </Label>
                                          <p className="text-red-600">
                                            {review.bank_staff?.users
                                              ?.full_name || "Bank Staff"}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-red-700">
                                            Review Date:
                                          </Label>
                                          <p className="text-red-600">
                                            {new Date(
                                              review.reviewed_at,
                                            ).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )
                              : null,
                        )}
                      </div>
                    )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6 border-t">
                <Button
                  onClick={() => handleDownloadKURForm(selectedApplication)}
                  disabled={downloadingForm === selectedApplication.id}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {downloadingForm === selectedApplication.id
                    ? "Generating..."
                    : "Download KUR Form"}
                </Button>
                {(selectedApplication.status === "Submitted" ||
                  selectedApplication.status === "Checked") && (
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
                )}
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
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => setShowNewApplicationForm(true)}
                className="bg-[#5680E9] hover:bg-[#5680E9]/90 text-white flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit New Application
              </Button>
              <Button
                onClick={() => setShowBulkUpload(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload Applications
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
                    className={`border-l-4 ${
                      application.status === "Rejected" ||
                      application.status === "Bank Rejected"
                        ? "border-l-red-500"
                        : "border-l-blue-500"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {application.full_name}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                application.status === "Rejected" ||
                                application.status === "Bank Rejected"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
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
                            onClick={() => handleDownloadKURForm(application)}
                            disabled={downloadingForm === application.id}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {downloadingForm === application.id
                              ? "Generating..."
                              : "KUR Form"}
                          </Button>

                          {(application.status === "Submitted" ||
                            application.status === "Checked") && (
                            <>
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
                                  handleApplicationAction(
                                    application.id,
                                    "reject",
                                  )
                                }
                                disabled={processing === application.id}
                                size="sm"
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}

                          {(application.status === "Rejected" ||
                            application.status === "Bank Rejected") && (
                            <span className="text-sm text-red-600 font-medium px-2 py-1 bg-red-50 rounded">
                              Application Rejected - View details for comments
                            </span>
                          )}
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
