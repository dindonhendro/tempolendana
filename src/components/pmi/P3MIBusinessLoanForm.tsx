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
import { Upload, CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database, Tables } from "@/types/supabase";

type LoanApplicationInsert =
  Database["public"]["Tables"]["loan_applications"]["Insert"];

interface P3MIBusinessLoanFormProps {
  editData?: Tables<"loan_applications"> | null;
  onSubmit?: () => void;
}

export default function P3MIBusinessLoanForm({
  editData,
  onSubmit,
}: P3MIBusinessLoanFormProps = {}) {
  const [currentTab, setCurrentTab] = useState("company");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banks, setBanks] = useState<Tables<"banks">[]>([]);
  const [bankProducts, setBankProducts] = useState<Tables<"bank_products">[]>(
    [],
  );
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [selectedBankProductId, setSelectedBankProductId] =
    useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: "idle" | "uploading" | "success" | "error";
  }>({});

  // Form data state
  const [formData, setFormData] = useState<LoanApplicationInsert>(
    editData
      ? {
        full_name: editData.full_name || "",
        email: editData.email || "",
        phone_number: editData.phone_number || "",
        nik_ktp: editData.nik_ktp || "",
        address_ktp: editData.address_ktp || "",
        address_domicile: editData.address_domicile || "",
        institution: editData.institution || "", // Company name
        major: editData.major || "", // Business type
        work_experience: editData.work_experience || "", // Years in business
        work_location: editData.work_location || "", // Business location
        loan_amount: editData.loan_amount || null,
        tenor_months: editData.tenor_months || null,
        bunga_bank: editData.bunga_bank || 6,
        grace_period: editData.grace_period || null,
        status: editData.status || "Submitted",
        submission_type: editData.submission_type || "P3MI_BUSINESS_LOAN",
        assigned_agent_id: editData.assigned_agent_id || "e558e9a3-0438-4e8c-b09f-bad255f5d715",
      }
      : {
        full_name: "",
        email: "",
        phone_number: "",
        nik_ktp: "",
        address_ktp: "",
        address_domicile: "",
        institution: "", // Company name
        major: "", // Business type
        work_experience: "", // Years in business
        work_location: "", // Business location
        loan_amount: null,
        tenor_months: null,
        bunga_bank: 6,
        grace_period: null,
        status: "Submitted",
        submission_type: "P3MI_BUSINESS_LOAN",
        assigned_agent_id: "e558e9a3-0438-4e8c-b09f-bad255f5d715",
      },
  );

  const [files, setFiles] = useState<{
    [key: string]: File | null;
  }>({});

  // Document list for P3MI Business Loan - using existing database columns
  const documentList = [
    {
      key: "surat_permohonan_kredit",
      label: "Surat Permohonan Fasilitas Kredit",
    },
    {
      key: "dokumen_lain_1",
      label: "Surat Persetujuan Komisaris",
    },
    {
      key: "dokumen_lain_2",
      label:
        "Laporan Keuangan Home Statement (Neraca dan Laba Rugi) 2tahun terakhir",
    },
    {
      key: "info_slik_bank",
      label: "Rekening Koran simpanan di Bank 1tahun terakhir",
    },
    {
      key: "dokumen_kartu_keluarga",
      label: "Rincian Pekerjaan selama tahun lalu",
    },
    {
      key: "dokumen_ktp_keluarga_penjamin",
      label: "Rincian Pekerjaan mendatang tahun ini",
    },
    {
      key: "dokumen_paspor",
      label: "Rincian piutang usaha berikut umur piutang",
    },
    {
      key: "dokumen_perjanjian_kerja",
      label: "Rincian hutang usaha berikut umur piutang",
    },
    {
      key: "dokumen_perjanjian_penempatan_pmi",
      label:
        "Daftar nama pelanggan dominan berikut nomor telepon yang bisa dihubungi",
    },
    {
      key: "dokumen_persetujuan_data_privacy",
      label:
        "Daftar nama pemasok / rekanan dominan berikut nomor telepon yang bisa di hubungi",
    },
    {
      key: "dokumen_standing_instruction",
      label: "NIB dan Legalitas perusahaan terbaru",
    },
    {
      key: "dokumen_surat_nikah",
      label: "Akta Pendirian Awal dan Perubahan Akhir",
    },
    { key: "surat_izin_ortu_wali", label: "Bukti bayar PBB Jaminan terbaru" },
    { key: "surat_keterangan_p3mi", label: "Bukti SPT Tahun lalu" },
    {
      key: "surat_pernyataan_ortu_wali",
      label: "Copy Jaminan yang akan diagunkan (SHM)",
    },
    {
      key: "pas_foto_3x4",
      label: "Izin Mendirikan Bangunan (IMB) yang akan diagunkan",
    },
  ];

  useEffect(() => {
    loadBanks();
  }, []);

  useEffect(() => {
    if (selectedBankId) {
      loadBankProducts(selectedBankId);
    } else {
      setBankProducts([]);
      setSelectedBankProductId("");
    }
  }, [selectedBankId]);

  const loadBanks = async () => {
    try {
      const { data } = await supabase.from("banks").select("*").order("name");
      setBanks(data || []);
    } catch (error) {
      console.error("Error loading banks:", error);
      setBanks([]);
    }
  };

  const loadBankProducts = async (bankId: string) => {
    try {
      // Filter only Business Loan products
      const { data } = await supabase
        .from("bank_products")
        .select("*")
        .eq("bank_id", bankId)
        .eq("type", "Business Loan")
        .order("name");
      setBankProducts(data || []);
    } catch (error) {
      console.error("Error loading bank products:", error);
      setBankProducts([]);
    }
  };

  const updateFormData = (field: keyof LoanApplicationInsert, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (type: string, file: File | null) => {
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and PDF files are allowed.");
      return;
    }

    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  const uploadFile = async (
    file: File,
    folder: string,
    userId: string,
  ): Promise<{ url: string | null; error?: string }> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      // Organize files by user ID for better security and management
      const filePath = `${userId}/${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Provide a clearer message for bucket errors
        if (uploadError.message?.includes("Bucket not found")) {
          return { url: null, error: "Cloud storage 'documents' bucket is missing. Please contact administrator (SQL migration needed)." };
        }
        return { url: null, error: uploadError.message };
      }

      const { data } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      return { url: data.publicUrl };
    } catch (error: any) {
      console.error("File upload failed:", error);
      return { url: null, error: error.message || "Unknown error" };
    }
  };

  const handleSubmit = async () => {
    // Prevent modification if already validated
    if (editData && editData.status === "Validated") {
      alert(
        "Gagal memperbaruhi data. Data aplikasi anda saat ini sudah divalidasi dan sedang di proses LJK pemberi pinjaman sehingga tidak dapat diubah lagi.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting P3MI Business Loan form submission...");

      // Validate required fields
      if (!formData.full_name) {
        alert("Please enter company owner name");
        return;
      }

      if (!formData.email) {
        alert("Please enter email address");
        return;
      }

      if (!formData.institution) {
        alert("Please enter company name");
        return;
      }

      if (!formData.loan_amount) {
        alert("Please enter loan amount");
        return;
      }

      if (!formData.tenor_months) {
        alert("Please select tenor");
        return;
      }

      if (
        formData.grace_period === null ||
        formData.grace_period === undefined
      ) {
        alert("Please select grace period");
        return;
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Auth error:", userError);
        alert(
          "Authentication error. Please sign in to continue. Click 'OK' to go to login page.",
        );
        window.location.href = "/auth";
        return;
      }

      if (!user) {
        console.error("No authenticated user found");
        alert(
          "You must be logged in to submit an application. Click 'OK' to go to login page.",
        );
        window.location.href = "/auth";
        return;
      }

      console.log("User authenticated:", user.id);

      const documentUrls: Record<string, string | null> = {};

      // Preserve existing document URLs if editing
      if (editData) {
        documentList.forEach((doc) => {
          const urlKey = `${doc.key}_url`;
          if ((editData as any)[urlKey]) {
            documentUrls[urlKey] = (editData as any)[urlKey];
          }
        });
      }

      // Upload all documents
      for (const doc of documentList) {
        const file = files[doc.key];
        if (file) {
          setUploadStatus((prev) => ({ ...prev, [doc.key]: "uploading" }));
          const result = await uploadFile(file, "p3mi-business-documents", user.id);
          if (!result.url) {
            setUploadStatus((prev) => ({ ...prev, [doc.key]: "error" }));
            alert(`Gagal mengunggah ${doc.label}: ${result.error || ""}. Silakan coba lagi.`);
            return;
          }
          documentUrls[`${doc.key}_url`] = result.url;
          setUploadStatus((prev) => ({ ...prev, [doc.key]: "success" }));
        }
      }

      // Prepare final data
      const finalData: LoanApplicationInsert = {
        ...formData,
        ...documentUrls,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // P3MI Business Loan goes directly to Lendana for verification
        assigned_agent_id: "e558e9a3-0438-4e8c-b09f-bad255f5d715", // Default agent for P3MI Business Loan
        submission_type: "P3MI_BUSINESS_LOAN",
      };

      console.log("Final data to be submitted:", {
        submission_type: finalData.submission_type,
        full_name: finalData.full_name,
        email: finalData.email,
        user_id: finalData.user_id,
        loan_amount: finalData.loan_amount,
        tenor_months: finalData.tenor_months,
        status: finalData.status,
        document_count: Object.keys(documentUrls).length,
      });

      // Submit to database (insert or update)
      if (editData) {
        console.log(
          "Updating existing P3MI Business Loan application:",
          editData.id,
        );
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
          // Check if it's an immutability error
          if (
            error.message.includes("Immutable record") ||
            error.message.includes("validated applications cannot be modified")
          ) {
            alert(
              `Gagal memperbaruhi data. Data aplikasi anda saat ini sedang di proses LJK pemberi pinjaman sehingga tidak dapat diubah lagi.`,
            );
          } else {
            alert(`Gagal memperbarui permohonan: ${error.message}`);
          }
          return;
        }

        console.log(
          "P3MI Business Loan application updated successfully:",
          updateResult,
        );
        alert("Permohonan Pinjaman Usaha P3MI berhasil diperbarui!");
      } else {
        // Insert new application
        const { data: insertResult, error } = await supabase
          .from("loan_applications")
          .insert([finalData])
          .select();

        if (error) {
          console.error("Database insert error:", error);
          let errorMessage = "Failed to submit application: ";
          if (error.code === "23505") {
            errorMessage +=
              "Duplicate entry detected. You may have already submitted this application.";
          } else if (error.code === "23503") {
            errorMessage +=
              "Invalid reference data. Please check your selections.";
          } else {
            errorMessage += error.message || "Unknown database error";
          }
          alert(errorMessage);
          return;
        }

        console.log("Application inserted successfully:", insertResult);
        alert(
          `P3MI Business Loan application submitted successfully! Your application ID: ${insertResult[0]?.id?.substring(0, 8)}... \n\nYour application will be reviewed by Lendana and forwarded to the selected bank branch.`,
        );
      }

      if (onSubmit) {
        onSubmit();
      } else {
        // Redirect to dashboard or home
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(
        `An error occurred while submitting your application: ${error.message || "Unknown error"}. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
      setUploadStatus({});
    }
  };

  const tabs = ["company", "documents", "loan"];
  const currentIndex = tabs.indexOf(currentTab);

  const validateCurrentTab = () => {
    const missingFields: string[] = [];

    if (currentTab === "company") {
      if (!formData.full_name) missingFields.push("Nama Pemilik Usaha");
      if (!formData.email) missingFields.push("Email");
      if (!formData.phone_number) missingFields.push("Nomor Telepon");
      if (!formData.institution) missingFields.push("Nama Perusahaan P3MI");
      if (!formData.major) missingFields.push("Bidang Usaha");
    }

    if (currentTab === "documents") {
      // Check if critical documents are uploaded (just checking first few for now)
      if (!documentUrls.ktp_photo_url && !editData?.ktp_photo_url) missingFields.push("Foto KTP");
      if (!documentUrls.self_photo_url && !editData?.self_photo_url) missingFields.push("Foto Selfie");
    }

    if (currentTab === "loan") {
      if (!formData.loan_amount) missingFields.push("Loan Amount");
      if (!formData.tenor_months) missingFields.push("Tenor (Months)");
      if (
        formData.grace_period === null ||
        formData.grace_period === undefined
      ) {
        missingFields.push("Grace Period (Months)");
      }
    }

    if (missingFields.length > 0) {
      alert(
        `Mohon lengkapi field mandatory berikut:\n\n${missingFields.join("\n")}`,
      );
      return false;
    }

    return true;
  };

  const nextTab = () => {
    // Prevent modification if already validated
    if (editData && editData.status === "Validated") {
      alert(
        "Gagal memperbaruhi data. Data aplikasi anda saat ini sudah divalidasi dan sedang di proses LJK pemberi pinjaman sehingga tidak dapat diubah lagi.",
      );
      return;
    }

    if (!validateCurrentTab()) {
      return;
    }

    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    } else {
      // On the last tab (loan), submit directly
      handleSubmit();
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
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-[#5680E9]">
            {editData
              ? "Edit P3MI Business Loan Application"
              : "Pengembangan Usaha P3MI"}
          </CardTitle>
          <p className="text-center text-gray-600 mt-2">
            {editData
              ? "Edit formulir pinjaman pengembangan usaha P3MI/Agent"
              : "Formulir pinjaman pengembangan usaha untuk P3MI/Agent dengan 3 langkah mudah"}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="company">1. Data Perusahaan P3MI</TabsTrigger>
              <TabsTrigger value="documents">2. Upload 16 File</TabsTrigger>
              <TabsTrigger value="loan">3. Data Pinjaman</TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Data Perusahaan P3MI
                </h3>
                <p className="text-blue-700">
                  Lengkapi data perusahaan P3MI/Agent Anda untuk pengajuan
                  pinjaman pengembangan usaha.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nama Pemilik Usaha *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ""}
                    onChange={(e) =>
                      updateFormData("full_name", e.target.value)
                    }
                    placeholder="Enter company owner name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Nomor Telepon *</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number || ""}
                    onChange={(e) =>
                      updateFormData("phone_number", e.target.value)
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="nik_ktp">NIK KTP</Label>
                  <Input
                    id="nik_ktp"
                    value={formData.nik_ktp || ""}
                    onChange={(e) => updateFormData("nik_ktp", e.target.value)}
                    placeholder="Enter NIK KTP"
                  />
                </div>

                <div>
                  <Label htmlFor="institution">Nama Perusahaan P3MI *</Label>
                  <Input
                    id="institution"
                    value={formData.institution || ""}
                    onChange={(e) =>
                      updateFormData("institution", e.target.value)
                    }
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <Label htmlFor="major">Jenis Usaha *</Label>
                  <Select
                    value={formData.major || ""}
                    onValueChange={(value) => updateFormData("major", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P3MI">
                        P3MI (Penempatan PMI)
                      </SelectItem>
                      <SelectItem value="Agent">Agent PMI</SelectItem>
                      <SelectItem value="Training">
                        Lembaga Pelatihan
                      </SelectItem>
                      <SelectItem value="Recruitment">
                        Recruitment Agency
                      </SelectItem>
                      <SelectItem value="Other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="work_experience">Lama Usaha (Tahun)</Label>
                  <Input
                    id="work_experience"
                    value={formData.work_experience || ""}
                    onChange={(e) =>
                      updateFormData("work_experience", e.target.value)
                    }
                    placeholder="Enter years in business"
                  />
                </div>

                <div>
                  <Label htmlFor="work_location">Lokasi Usaha</Label>
                  <Input
                    id="work_location"
                    value={formData.work_location || ""}
                    onChange={(e) =>
                      updateFormData("work_location", e.target.value)
                    }
                    placeholder="Enter business location"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address_ktp">Alamat KTP</Label>
                <Textarea
                  id="address_ktp"
                  value={formData.address_ktp || ""}
                  onChange={(e) =>
                    updateFormData("address_ktp", e.target.value)
                  }
                  placeholder="Enter KTP address"
                />
              </div>

              <div>
                <Label htmlFor="address_domicile">Alamat Perusahaan</Label>
                <Textarea
                  id="address_domicile"
                  value={formData.address_domicile || ""}
                  onChange={(e) =>
                    updateFormData("address_domicile", e.target.value)
                  }
                  placeholder="Enter company address"
                />
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6 mt-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Upload 16 Dokumen Pendukung
                </h3>
                <p className="text-yellow-700">
                  Silakan upload semua dokumen yang diperlukan untuk pengajuan
                  pinjaman pengembangan usaha P3MI.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documentList.map((doc) => (
                  <div key={doc.key}>
                    <Label>{doc.label}</Label>
                    <div className="mt-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadStatus[doc.key] === "uploading" ? (
                            <div className="text-blue-500">Uploading...</div>
                          ) : uploadStatus[doc.key] === "success" ? (
                            <CheckCircle className="w-8 h-8 text-green-500" />
                          ) : files[doc.key] ? (
                            <CheckCircle className="w-8 h-8 text-green-500" />
                          ) : (
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          )}
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              {files[doc.key] ||
                                (editData && (editData as any)[`${doc.key}_url`])
                                ? "Click to replace"
                                : "Click to upload"}
                            </span>{" "}
                            {doc.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, PDF (MAX. 5MB)
                          </p>
                          {editData &&
                            (editData as any)[`${doc.key}_url`] &&
                            !files[doc.key] && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ File already uploaded
                              </p>
                            )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            handleFileSelect(
                              doc.key,
                              e.target.files?.[0] || null,
                            )
                          }
                        />
                      </label>
                      {files[doc.key] && (
                        <p className="mt-2 text-sm text-green-600">
                          Selected: {files[doc.key]?.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="loan" className="space-y-4 mt-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Data Pinjaman - Langkah Terakhir
                </h3>
                <p className="text-green-700">
                  Lengkapi data pinjaman dan pilih bank. Setelah submit,
                  aplikasi akan diteruskan ke Lendana untuk verifikasi dan
                  kemudian ke cabang bank yang dipilih.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loan_amount">Jumlah Pinjaman *</Label>
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
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tenor_months">Tenor (Bulan) *</Label>
                  <Select
                    value={formData.tenor_months?.toString() || ""}
                    onValueChange={(value) =>
                      updateFormData("tenor_months", parseInt(value))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 Bulan</SelectItem>
                      <SelectItem value="18">18 Bulan</SelectItem>
                      <SelectItem value="24">24 Bulan</SelectItem>
                      <SelectItem value="36">36 Bulan</SelectItem>
                      <SelectItem value="48">48 Bulan</SelectItem>
                      <SelectItem value="60">60 Bulan</SelectItem>
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
                  <Label htmlFor="grace_period">Grace Period (Bulan) *</Label>
                  <Select
                    value={formData.grace_period?.toString() || ""}
                    onValueChange={(value) =>
                      updateFormData("grace_period", parseInt(value) || null)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grace period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Grace Period</SelectItem>
                      <SelectItem value="1">1 Bulan</SelectItem>
                      <SelectItem value="2">2 Bulan</SelectItem>
                      <SelectItem value="3">3 Bulan</SelectItem>
                      <SelectItem value="6">6 Bulan</SelectItem>
                      <SelectItem value="12">12 Bulan</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Period before loan repayment starts
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="bank_selection">Pilih Bank</Label>
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

              {selectedBankId && (
                <div>
                  <Label htmlFor="bank_product">Pilih Produk Bank</Label>
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
                          {product.name} (Business Loan -{" "}
                          {product.interest_rate}% - Rp{" "}
                          {product.min_amount.toLocaleString()} - Rp{" "}
                          {product.max_amount.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {bankProducts.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tidak ada produk Business Loan yang tersedia untuk bank
                      ini.
                    </p>
                  )}
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Informasi Penting
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Hanya produk Business Loan yang ditampilkan</li>
                  <li>
                    • Aplikasi akan diverifikasi oleh Lendana terlebih dahulu
                  </li>
                  <li>
                    • Setelah verifikasi, aplikasi akan diteruskan ke cabang
                    bank
                  </li>
                  <li>
                    • Proses persetujuan tergantung kebijakan masing-masing bank
                  </li>
                </ul>
              </div>
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

            <Button
              onClick={nextTab}
              disabled={isSubmitting}
              className="bg-[#5680E9] hover:bg-[#5680E9]/90"
            >
              {currentIndex === tabs.length - 1
                ? isSubmitting
                  ? editData
                    ? "Updating..."
                    : "Submitting..."
                  : editData
                    ? "Update P3MI Business Loan Application"
                    : "Submit P3MI Business Loan Application"
                : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
