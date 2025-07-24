import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, CheckCircle, Printer, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database, Tables } from "@/types/supabase";

type LoanApplicationInsert =
  Database["public"]["Tables"]["loan_applications"]["Insert"];

interface LoanApplicationFormProps {
  onSubmit?: (data: LoanApplicationInsert) => void;
  editData?: Tables<"loan_applications"> | null;
  preSelectedAgentId?: string;
}

export default function LoanApplicationForm({
  onSubmit,
  editData,
  preSelectedAgentId,
}: LoanApplicationFormProps = {}) {
  const [currentTab, setCurrentTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentCompanies, setAgentCompanies] = useState<any[]>([]);
  const [banks, setBanks] = useState<Tables<"banks">[]>([]);
  const [bankProducts, setBankProducts] = useState<Tables<"bank_products">[]>(
    [],
  );
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [selectedBankProductId, setSelectedBankProductId] =
    useState<string>("");
  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<{
    ktp: "idle" | "uploading" | "success" | "error";
    selfie: "idle" | "uploading" | "success" | "error";
    dokumen_persetujuan_data_privacy:
      | "idle"
      | "uploading"
      | "success"
      | "error";
    surat_permohonan_kredit: "idle" | "uploading" | "success" | "error";
    dokumen_kartu_keluarga: "idle" | "uploading" | "success" | "error";
    dokumen_paspor: "idle" | "uploading" | "success" | "error";
    dokumen_surat_nikah: "idle" | "uploading" | "success" | "error";
    pas_foto_3x4: "idle" | "uploading" | "success" | "error";
    dokumen_ktp_keluarga_penjamin: "idle" | "uploading" | "success" | "error";
    surat_pernyataan_ortu_wali: "idle" | "uploading" | "success" | "error";
    surat_izin_ortu_wali: "idle" | "uploading" | "success" | "error";
    dokumen_perjanjian_penempatan_pmi:
      | "idle"
      | "uploading"
      | "success"
      | "error";
    dokumen_perjanjian_kerja: "idle" | "uploading" | "success" | "error";
    surat_keterangan_p3mi: "idle" | "uploading" | "success" | "error";
    info_slik_bank: "idle" | "uploading" | "success" | "error";
    dokumen_standing_instruction: "idle" | "uploading" | "success" | "error";
    dokumen_lain_1: "idle" | "uploading" | "success" | "error";
    dokumen_lain_2: "idle" | "uploading" | "success" | "error";
    tabel_angsuran_signed: "idle" | "uploading" | "success" | "error";
  }>({
    ktp: "idle",
    selfie: "idle",
    dokumen_persetujuan_data_privacy: "idle",
    surat_permohonan_kredit: "idle",
    dokumen_kartu_keluarga: "idle",
    dokumen_paspor: "idle",
    dokumen_surat_nikah: "idle",
    pas_foto_3x4: "idle",
    dokumen_ktp_keluarga_penjamin: "idle",
    surat_pernyataan_ortu_wali: "idle",
    surat_izin_ortu_wali: "idle",
    dokumen_perjanjian_penempatan_pmi: "idle",
    dokumen_perjanjian_kerja: "idle",
    surat_keterangan_p3mi: "idle",
    info_slik_bank: "idle",
    dokumen_standing_instruction: "idle",
    dokumen_lain_1: "idle",
    dokumen_lain_2: "idle",
    tabel_angsuran_signed: "idle",
  });

  // Form data state
  const [formData, setFormData] = useState<LoanApplicationInsert>(
    editData
      ? {
          full_name: editData.full_name || "",
          gender: editData.gender || "",
          age: editData.age || null,
          birth_place: editData.birth_place || "",
          birth_date: editData.birth_date || "",
          phone_number: editData.phone_number || "",
          email: editData.email || "",
          nik_ktp: editData.nik_ktp || "",
          last_education: editData.last_education || "",
          nomor_sisko: editData.nomor_sisko || "",
          address_ktp: editData.address_ktp || "",
          address_domicile: editData.address_domicile || "",
          nama_ibu_kandung: editData.nama_ibu_kandung || "",
          nama_pasangan: editData.nama_pasangan || "",
          ktp_pasangan: editData.ktp_pasangan || "",
          telp_pasangan: editData.telp_pasangan || "",
          alamat_pasangan: editData.alamat_pasangan || "",
          institution: editData.institution || "",
          major: editData.major || "",
          work_experience: editData.work_experience || "",
          work_location: editData.work_location || "",
          nama_pemberi_kerja: editData.nama_pemberi_kerja || "",
          telp_pemberi_kerja: editData.telp_pemberi_kerja || "",
          tanggal_keberangkatan: editData.tanggal_keberangkatan || "",
          alamat_pemberi_kerja: editData.alamat_pemberi_kerja || "",
          loan_amount: editData.loan_amount || null,
          tenor_months: editData.tenor_months || null,
          bunga_bank: editData.bunga_bank || 6,
          grace_period: editData.grace_period || null,
          negara_penempatan: editData.negara_penempatan || "",
          assigned_agent_id:
            editData.assigned_agent_id || preSelectedAgentId || "",
          status: editData.status || "Submitted",
          submission_type: editData.submission_type || "PMI",
        }
      : {
          full_name: "",
          gender: "",
          age: null,
          birth_place: "",
          birth_date: "",
          phone_number: "",
          email: "",
          nik_ktp: "",
          last_education: "",
          nomor_sisko: "",
          address_ktp: "",
          address_domicile: "",
          nama_ibu_kandung: "",
          institution: "",
          major: "",
          work_experience: "",
          work_location: "",
          nama_pemberi_kerja: "",
          telp_pemberi_kerja: "",
          tanggal_keberangkatan: "",
          alamat_pemberi_kerja: "",
          loan_amount: null,
          tenor_months: null,
          bunga_bank: 6,
          grace_period: null,
          negara_penempatan: "",
          assigned_agent_id: preSelectedAgentId || "",
          status: "Submitted",
          submission_type: "PMI",
        },
  );

  const [files, setFiles] = useState<{
    ktp: File | null;
    selfie: File | null;
    dokumen_persetujuan_data_privacy: File | null;
    surat_permohonan_kredit: File | null;
    dokumen_kartu_keluarga: File | null;
    dokumen_paspor: File | null;
    dokumen_surat_nikah: File | null;
    pas_foto_3x4: File | null;
    dokumen_ktp_keluarga_penjamin: File | null;
    surat_pernyataan_ortu_wali: File | null;
    surat_izin_ortu_wali: File | null;
    dokumen_perjanjian_penempatan_pmi: File | null;
    dokumen_perjanjian_kerja: File | null;
    surat_keterangan_p3mi: File | null;
    info_slik_bank: File | null;
    dokumen_standing_instruction: File | null;
    dokumen_lain_1: File | null;
    dokumen_lain_2: File | null;
    tabel_angsuran_signed: File | null;
  }>({
    ktp: null,
    selfie: null,
    dokumen_persetujuan_data_privacy: null,
    surat_permohonan_kredit: null,
    dokumen_kartu_keluarga: null,
    dokumen_paspor: null,
    dokumen_surat_nikah: null,
    pas_foto_3x4: null,
    dokumen_ktp_keluarga_penjamin: null,
    surat_pernyataan_ortu_wali: null,
    surat_izin_ortu_wali: null,
    dokumen_perjanjian_penempatan_pmi: null,
    dokumen_perjanjian_kerja: null,
    surat_keterangan_p3mi: null,
    info_slik_bank: null,
    dokumen_standing_instruction: null,
    dokumen_lain_1: null,
    dokumen_lain_2: null,
    tabel_angsuran_signed: null,
  });

  useEffect(() => {
    loadAgentCompanies();
    loadBanks();
  }, []);

  useEffect(() => {
    if (selectedBankId) {
      loadBankProducts(selectedBankId, formData.submission_type || undefined);
    } else {
      setBankProducts([]);
      setSelectedBankProductId("");
    }
  }, [selectedBankId, formData.submission_type]);

  const loadAgentCompanies = async () => {
    try {
      const { data } = await supabase
        .from("agent_companies")
        .select("*")
        .order("name");
      setAgentCompanies(data || []);
    } catch (error) {
      console.error("Error loading agent companies:", error);
      setAgentCompanies([]);
    }
  };

  const loadBanks = async () => {
    try {
      const { data } = await supabase.from("banks").select("*").order("name");
      setBanks(data || []);
    } catch (error) {
      console.error("Error loading banks:", error);
      setBanks([]);
    }
  };

  const loadBankProducts = async (bankId: string, submissionType?: string) => {
    try {
      let query = supabase
        .from("bank_products")
        .select("*")
        .eq("bank_id", bankId);

      // Filter by submission type if provided
      if (submissionType) {
        const typeMapping: Record<string, string> = {
          PMI: "pmi placement",
          KUR_PERUMAHAN_PMI: "kur rumah",
          RUMAH_SUBSIDI_PMI: "subsidi rumah",
          KUR_WIRAUSAHA_PMI: "wirausaha",
          PETERNAK_SAPI_PMI: "peternak",
        };

        const productType = typeMapping[submissionType];
        if (productType) {
          query = query.eq("type", productType);
        }
      }

      const { data } = await query.order("name");
      setBankProducts(data || []);
    } catch (error) {
      console.error("Error loading bank products:", error);
      setBankProducts([]);
    }
  };

  const updateFormData = (field: keyof LoanApplicationInsert, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (type: keyof typeof files, file: File | null) => {
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG and PNG files are allowed.");
      return;
    }

    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  const uploadFile = async (
    file: File,
    folder: string,
  ): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("File upload failed:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      console.log("Starting form submission...");

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
        alert("Authentication error. Please sign in again.");
        return;
      }

      if (!user) {
        console.error("No authenticated user found");
        alert("Please sign in to submit application.");
        return;
      }

      console.log("User authenticated:", user.id);

      let ktpUrl = null;
      let selfieUrl = null;
      const documentUrls: Record<string, string | null> = {};

      // Upload KTP file
      if (files.ktp) {
        setUploadStatus((prev) => ({ ...prev, ktp: "uploading" }));
        ktpUrl = await uploadFile(files.ktp, "ktp-photos");
        if (!ktpUrl) {
          setUploadStatus((prev) => ({ ...prev, ktp: "error" }));
          alert("Failed to upload KTP photo. Please try again.");
          return;
        }
        setUploadStatus((prev) => ({ ...prev, ktp: "success" }));
      }

      // Upload selfie file
      if (files.selfie) {
        setUploadStatus((prev) => ({ ...prev, selfie: "uploading" }));
        selfieUrl = await uploadFile(files.selfie, "self-photos");
        if (!selfieUrl) {
          setUploadStatus((prev) => ({ ...prev, selfie: "error" }));
          alert("Failed to upload selfie photo. Please try again.");
          return;
        }
        setUploadStatus((prev) => ({ ...prev, selfie: "success" }));
      }

      // Upload document other files
      const documentKeys = [
        "dokumen_persetujuan_data_privacy",
        "surat_permohonan_kredit",
        "dokumen_kartu_keluarga",
        "dokumen_paspor",
        "dokumen_surat_nikah",
        "pas_foto_3x4",
        "dokumen_ktp_keluarga_penjamin",
        "surat_pernyataan_ortu_wali",
        "surat_izin_ortu_wali",
        "dokumen_perjanjian_penempatan_pmi",
        "dokumen_perjanjian_kerja",
        "surat_keterangan_p3mi",
        "info_slik_bank",
        "dokumen_standing_instruction",
        "dokumen_lain_1",
        "dokumen_lain_2",
        "tabel_angsuran_signed",
      ];

      for (const docKey of documentKeys) {
        const file = files[docKey as keyof typeof files];
        if (file) {
          setUploadStatus((prev) => ({ ...prev, [docKey]: "uploading" }));
          const url = await uploadFile(file, "document-other");
          if (!url) {
            setUploadStatus((prev) => ({ ...prev, [docKey]: "error" }));
            alert(
              `Failed to upload ${docKey.replace(/_/g, " ")}. Please try again.`,
            );
            return;
          }
          documentUrls[`${docKey}_url`] = url;
          setUploadStatus((prev) => ({ ...prev, [docKey]: "success" }));
        }
      }

      // Prepare final data
      const finalData: LoanApplicationInsert = {
        ...formData,
        ...documentUrls,
        user_id: user.id,
        ktp_photo_url: ktpUrl,
        self_photo_url: selfieUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Final data to be submitted:", {
        ...finalData,
        // Don't log sensitive URLs, just indicate if they exist
        ktp_photo_url: ktpUrl ? "[FILE_UPLOADED]" : null,
        self_photo_url: selfieUrl ? "[FILE_UPLOADED]" : null,
      });

      // Submit to database (insert or update)
      if (editData) {
        console.log("Updating existing application:", editData.id);
        // Update existing application
        const { data: updateResult, error } = await supabase
          .from("loan_applications")
          .update({
            ...finalData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editData.id)
          .select();

        if (error) {
          console.error("Database update error:", error);
          alert(`Failed to update application: ${error.message}`);
          return;
        }

        console.log("Application updated successfully:", updateResult);
        alert("Application updated successfully!");
      } else {
        console.log("Inserting new application...");
        // Insert new application
        const { data: insertResult, error } = await supabase
          .from("loan_applications")
          .insert([finalData])
          .select();

        if (error) {
          console.error("Database insert error:", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          alert(`Failed to submit application: ${error.message}`);
          return;
        }

        console.log("Application inserted successfully:", insertResult);
        alert("Application submitted successfully!");
      }

      if (onSubmit) onSubmit(finalData);
    } catch (error: any) {
      console.error("Submission error:", error);
      console.error("Error stack:", error.stack);
      alert(
        `An error occurred while submitting your application: ${error.message || "Unknown error"}. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
      setUploadStatus({
        ktp: "idle",
        selfie: "idle",
        dokumen_persetujuan_data_privacy: "idle",
        surat_permohonan_kredit: "idle",
        dokumen_kartu_keluarga: "idle",
        dokumen_paspor: "idle",
        dokumen_surat_nikah: "idle",
        pas_foto_3x4: "idle",
        dokumen_ktp_keluarga_penjamin: "idle",
        surat_pernyataan_ortu_wali: "idle",
        surat_izin_ortu_wali: "idle",
        dokumen_perjanjian_penempatan_pmi: "idle",
        dokumen_perjanjian_kerja: "idle",
        surat_keterangan_p3mi: "idle",
        info_slik_bank: "idle",
        dokumen_standing_instruction: "idle",
        dokumen_lain_1: "idle",
        dokumen_lain_2: "idle",
        tabel_angsuran_signed: "idle",
      });
    }
  };

  // Calculate monthly installments
  const calculateInstallments = () => {
    const loanAmount = formData.loan_amount || 0;
    const tenorMonths = formData.tenor_months || 0;
    const annualRate = (formData.bunga_bank || 6) / 100;
    const monthlyRate = annualRate / 12;
    const gracePeriod = formData.grace_period || 0;

    if (loanAmount <= 0 || tenorMonths <= 0) return [];

    // Calculate monthly payment using PMT formula
    const monthlyPayment =
      monthlyRate > 0
        ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenorMonths)) /
          (Math.pow(1 + monthlyRate, tenorMonths) - 1)
        : loanAmount / tenorMonths;

    const installments = [];
    let remainingBalance = loanAmount;
    const startDate = new Date();

    for (let month = 1; month <= tenorMonths + gracePeriod; month++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + month - 1);

      if (month <= gracePeriod) {
        // Grace period - no payment (completely free)
        installments.push({
          month,
          date: paymentDate.toLocaleDateString("id-ID"),
          principal: 0,
          interest: 0,
          totalPayment: 0,
          remainingBalance,
          type: "Grace Period (Gratis)",
        });
      } else {
        // Regular payment period
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance = Math.max(0, remainingBalance - principalPayment);

        installments.push({
          month,
          date: paymentDate.toLocaleDateString("id-ID"),
          principal: principalPayment,
          interest: interestPayment,
          totalPayment: monthlyPayment,
          remainingBalance,
          type: "Angsuran Efektif",
        });
      }
    }

    return installments;
  };

  const printInstallmentTable = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const installments = calculateInstallments();
    const totalInterest = installments.reduce(
      (sum, inst) => sum + inst.interest,
      0,
    );
    const totalPayment = (formData.loan_amount || 0) + totalInterest;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tabel Angsuran KUR PMI</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info-table { width: 100%; margin-bottom: 20px; }
          .info-table td { padding: 5px; }
          .installment-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .installment-table th, .installment-table td { border: 1px solid #000; padding: 8px; text-align: center; }
          .installment-table th { background-color: #f0f0f0; }
          .signature-section { margin-top: 50px; }
          .signature-box { display: inline-block; width: 200px; text-align: center; margin: 0 50px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>TABEL ANGSURAN KREDIT USAHA RAKYAT (KUR)</h2>
          <h3>PEKERJA MIGRAN INDONESIA (PMI)</h3>
        </div>
        
        <table class="info-table">
          <tr><td><strong>Nama Pemohon:</strong></td><td>${formData.full_name || "-"}</td></tr>
          <tr><td><strong>Jenis Angsuran:</strong></td><td>Angsuran Efektif</td></tr>
          <tr><td><strong>Jumlah Pinjaman:</strong></td><td>Rp ${(formData.loan_amount || 0).toLocaleString("id-ID")}</td></tr>
          <tr><td><strong>Tenor:</strong></td><td>${formData.tenor_months || 0} Bulan</td></tr>
          <tr><td><strong>Bunga Bank:</strong></td><td>${formData.bunga_bank || 6}% per tahun</td></tr>
          <tr><td><strong>Grace Period:</strong></td><td>${formData.grace_period || 0} Bulan</td></tr>
          <tr><td><strong>Total Bunga:</strong></td><td>Rp ${totalInterest.toLocaleString("id-ID")}</td></tr>
          <tr><td><strong>Total Pembayaran:</strong></td><td>Rp ${totalPayment.toLocaleString("id-ID")}</td></tr>
        </table>

        <table class="installment-table">
          <thead>
            <tr>
              <th>Bulan</th>
              <th>Tanggal</th>
              <th>Jenis Pembayaran</th>
              <th>Pokok</th>
              <th>Bunga</th>
              <th>Total Angsuran</th>
              <th>Sisa Pinjaman</th>
            </tr>
          </thead>
          <tbody>
            ${installments
              .map(
                (inst) => `
              <tr>
                <td>${inst.month}</td>
                <td>${inst.date}</td>
                <td>${inst.type}</td>
                <td>Rp ${inst.principal.toLocaleString("id-ID")}</td>
                <td>Rp ${inst.interest.toLocaleString("id-ID")}</td>
                <td>Rp ${inst.totalPayment.toLocaleString("id-ID")}</td>
                <td>Rp ${inst.remainingBalance.toLocaleString("id-ID")}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature-box">
            <p>Pemohon,</p>
            <br><br><br>
            <p>(_____________________)</p>
            <p>${formData.full_name || ""}</p>
          </div>
          <div class="signature-box">
            <p>Petugas Bank,</p>
            <br><br><br>
            <p>(_____________________)</p>
            <p>Nama & Tanda Tangan</p>
          </div>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px;">Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}</p>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadInstallmentCSV = () => {
    const installments = calculateInstallments();
    const totalInterest = installments.reduce(
      (sum, inst) => sum + inst.interest,
      0,
    );
    const totalPayment = (formData.loan_amount || 0) + totalInterest;

    // Create CSV header
    const csvHeader = [
      "Bulan",
      "Tanggal",
      "Jenis Pembayaran",
      "Pokok",
      "Bunga",
      "Total Angsuran",
      "Sisa Pinjaman",
    ].join(",");

    // Create CSV rows
    const csvRows = installments.map((inst) =>
      [
        inst.month,
        inst.date,
        `"${inst.type}"`,
        inst.principal.toFixed(0),
        inst.interest.toFixed(0),
        inst.totalPayment.toFixed(0),
        inst.remainingBalance.toFixed(0),
      ].join(","),
    );

    // Add summary information at the top
    const summaryRows = [
      `"Nama Pemohon","${formData.full_name || "-"}","","","","",""`,
      `"Jenis Angsuran","Angsuran Efektif","","","","",""`,
      `"Jumlah Pinjaman","${(formData.loan_amount || 0).toLocaleString("id-ID")}","","","","",""`,
      `"Tenor","${formData.tenor_months || 0} Bulan","","","","",""`,
      `"Bunga Bank","${formData.bunga_bank || 6}% per tahun","","","","",""`,
      `"Grace Period","${formData.grace_period || 0} Bulan","","","","",""`,
      `"Total Bunga","${totalInterest.toLocaleString("id-ID")}","","","","",""`,
      `"Total Pembayaran","${totalPayment.toLocaleString("id-ID")}","","","","",""`,
      "",
      csvHeader,
    ];

    // Combine all rows
    const csvContent = [...summaryRows, ...csvRows].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Tabel_Angsuran_${formData.full_name || "PMI"}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    "personal",
    "documents",
    "agent",
    "loan",
    "document-other",
    "family",
    "work",
    "installment",
    "summary",
  ];
  const currentIndex = tabs.indexOf(currentTab);

  const nextTab = () => {
    // Check if "Belum ada agent" is selected and we're on the agent tab
    if (
      currentTab === "agent" &&
      formData.assigned_agent_id === "e558e9a3-0438-4e8c-b09f-bad255f5d715"
    ) {
      setCurrentTab("summary");
      return;
    }

    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#5680E9]">
            {editData
              ? "Edit PMI Loan Application"
              : "PMI Loan Application Form"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="agent">Agent</TabsTrigger>
              <TabsTrigger value="loan">Loan</TabsTrigger>
              <TabsTrigger value="document-other">Doc Other</TabsTrigger>
              <TabsTrigger value="family">Family</TabsTrigger>
              <TabsTrigger value="work">Work</TabsTrigger>
              <TabsTrigger value="installment">Angsuran</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ""}
                    onChange={(e) =>
                      updateFormData("full_name", e.target.value)
                    }
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) => updateFormData("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ""}
                    onChange={(e) =>
                      updateFormData("age", parseInt(e.target.value) || null)
                    }
                    placeholder="Enter your age"
                  />
                </div>
                <div>
                  <Label htmlFor="birth_place">Birth Place *</Label>
                  <Input
                    id="birth_place"
                    value={formData.birth_place || ""}
                    onChange={(e) =>
                      updateFormData("birth_place", e.target.value)
                    }
                    placeholder="Enter your birth place"
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date">Birth Date *</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date || ""}
                    onChange={(e) =>
                      updateFormData("birth_date", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number || ""}
                    onChange={(e) =>
                      updateFormData("phone_number", e.target.value)
                    }
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="nik_ktp">NIK KTP *</Label>
                  <Input
                    id="nik_ktp"
                    value={formData.nik_ktp || ""}
                    onChange={(e) => updateFormData("nik_ktp", e.target.value)}
                    placeholder="Enter your NIK KTP"
                  />
                </div>
                <div>
                  <Label htmlFor="last_education">Last Education *</Label>
                  <Select
                    value={formData.last_education || ""}
                    onValueChange={(value) =>
                      updateFormData("last_education", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SD">SD</SelectItem>
                      <SelectItem value="SMP">SMP</SelectItem>
                      <SelectItem value="SMA">SMA</SelectItem>
                      <SelectItem value="D3">D3</SelectItem>
                      <SelectItem value="S1">S1</SelectItem>
                      <SelectItem value="S2">S2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nomor_sisko">Nomor Sisko PMI *</Label>
                  <Input
                    id="nomor_sisko"
                    value={formData.nomor_sisko || ""}
                    onChange={(e) =>
                      updateFormData("nomor_sisko", e.target.value)
                    }
                    placeholder="Enter your Sisko PMI number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address_ktp">Address KTP</Label>
                <Textarea
                  id="address_ktp"
                  value={formData.address_ktp || ""}
                  onChange={(e) =>
                    updateFormData("address_ktp", e.target.value)
                  }
                  placeholder="Enter your KTP address"
                />
              </div>
              <div>
                <Label htmlFor="address_domicile">Address Domicile</Label>
                <Textarea
                  id="address_domicile"
                  value={formData.address_domicile || ""}
                  onChange={(e) =>
                    updateFormData("address_domicile", e.target.value)
                  }
                  placeholder="Enter your domicile address"
                />
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 mt-6">
              <div>
                <Label>Upload KTP Photo</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadStatus.ktp === "uploading" ? (
                        <div className="text-blue-500">Uploading...</div>
                      ) : uploadStatus.ktp === "success" ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      )}
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        KTP photo
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileSelect("ktp", e.target.files?.[0] || null)
                      }
                    />
                  </label>
                  {files.ktp && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {files.ktp.name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Upload Selfie Photo</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadStatus.selfie === "uploading" ? (
                        <div className="text-blue-500">Uploading...</div>
                      ) : uploadStatus.selfie === "success" ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : (
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      )}
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        selfie photo
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileSelect("selfie", e.target.files?.[0] || null)
                      }
                    />
                  </label>
                  {files.selfie && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {files.selfie.name}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="installment" className="space-y-6 mt-6">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-[#5680E9]">
                    Tabel Angsuran Bulanan KUR PMI
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={downloadInstallmentCSV}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={!formData.loan_amount || !formData.tenor_months}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </Button>
                    <Button
                      type="button"
                      onClick={printInstallmentTable}
                      className="bg-[#5680E9] hover:bg-[#5680E9]/90"
                      disabled={!formData.loan_amount || !formData.tenor_months}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Cetak Tabel
                    </Button>
                  </div>
                </div>

                {/* Loan Information Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded">
                  <div>
                    <p>
                      <strong>Nama Pemohon:</strong> {formData.full_name || "-"}
                    </p>
                    <p>
                      <strong>Jenis Angsuran:</strong> Angsuran Efektif
                    </p>
                    <p>
                      <strong>Jumlah Pinjaman:</strong> Rp{" "}
                      {(formData.loan_amount || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Tenor:</strong> {formData.tenor_months || 0} Bulan
                    </p>
                    <p>
                      <strong>Bunga Bank:</strong> {formData.bunga_bank || 6}%
                      per tahun
                    </p>
                    <p>
                      <strong>Grace Period:</strong>{" "}
                      {formData.grace_period || 0} Bulan
                    </p>
                  </div>
                </div>

                {/* Installment Table */}
                {formData.loan_amount && formData.tenor_months ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">Bulan</TableHead>
                          <TableHead className="text-center">Tanggal</TableHead>
                          <TableHead className="text-center">
                            Jenis Pembayaran
                          </TableHead>
                          <TableHead className="text-center">Pokok</TableHead>
                          <TableHead className="text-center">Bunga</TableHead>
                          <TableHead className="text-center">
                            Total Angsuran
                          </TableHead>
                          <TableHead className="text-center">
                            Sisa Pinjaman
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calculateInstallments().map((installment, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-center">
                              {installment.month}
                            </TableCell>
                            <TableCell className="text-center">
                              {installment.date}
                            </TableCell>
                            <TableCell className="text-center">
                              {installment.type}
                            </TableCell>
                            <TableCell className="text-right">
                              Rp {installment.principal.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell className="text-right">
                              Rp {installment.interest.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell className="text-right">
                              Rp{" "}
                              {installment.totalPayment.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell className="text-right">
                              Rp{" "}
                              {installment.remainingBalance.toLocaleString(
                                "id-ID",
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>
                      Silakan lengkapi data pinjaman untuk melihat tabel
                      angsuran
                    </p>
                  </div>
                )}

                {/* Upload Signed Document */}
                <div className="mt-8 p-4 border-t">
                  <h4 className="font-medium mb-4 text-[#5680E9]">
                    Upload Tabel Angsuran yang Sudah Ditandatangani
                  </h4>
                  <div>
                    <Label>Upload Tabel Angsuran Bertanda Tangan</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadStatus.tabel_angsuran_signed ===
                          "uploading" ? (
                            <div className="text-blue-500">Uploading...</div>
                          ) : uploadStatus.tabel_angsuran_signed ===
                            "success" ? (
                            <CheckCircle className="w-8 h-8 text-green-500" />
                          ) : (
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          )}
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            tabel angsuran bertanda tangan
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, PDF (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            handleFileSelect(
                              "tabel_angsuran_signed",
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>
                      {files.tabel_angsuran_signed && (
                        <p className="mt-2 text-sm text-green-600">
                          Selected: {files.tabel_angsuran_signed.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6 mt-6">
              {formData.assigned_agent_id ===
                "e558e9a3-0438-4e8c-b09f-bad255f5d715" && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">!</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-blue-800 mb-2">
                        Informasi Penting
                      </h4>
                      <p className="text-blue-700">
                        Anda Mendaftar sebagai calon PMI dan belum memiliki
                        P3MI. Lendana akan menghubungi anda untuk mencarikan
                        P3MI yang sesuai.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-[#5680E9]">
                  Application Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {formData.full_name}
                      </p>
                      <p>
                        <span className="font-medium">Gender:</span>{" "}
                        {formData.gender}
                      </p>
                      <p>
                        <span className="font-medium">Age:</span> {formData.age}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {formData.phone_number}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {formData.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Loan Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Amount:</span> Rp{" "}
                        {formData.loan_amount?.toLocaleString() || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Tenor:</span>{" "}
                        {formData.tenor_months} months
                      </p>
                      <p>
                        <span className="font-medium">Interest Rate:</span>{" "}
                        {formData.bunga_bank}% per year
                      </p>
                      <p>
                        <span className="font-medium">Grace Period:</span>{" "}
                        {formData.grace_period || 0} months
                      </p>
                      <p>
                        <span className="font-medium">Application Type:</span>{" "}
                        {formData.submission_type || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Work Location:</span>{" "}
                        {formData.work_location || "-"}
                      </p>
                      <p>
                        <span className="font-medium">
                          Country of Placement:
                        </span>{" "}
                        {formData.negara_penempatan || "-"}
                      </p>
                      <p>
                        <span className="font-medium">Departure Date:</span>{" "}
                        {formData.tanggal_keberangkatan || "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Documents Status</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">KTP Photo:</span>{" "}
                        {files.ktp ? "✓ Uploaded" : "✗ Not uploaded"}
                      </p>
                      <p>
                        <span className="font-medium">Selfie Photo:</span>{" "}
                        {files.selfie ? "✓ Uploaded" : "✗ Not uploaded"}
                      </p>
                      <p>
                        <span className="font-medium">
                          Additional Documents:
                        </span>{" "}
                        {Object.values(files).filter((f) => f !== null).length -
                          (files.ktp ? 1 : 0) -
                          (files.selfie ? 1 : 0)}{" "}
                        uploaded
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Family Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Mother's Name:</span>{" "}
                        {formData.nama_ibu_kandung}
                      </p>
                      <p>
                        <span className="font-medium">Spouse:</span>{" "}
                        {formData.nama_pasangan || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please review all information
                    carefully before submitting. Once submitted, your
                    application will be processed by our validation team.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agent" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="assigned_agent">Select Agent (P3MI) *</Label>
                <Select
                  value={formData.assigned_agent_id || ""}
                  onValueChange={(value) =>
                    updateFormData("assigned_agent_id", value)
                  }
                  disabled={!!preSelectedAgentId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        preSelectedAgentId
                          ? "Agent pre-selected"
                          : "Choose an agent company"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {agentCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} ({company.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {preSelectedAgentId && (
                  <p className="text-sm text-gray-500 mt-1">
                    Agent has been automatically assigned for your account.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="negara_penempatan">
                  Negara Penempatan (Country of Placement)
                </Label>
                <Select
                  value={formData.negara_penempatan || ""}
                  onValueChange={(value) =>
                    updateFormData("negara_penempatan", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country of placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                    <SelectItem value="Malaysia">Malaysia</SelectItem>
                    <SelectItem value="Hong Kong">Hong Kong</SelectItem>
                    <SelectItem value="Taiwan">Taiwan</SelectItem>
                    <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="Kuwait">Kuwait</SelectItem>
                    <SelectItem value="Qatar">Qatar</SelectItem>
                    <SelectItem value="Oman">Oman</SelectItem>
                    <SelectItem value="Bahrain">Bahrain</SelectItem>
                    <SelectItem value="Jordan">Jordan</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="document-other" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    key: "dokumen_persetujuan_data_privacy",
                    label: "Dokumen persetujuan data privacy",
                  },
                  {
                    key: "surat_permohonan_kredit",
                    label: "Surat permohonan kredit ke bank",
                  },
                  {
                    key: "dokumen_kartu_keluarga",
                    label: "Dokumen Kartu Keluarga",
                  },
                  { key: "dokumen_paspor", label: "Dokumen Paspor" },
                  { key: "dokumen_surat_nikah", label: "Dokumen Surat Nikah" },
                  { key: "pas_foto_3x4", label: "Pas Foto (3x4)" },
                  {
                    key: "dokumen_ktp_keluarga_penjamin",
                    label: "Dokumen KTP keluarga penjamin/pasangan",
                  },
                  {
                    key: "surat_pernyataan_ortu_wali",
                    label: "Surat pernyataan orang tua/wali",
                  },
                  {
                    key: "surat_izin_ortu_wali",
                    label: "Surat izin orang tua/wali",
                  },
                  {
                    key: "dokumen_perjanjian_penempatan_pmi",
                    label: "Dokumen perjanjian penempatan PMI–P3MI",
                  },
                  {
                    key: "dokumen_perjanjian_kerja",
                    label: "Dokumen perjanjian kerja (PK)",
                  },
                  {
                    key: "surat_keterangan_p3mi",
                    label: "Surat keterangan dari P3MI",
                  },
                  { key: "info_slik_bank", label: "Info SLIK dari bank" },
                  {
                    key: "dokumen_standing_instruction",
                    label: "Dokumen standing instruction",
                  },
                  { key: "dokumen_lain_1", label: "Dokumen lain 1" },
                  { key: "dokumen_lain_2", label: "Dokumen lain 2" },
                ].map((doc) => (
                  <div key={doc.key}>
                    <Label>{doc.label}</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadStatus[
                            doc.key as keyof typeof uploadStatus
                          ] === "uploading" ? (
                            <div className="text-blue-500">Uploading...</div>
                          ) : uploadStatus[
                              doc.key as keyof typeof uploadStatus
                            ] === "success" ? (
                            <CheckCircle className="w-8 h-8 text-green-500" />
                          ) : (
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          )}
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            {doc.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, PDF (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            handleFileSelect(
                              doc.key as keyof typeof files,
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>
                      {files[doc.key as keyof typeof files] && (
                        <p className="mt-2 text-sm text-green-600">
                          Selected: {files[doc.key as keyof typeof files]?.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="family" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama_ibu_kandung">Nama Ibu Kandung *</Label>
                  <Input
                    id="nama_ibu_kandung"
                    value={formData.nama_ibu_kandung || ""}
                    onChange={(e) =>
                      updateFormData("nama_ibu_kandung", e.target.value)
                    }
                    placeholder="Enter mother's name"
                  />
                </div>
                <div>
                  <Label htmlFor="nama_pasangan">Nama Pasangan</Label>
                  <Input
                    id="nama_pasangan"
                    value={formData.nama_pasangan || ""}
                    onChange={(e) =>
                      updateFormData("nama_pasangan", e.target.value)
                    }
                    placeholder="Enter spouse's name (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="ktp_pasangan">KTP Pasangan</Label>
                  <Input
                    id="ktp_pasangan"
                    value={formData.ktp_pasangan || ""}
                    onChange={(e) =>
                      updateFormData("ktp_pasangan", e.target.value)
                    }
                    placeholder="Enter spouse's KTP (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="telp_pasangan">Telp Pasangan</Label>
                  <Input
                    id="telp_pasangan"
                    value={formData.telp_pasangan || ""}
                    onChange={(e) =>
                      updateFormData("telp_pasangan", e.target.value)
                    }
                    placeholder="Enter spouse's phone (optional)"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="alamat_pasangan">Alamat Pasangan</Label>
                <Textarea
                  id="alamat_pasangan"
                  value={formData.alamat_pasangan || ""}
                  onChange={(e) =>
                    updateFormData("alamat_pasangan", e.target.value)
                  }
                  placeholder="Enter spouse's address (optional)"
                />
              </div>
            </TabsContent>

            <TabsContent value="work" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama_pemberi_kerja">Nama Pemberi Kerja</Label>
                  <Input
                    id="nama_pemberi_kerja"
                    value={formData.nama_pemberi_kerja || ""}
                    onChange={(e) =>
                      updateFormData("nama_pemberi_kerja", e.target.value)
                    }
                    placeholder="Enter employer name"
                  />
                </div>
                <div>
                  <Label htmlFor="telp_pemberi_kerja">Telp Pemberi Kerja</Label>
                  <Input
                    id="telp_pemberi_kerja"
                    value={formData.telp_pemberi_kerja || ""}
                    onChange={(e) =>
                      updateFormData("telp_pemberi_kerja", e.target.value)
                    }
                    placeholder="Enter employer phone"
                  />
                </div>
                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={formData.institution || ""}
                    onChange={(e) =>
                      updateFormData("institution", e.target.value)
                    }
                    placeholder="Enter institution name"
                  />
                </div>
                <div>
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    value={formData.major || ""}
                    onChange={(e) => updateFormData("major", e.target.value)}
                    placeholder="Enter your major/field"
                  />
                </div>
                <div>
                  <Label htmlFor="work_experience">Work Experience</Label>
                  <Input
                    id="work_experience"
                    value={formData.work_experience || ""}
                    onChange={(e) =>
                      updateFormData("work_experience", e.target.value)
                    }
                    placeholder="Enter work experience"
                  />
                </div>
                <div>
                  <Label htmlFor="work_location">Work Location</Label>
                  <Input
                    id="work_location"
                    value={formData.work_location || ""}
                    onChange={(e) =>
                      updateFormData("work_location", e.target.value)
                    }
                    placeholder="Enter work location"
                  />
                </div>
                <div>
                  <Label htmlFor="tanggal_keberangkatan">
                    Tanggal Keberangkatan
                  </Label>
                  <Input
                    id="tanggal_keberangkatan"
                    type="date"
                    value={formData.tanggal_keberangkatan || ""}
                    onChange={(e) =>
                      updateFormData("tanggal_keberangkatan", e.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="alamat_pemberi_kerja">
                  Alamat Pemberi Kerja
                </Label>
                <Textarea
                  id="alamat_pemberi_kerja"
                  value={formData.alamat_pemberi_kerja || ""}
                  onChange={(e) =>
                    updateFormData("alamat_pemberi_kerja", e.target.value)
                  }
                  placeholder="Enter employer address"
                />
              </div>
            </TabsContent>

            <TabsContent value="loan" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="submission_type">Jenis Aplikasi KUR *</Label>
                <Select
                  value={formData.submission_type || ""}
                  onValueChange={(value) => {
                    console.log("Submission type changed to:", value);
                    updateFormData("submission_type", value);
                    // Reset bank selection when submission type changes
                    setSelectedBankId("");
                    setSelectedBankProductId("");
                    setBankProducts([]);
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis aplikasi KUR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PMI">
                      KUR PMI (Pekerja Migran Indonesia)
                    </SelectItem>
                    <SelectItem value="KUR_PERUMAHAN_PMI">
                      KUR Perumahan PMI
                    </SelectItem>
                    <SelectItem value="RUMAH_SUBSIDI_PMI">
                      Rumah Subsidi PMI
                    </SelectItem>
                    <SelectItem value="KUR_WIRAUSAHA_PMI">
                      KUR Wirausaha PMI
                    </SelectItem>
                    <SelectItem value="PETERNAK_SAPI_PMI">
                      Peternak Sapi PMI
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih jenis aplikasi terlebih dahulu untuk melihat produk bank
                  yang sesuai
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loan_amount">Loan Amount</Label>
                  <Input
                    id="loan_amount"
                    type="number"
                    value={formData.loan_amount || ""}
                    onChange={(e) =>
                      updateFormData(
                        "loan_amount",
                        parseInt(e.target.value) || null,
                      )
                    }
                    placeholder="Enter loan amount"
                  />
                </div>
                <div>
                  <Label htmlFor="tenor_months">Tenor (Months)</Label>
                  <Select
                    value={formData.tenor_months?.toString() || ""}
                    onValueChange={(value) =>
                      updateFormData("tenor_months", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="18">18 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                      <SelectItem value="36">36 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bunga_bank">Bunga Bank (%)</Label>
                  <Input
                    id="bunga_bank"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.bunga_bank || 6}
                    onChange={(e) =>
                      updateFormData(
                        "bunga_bank",
                        parseFloat(e.target.value) || 6,
                      )
                    }
                    placeholder="Bank interest rate"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default: 6% per year
                  </p>
                </div>
                <div>
                  <Label htmlFor="grace_period">Grace Period (Months)</Label>
                  <Select
                    value={formData.grace_period?.toString() || ""}
                    onValueChange={(value) =>
                      updateFormData("grace_period", parseInt(value) || null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grace period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Grace Period</SelectItem>
                      <SelectItem value="1">1 Month</SelectItem>
                      <SelectItem value="2">2 Months</SelectItem>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Period before loan repayment starts
                  </p>
                </div>
              </div>

              {formData.submission_type && (
                <div>
                  <Label htmlFor="bank_selection">Select Bank</Label>
                  <Select
                    value={selectedBankId}
                    onValueChange={(value) => {
                      setSelectedBankId(value);
                      setSelectedBankProductId(""); // Reset product selection when bank changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.name} ({bank.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedBankId && formData.submission_type && (
                <div>
                  <Label htmlFor="bank_product">Select Bank Product</Label>
                  <Select
                    value={selectedBankProductId}
                    onValueChange={setSelectedBankProductId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.type} -{" "}
                          {product.interest_rate}% - Rp{" "}
                          {product.min_amount.toLocaleString()} - Rp{" "}
                          {product.max_amount.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {bankProducts.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tidak ada produk {formData.submission_type} yang tersedia
                      untuk bank ini.
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevTab}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            {currentIndex === tabs.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !formData.submission_type ||
                  !formData.full_name ||
                  !formData.email
                }
                className="bg-[#5680E9] hover:bg-[#5680E9]/90"
              >
                {isSubmitting
                  ? editData
                    ? "Updating..."
                    : "Submitting..."
                  : editData
                    ? "Update Application"
                    : "Submit Application"}
              </Button>
            ) : (
              <Button
                onClick={nextTab}
                className="bg-[#5680E9] hover:bg-[#5680E9]/90"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
