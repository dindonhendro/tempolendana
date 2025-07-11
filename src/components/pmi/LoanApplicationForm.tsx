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
import { Upload, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type LoanApplicationInsert =
  Database["public"]["Tables"]["loan_applications"]["Insert"];

interface LoanApplicationFormProps {
  onSubmit?: (data: LoanApplicationInsert) => void;
  editData?: Tables<"loan_applications"> | null;
}

export default function LoanApplicationForm({
  onSubmit,
  editData,
}: LoanApplicationFormProps = {}) {
  const [currentTab, setCurrentTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentCompanies, setAgentCompanies] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{
    ktp: "idle" | "uploading" | "success" | "error";
    selfie: "idle" | "uploading" | "success" | "error";
  }>({ ktp: "idle", selfie: "idle" });

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
          assigned_agent_id: editData.assigned_agent_id || "",
          status: editData.status || "Submitted",
          submission_type: editData.submission_type || "PMI",
        }
      : {
          full_name: "John Doe",
          gender: "Male",
          age: 25,
          birth_place: "Jakarta",
          birth_date: "1999-01-01",
          phone_number: "081234567890",
          email: "john.doe@example.com",
          nik_ktp: "1234567890123456",
          last_education: "SMA",
          nomor_sisko: "PMI123456789",
          address_ktp: "Jl. Contoh No. 123, Jakarta",
          address_domicile: "Jl. Contoh No. 123, Jakarta",
          nama_ibu_kandung: "Jane Doe",
          institution: "PT. Contoh Perusahaan",
          major: "General Worker",
          work_experience: "2 years",
          work_location: "Singapore",
          nama_pemberi_kerja: "ABC Company",
          telp_pemberi_kerja: "65-12345678",
          tanggal_keberangkatan: "2024-06-01",
          alamat_pemberi_kerja: "123 Main Street, Singapore",
          loan_amount: 50000000,
          tenor_months: 12,
          status: "Submitted",
          submission_type: "PMI",
        },
  );

  const [files, setFiles] = useState<{
    ktp: File | null;
    selfie: File | null;
  }>({ ktp: null, selfie: null });

  useEffect(() => {
    loadAgentCompanies();
  }, []);

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

  const updateFormData = (field: keyof LoanApplicationInsert, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (type: "ktp" | "selfie", file: File | null) => {
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
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to submit application.");
        return;
      }

      let ktpUrl = null;
      let selfieUrl = null;

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

      // Prepare final data
      const finalData: LoanApplicationInsert = {
        ...formData,
        user_id: user.id,
        ktp_photo_url: ktpUrl,
        self_photo_url: selfieUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Submit to database (insert or update)
      if (editData) {
        // Update existing application
        const { error } = await supabase
          .from("loan_applications")
          .update({
            ...finalData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editData.id);

        if (error) {
          console.error("Database error:", error);
          alert(`Failed to update application: ${error.message}`);
          return;
        }

        alert("Application updated successfully!");
      } else {
        // Insert new application
        const { error } = await supabase
          .from("loan_applications")
          .insert([finalData]);

        if (error) {
          console.error("Database error:", error);
          alert(`Failed to submit application: ${error.message}`);
          return;
        }

        alert("Application submitted successfully!");
      }

      if (onSubmit) onSubmit(finalData);
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        "An error occurred while submitting your application. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setUploadStatus({ ktp: "idle", selfie: "idle" });
    }
  };

  const tabs = ["personal", "documents", "agent", "family", "work", "loan"];
  const currentIndex = tabs.indexOf(currentTab);

  const nextTab = () => {
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="agent">Agent</TabsTrigger>
              <TabsTrigger value="family">Family</TabsTrigger>
              <TabsTrigger value="work">Work</TabsTrigger>
              <TabsTrigger value="loan">Loan</TabsTrigger>
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

            <TabsContent value="agent" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="assigned_agent">Select Agent (P3MI)</Label>
                <Select
                  value={formData.assigned_agent_id || ""}
                  onValueChange={(value) =>
                    updateFormData("assigned_agent_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent company" />
                  </SelectTrigger>
                  <SelectContent>
                    {agentCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} ({company.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              </div>

              <div>
                <Label htmlFor="bank_product">
                  Bank Product (Preview Only)
                </Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Available bank products will be shown here" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bni-kur">
                      BNI - KUR Mikro (2.5% - Rp 50,000,000)
                    </SelectItem>
                    <SelectItem value="mandiri-kur">
                      Mandiri - KUR Kecil (3.0% - Rp 100,000,000)
                    </SelectItem>
                    <SelectItem value="bri-kur">
                      BRI - KUR TKI (2.8% - Rp 75,000,000)
                    </SelectItem>
                    <SelectItem value="btn-kpr">
                      BTN - KPR Subsidi (5.0% - Rp 200,000,000)
                    </SelectItem>
                    <SelectItem value="nano-mikro">
                      Bank Nano - Kredit Mikro (4.5% - Rp 25,000,000)
                    </SelectItem>
                    <SelectItem value="bpr-umkm">
                      BPR - Kredit UMKM (6.0% - Rp 150,000,000)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Note: This is a preview of available bank products. Final
                  product selection will be done by your assigned agent.
                </p>
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

            {currentIndex === tabs.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
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
