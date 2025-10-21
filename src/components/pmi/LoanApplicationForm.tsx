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
import { Checkbox } from "@/components/ui/checkbox";

type LoanApplicationInsert =
  Database["public"]["Tables"]["loan_applications"]["Insert"];

interface LoanApplicationFormProps {
  onSubmit?: (data: LoanApplicationInsert) => void;
  editData?: Tables<"loan_applications"> | null;
  preSelectedAgentId?: string;
  isWirausaha?: boolean;
}

export default function LoanApplicationForm({
  onSubmit,
  editData,
  preSelectedAgentId,
  isWirausaha = false,
}: LoanApplicationFormProps = {}) {
  // Check if this is a KUR Wirausaha application
  const isKurWirausaha =
    isWirausaha || editData?.submission_type === "KUR_WIRAUSAHA_PMI";
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
  const [selectedProductDescription, setSelectedProductDescription] = useState<string>("");
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
          assigned_agent_id: isKurWirausaha
            ? "e558e9a3-0438-4e8c-b09f-bad255f5d715"
            : editData.assigned_agent_id || preSelectedAgentId || "",
          status: editData.status || "Submitted",
          submission_type: isKurWirausaha ? "KUR_WIRAUSAHA_PMI" : "PMI",
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
          assigned_agent_id: isKurWirausaha
            ? "e558e9a3-0438-4e8c-b09f-bad255f5d715"
            : preSelectedAgentId || "",
          status: "Submitted",
          submission_type: isKurWirausaha ? "KUR_WIRAUSAHA_PMI" : "PMI",
        },
  );

  // Cost component state
  const [costData, setCostData] = useState({
    // Biaya persiapan penempatan
    biaya_pelatihan: 0,
    biaya_sertifikasi: 0,
    biaya_jasa_perusahaan: 0,
    biaya_transportasi_lokal: 0,
    biaya_visa_kerja: 0,
    biaya_tiket_keberangkatan: 0,
    biaya_tiket_pulang: 0,
    biaya_akomodasi: 0,
    // Biaya berkaitan dengan penempatan
    biaya_pemeriksaan_kesehatan: 0,
    biaya_jaminan_sosial: 0,
    biaya_apostille: 0,
    // Biaya lain-lain
    biaya_lain_lain_1: 0,
    biaya_lain_lain_2: 0,
    keterangan_biaya_lain: "",
  });

  const updateCostData = (field: keyof typeof costData, value: any) => {
    setCostData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate total costs
  const calculateTotalCosts = () => {
    const biayaPersiapan = 
      costData.biaya_pelatihan +
      costData.biaya_sertifikasi +
      costData.biaya_jasa_perusahaan +
      costData.biaya_transportasi_lokal +
      costData.biaya_visa_kerja +
      costData.biaya_tiket_keberangkatan +
      costData.biaya_tiket_pulang +
      costData.biaya_akomodasi;

    const biayaPenempatan = 
      costData.biaya_pemeriksaan_kesehatan +
      costData.biaya_jaminan_sosial +
      costData.biaya_apostille;

    const biayaLainLain = 
      costData.biaya_lain_lain_1 +
      costData.biaya_lain_lain_2;

    const totalKeseluruhan = biayaPersiapan + biayaPenempatan + biayaLainLain;

    return {
      biayaPersiapan,
      biayaPenempatan,
      biayaLainLain,
      totalKeseluruhan,
    };
  };

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

  // Consent checkbox state
  const [consentLoanApplication, setConsentLoanApplication] = useState(false);
  const [consentDataSharing, setConsentDataSharing] = useState(false);
  const [consentCreditCheck, setConsentCreditCheck] = useState(false);

  // Prevent session timeout by keeping auth alive
  useEffect(() => {
    const keepAlive = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Refresh the session to prevent timeout
          await supabase.auth.refreshSession();
        }
      } catch (error) {
        console.error("Session refresh error:", error);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(keepAlive);
  }, []);

  useEffect(() => {
    loadAgentCompanies();
    loadBanks();
    
    // Load cost component data if editing
    if (editData?.id) {
      loadCostComponentData(editData.id);
    }
  }, [editData?.id]);

  // Add useEffect to load bank products when bank or submission type changes
  useEffect(() => {
    if (selectedBankId && (formData.submission_type || isKurWirausaha)) {
      const submissionType = isKurWirausaha ? "KUR_WIRAUSAHA_PMI" : formData.submission_type;
      console.log("Loading bank products for:", { selectedBankId, submissionType });
      loadBankProducts(selectedBankId, submissionType);
    } else {
      setBankProducts([]);
    }
  }, [selectedBankId, formData.submission_type, isKurWirausaha]);

  // Add function to load cost component data
  const loadCostComponentData = async (loanApplicationId: string) => {
    try {
      console.log("Loading cost component data for application:", loanApplicationId);
      const { data, error } = await supabase
        .from("komponen_biaya")
        .select("*")
        .eq("loan_application_id", loanApplicationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No cost component data found - this is normal for older applications
          console.log("No cost component data found for this application");
          return;
        }
        console.error("Error loading cost component data:", error);
        return;
      }

      if (data) {
        console.log("Cost component data loaded:", data);
        setCostData({
          biaya_pelatihan: data.biaya_pelatihan || 0,
          biaya_sertifikasi: data.biaya_sertifikasi || 0,
          biaya_jasa_perusahaan: data.biaya_jasa_perusahaan || 0,
          biaya_transportasi_lokal: data.biaya_transportasi_lokal || 0,
          biaya_visa_kerja: data.biaya_visa_kerja || 0,
          biaya_tiket_keberangkatan: data.biaya_tiket_keberangkatan || 0,
          biaya_tiket_pulang: data.biaya_tiket_pulang || 0,
          biaya_akomodasi: data.biaya_akomodasi || 0,
          biaya_pemeriksaan_kesehatan: data.biaya_pemeriksaan_kesehatan || 0,
          biaya_jaminan_sosial: data.biaya_jaminan_sosial || 0,
          biaya_apostille: data.biaya_apostille || 0,
          biaya_lain_lain_1: data.biaya_lain_lain_1 || 0,
          biaya_lain_lain_2: data.biaya_lain_lain_2 || 0,
          keterangan_biaya_lain: data.keterangan_biaya_lain || "",
        });
      }
    } catch (error) {
      console.error("Error loading cost component data:", error);
    }
  };

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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Fix the input change handler to work with both direct calls and event objects
  const handleInputChangeEvent = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    
    // Handle different input types
    if (type === 'number') {
      processedValue = value === '' ? null : (type === 'number' ? parseFloat(value) : parseInt(value));
    } else if (type === 'date') {
      processedValue = value || null;
    }
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
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

      // Validate consent checkboxes
      if (!consentLoanApplication) {
        alert("Anda harus menyetujui persetujuan pengajuan pinjaman untuk melanjutkan");
        return;
      }

      if (!consentDataSharing) {
        alert("Anda harus menyetujui pembagian data dengan bank mitra untuk melanjutkan");
        return;
      }

      if (!consentCreditCheck) {
        alert("Anda harus menyetujui pemeriksaan riwayat kredit untuk melanjutkan");
        return;
      }

      // Validate required fields
      if (!formData.submission_type) {
        alert("Please select application type (Jenis Aplikasi KUR)");
        return;
      }

      if (!formData.full_name) {
        alert("Please enter your full name");
        return;
      }

      if (!formData.email) {
        alert("Please enter your email");
        return;
      }

      // Get user's IP address
      let userIpAddress = null;
      try {
        console.log("Attempting to capture user IP address...");
        
        // Try multiple IP services for better reliability
        const ipServices = [
          'https://api.ipify.org?format=json',
          'https://ipapi.co/json/',
          'https://api.ip.sb/jsonip'
        ];
        
        for (const service of ipServices) {
          try {
            const ipResponse = await fetch(service, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              timeout: 5000 // 5 second timeout
            });
            
            if (ipResponse.ok) {
              const ipData = await ipResponse.json();
              userIpAddress = ipData.ip || ipData.query || ipData.ip_addr;
              
              if (userIpAddress) {
                console.log("User IP address captured successfully:", userIpAddress);
                break; // Exit loop if we got an IP
              }
            }
          } catch (serviceError) {
            console.warn(`Failed to get IP from ${service}:`, serviceError);
            continue; // Try next service
          }
        }
        
        // Fallback: try to get IP from browser if available
        if (!userIpAddress) {
          try {
            // This is a fallback that might work in some environments
            const rtcResponse = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
            const rtcText = await rtcResponse.text();
            const ipMatch = rtcText.match(/ip=([^\n]+)/);
            if (ipMatch) {
              userIpAddress = ipMatch[1];
              console.log("IP captured from Cloudflare trace:", userIpAddress);
            }
          } catch (rtcError) {
            console.warn("Cloudflare trace IP capture failed:", rtcError);
          }
        }
        
        // Final fallback - use a placeholder IP if all methods fail
        if (!userIpAddress) {
          userIpAddress = "0.0.0.0"; // Placeholder IP
          console.warn("Could not capture real IP address, using placeholder");
        }
        
      } catch (ipError) {
        console.warn("All IP capture methods failed:", ipError);
        userIpAddress = "0.0.0.0"; // Fallback IP
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
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

      // Prepare final data with proper date handling and IP address
      const finalData: LoanApplicationInsert = {
        ...formData,
        ...documentUrls,
        user_id: user.id,
        ktp_photo_url: ktpUrl,
        self_photo_url: selfieUrl,
        ip_address: userIpAddress, // Ensure IP address is included
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // For KUR Wirausaha, bypass agent and set special agent ID or null
        assigned_agent_id: isKurWirausaha
          ? "e558e9a3-0438-4e8c-b09f-bad255f5d715"
          : formData.assigned_agent_id,
        // Set submission type if not already set
        submission_type:
          formData.submission_type ||
          (isKurWirausaha ? "KUR_WIRAUSAHA_PMI" : "PMI"),
        // Convert empty date strings to null
        birth_date: formData.birth_date || null,
        tanggal_keberangkatan: formData.tanggal_keberangkatan || null,
      };

      console.log("Final data to be submitted:", {
        submission_type: finalData.submission_type,
        full_name: finalData.full_name,
        email: finalData.email,
        user_id: finalData.user_id,
        ip_address: finalData.ip_address, // Log IP address specifically
        loan_amount: finalData.loan_amount,
        tenor_months: finalData.tenor_months,
        status: finalData.status,
        assigned_agent_id: finalData.assigned_agent_id,
        ktp_photo_url: ktpUrl ? "[FILE_UPLOADED]" : null,
        self_photo_url: selfieUrl ? "[FILE_UPLOADED]" : null,
        document_count: Object.keys(documentUrls).length,
      });

      // Validate that IP address is present before submission
      if (!finalData.ip_address) {
        console.warn("IP address is missing from final data, setting fallback");
        finalData.ip_address = "0.0.0.0";
      }

      console.log("IP address validation - Final IP:", finalData.ip_address);

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

        // Update or insert komponen_biaya data
        if (calculateTotalCosts().totalKeseluruhan > 0) {
          const { error: costError } = await supabase
            .from("komponen_biaya")
            .upsert({
              loan_application_id: editData.id,
              user_id: user.id,
              ...costData,
              updated_at: new Date().toISOString(),
            });

          if (costError) {
            console.error("Error updating cost components:", costError);
            // Don't fail the whole submission for cost component errors
          } else {
            console.log("Cost components updated successfully");
          }
        }

        console.log("Application updated successfully:", updateResult);
        alert(`Application updated successfully! Transaction ID: ${updateResult[0]?.transaction_id || 'N/A'}`);
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

        const newApplicationId = insertResult[0]?.id;
        const transactionId = insertResult[0]?.transaction_id;
        console.log("Application inserted successfully:", insertResult);

        // Insert komponen_biaya data if there are cost components
        if (newApplicationId && calculateTotalCosts().totalKeseluruhan > 0) {
          console.log("Inserting cost components...");
          const { error: costError } = await supabase
            .from("komponen_biaya")
            .insert([{
              loan_application_id: newApplicationId,
              user_id: user.id,
              ...costData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }]);

          if (costError) {
            console.error("Error inserting cost components:", costError);
            // Don't fail the whole submission for cost component errors
            alert(`Application submitted successfully with Transaction ID: ${transactionId}, but there was an issue saving cost components: ${costError.message}`);
          } else {
            console.log("Cost components inserted successfully");
          }
        }

        // Show success message with transaction ID
        alert(
          `${formData.submission_type} application submitted successfully!\n\nTransaction ID: ${transactionId}\nApplication ID: ${insertResult[0]?.id?.substring(0, 8)}...\n\nPlease save your Transaction ID for tracking purposes.`,
        );
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

  // Define tabs based on whether this is KUR Wirausaha or not
  const tabs = isKurWirausaha
    ? ["personal", "documents", "loan"] // Simplified 3-step flow for KUR Wirausaha
    : [
        "personal",
        "documents", 
        "agent",
        "komponen-biaya", // Moved before loan
        "loan",
        "document-other",
        "work", // Removed "family" step
        "installment",
        "summary",
      ];
  const currentIndex = tabs.indexOf(currentTab);

  const validateCurrentTab = () => {
    const missingFields: string[] = [];

    if (currentTab === "personal") {
      if (!formData.full_name) missingFields.push("Full Name");
      if (!formData.gender) missingFields.push("Gender");
      if (!formData.age) missingFields.push("Age");
      if (!formData.birth_place) missingFields.push("Birth Place");
      if (!formData.birth_date) missingFields.push("Birth Date");
      if (!formData.phone_number) missingFields.push("Phone Number");
      if (!formData.email) missingFields.push("Email");
      if (!formData.nik_ktp) missingFields.push("NIK KTP");
      if (!formData.last_education) missingFields.push("Last Education");
      if (!formData.nomor_sisko) missingFields.push("Nomor Sisko PMI");
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
        `Please fill in the following mandatory fields:\n\n${missingFields.join("\n")}`,
      );
      return false;
    }

    return true;
  };

  const nextTab = () => {
    // Validate current tab before proceeding
    if (!validateCurrentTab()) {
      return;
    }

    // For KUR Wirausaha, simplified 3-step flow
    if (isKurWirausaha) {
      if (currentIndex < tabs.length - 1) {
        setCurrentTab(tabs[currentIndex + 1]);
      } else {
        // On the last tab (loan), submit directly
        handleSubmit();
      }
      return;
    }

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
            {isKurWirausaha
              ? "Formulir KUR Wirausaha PMI"
              : editData
                ? "Edit PMI Loan Application"
                : "PMI Loan Application Form"}
          </CardTitle>
          {isKurWirausaha && (
            <p className="text-center text-gray-600 mt-2">
              Proses sederhana 3 langkah untuk mengajukan KUR Wirausaha PMI
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {tabs.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium cursor-pointer transition-colors hover:bg-blue-500 hover:text-white ${
                      index + 1 === currentIndex + 1
                        ? "bg-blue-600 text-white"
                        : index + 1 < currentIndex + 1
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                    onClick={() => setCurrentTab(tabs[index])}
                    title={`Go to step ${index + 1}: ${step}`}
                  >
                    {index + 1}
                  </div>
                  <div 
                    className="ml-2 text-xs sm:text-sm font-medium text-gray-700 max-w-[100px] sm:max-w-none cursor-pointer hover:text-blue-600"
                    onClick={() => setCurrentTab(tabs[index])}
                    title={`Go to step ${index + 1}: ${step}`}
                  >
                    {step}
                  </div>
                  {index < tabs.length - 1 && (
                    <div className="w-4 sm:w-8 h-0.5 bg-gray-300 mx-2"></div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Step {currentIndex + 1}: {tabs[currentIndex]}
              </h2>
            </div>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsContent value="personal" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name || ""}
                    onChange={handleInputChangeEvent}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nomor_sisko">ID PMI</Label>
                  <Input
                    id="nomor_sisko"
                    name="nomor_sisko"
                    value={formData.nomor_sisko || ""}
                    onChange={handleInputChangeEvent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleInputChangeEvent}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number || ""}
                    onChange={handleInputChangeEvent}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nik_ktp">NIK KTP *</Label>
                  <Input
                    id="nik_ktp"
                    name="nik_ktp"
                    value={formData.nik_ktp || ""}
                    onChange={handleInputChangeEvent}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="birth_place">Place of Birth *</Label>
                  <Input
                    id="birth_place"
                    name="birth_place"
                    value={formData.birth_place || ""}
                    onChange={handleInputChangeEvent}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date">Date of Birth *</Label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    value={formData.birth_date || ""}
                    onChange={handleInputChangeEvent}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age || ""}
                    onChange={handleInputChangeEvent}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="last_education">Education Level *</Label>
                  <Select
                    value={formData.last_education || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, last_education: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elementary">Elementary</SelectItem>
                      <SelectItem value="junior_high">Junior High</SelectItem>
                      <SelectItem value="senior_high">Senior High</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="bachelor">Bachelor</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="doctorate">Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="address_ktp">Address KTP</Label>
                <Textarea
                  id="address_ktp"
                  name="address_ktp"
                  value={formData.address_ktp || ""}
                  onChange={handleInputChangeEvent}
                  placeholder="Enter your KTP address"
                />
              </div>
              <div>
                <Label htmlFor="address_domicile">Address Domicile</Label>
                <Textarea
                  id="address_domicile"
                  name="address_domicile"
                  value={formData.address_domicile || ""}
                  onChange={handleInputChangeEvent}
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
                          Selected: {files.tabel_angsuran_signed?.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6 mt-6">
              {isKurWirausaha && (
                <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-800 mb-2">
                        KUR Wirausaha PMI
                      </h4>
                      <p className="text-green-700">
                        Aplikasi Anda akan langsung diteruskan ke validator
                        Lendana untuk proses persetujuan. Tidak perlu melalui
                        agent P3MI.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {!isKurWirausaha &&
                formData.assigned_agent_id ===
                  "e558e9a3-0438-4e8c-b09f-bad255f5d715" && (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            !
                          </span>
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
              {/* Authentication Status */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-800 mb-2">
                      Status Login
                    </h4>
                    <p className="text-green-700">
                      Anda sudah login dan siap untuk submit aplikasi{" "}
                      {formData.submission_type || "KUR"}.
                    </p>
                  </div>
                </div>
              </div>

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
                        {isKurWirausaha
                          ? "KUR Wirausaha PMI"
                          : formData.submission_type || "-"}
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

                <div className="mt-6 p-4 bg-blue-50 rounded border">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Please review all information
                    carefully before submitting. Once submitted, your
                    application will be{" "}
                    {isKurWirausaha
                      ? "sent directly to our validation team for review"
                      : "processed by our validation team"}
                    .
                  </p>
                </div>
              </div>

              {/* Consent Checkboxes - Add before submit button */}
              <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  Persetujuan dan Consent Pengajuan Pinjaman
                </h3>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent-loan-application"
                    checked={consentLoanApplication}
                    onCheckedChange={(checked) => setConsentLoanApplication(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="consent-loan-application"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Persetujuan Pengajuan Pinjaman KUR PMI *
                    </label>
                    <p className="text-xs text-blue-700">
                      Saya dengan ini mengajukan pinjaman KUR PMI dan menyatakan bahwa semua informasi 
                      yang saya berikan adalah benar dan akurat. Saya memahami bahwa informasi palsu 
                      dapat mengakibatkan penolakan aplikasi atau tindakan hukum.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent-data-sharing"
                    checked={consentDataSharing}
                    onCheckedChange={(checked) => setConsentDataSharing(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="consent-data-sharing"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Persetujuan Pembagian Data dengan Bank Mitra *
                    </label>
                    <p className="text-xs text-blue-700">
                      Saya menyetujui PT. Lendana Digitalindo Nusantara untuk membagikan data aplikasi 
                      pinjaman saya kepada bank mitra (BNI, Mandiri, BRI, BTN, Bank Nano, BPR) untuk 
                      keperluan evaluasi dan persetujuan pinjaman.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent-credit-check"
                    checked={consentCreditCheck}
                    onCheckedChange={(checked) => setConsentCreditCheck(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="consent-credit-check"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Persetujuan Pemeriksaan Riwayat Kredit (SLIK/BI Checking) *
                    </label>
                    <p className="text-xs text-blue-700">
                      Saya memberikan izin kepada bank mitra untuk melakukan pemeriksaan riwayat kredit 
                      saya melalui Sistem Layanan Informasi Keuangan (SLIK) Bank Indonesia atau sistem 
                      serupa untuk keperluan evaluasi kelayakan kredit.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-blue-600 mt-4 p-3 bg-white rounded border">
                  <p className="font-medium mb-2">Informasi Penting:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Semua persetujuan di atas wajib disetujui untuk melanjutkan pengajuan pinjaman</li>
                    <li>Data Anda akan diproses sesuai dengan Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi</li>
                    <li>Lendana terdaftar dan diawasi oleh Otoritas Jasa Keuangan (OJK) sebagai Platform Agregator Teknologi Finansial</li>
                    <li>Anda dapat mencabut persetujuan ini kapan saja dengan menghubungi customer service kami</li>
                  </ul>
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

            <TabsContent value="work" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nama_pemberi_kerja">Nama Pemberi Kerja</Label>
                  <Input
                    id="nama_pemberi_kerja"
                    name="nama_pemberi_kerja"
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
                    name="telp_pemberi_kerja"
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
                    name="institution"
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
                    name="major"
                    value={formData.major || ""}
                    onChange={(e) => updateFormData("major", e.target.value)}
                    placeholder="Enter your major/field"
                  />
                </div>
                <div>
                  <Label htmlFor="work_experience">Work Experience</Label>
                  <Input
                    id="work_experience"
                    name="work_experience"
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
                    name="work_location"
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
                    name="tanggal_keberangkatan"
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
                  name="alamat_pemberi_kerja"
                  value={formData.alamat_pemberi_kerja || ""}
                  onChange={(e) =>
                    updateFormData("alamat_pemberi_kerja", e.target.value)
                  }
                  placeholder="Enter employer address"
                />
              </div>
            </TabsContent>

            <TabsContent value="loan" className="space-y-4 mt-6">
              {isKurWirausaha && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    KUR Wirausaha PMI - Langkah Terakhir
                  </h3>
                  <p className="text-green-700">
                    Lengkapi data pinjaman usaha Anda. Setelah submit, aplikasi
                    akan langsung diteruskan ke validator Lendana untuk proses
                    persetujuan.
                  </p>
                </div>
              )}

              {/* Show total cost from komponen biaya if available */}
              {!isKurWirausaha && calculateTotalCosts().totalKeseluruhan > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Estimasi Biaya dari Komponen Biaya
                  </h3>
                  <p className="text-blue-700 mb-2">
                    Total estimasi biaya PMI: <strong>Rp {calculateTotalCosts().totalKeseluruhan.toLocaleString("id-ID")}</strong>
                  </p>
                  <p className="text-sm text-blue-600">
                    Jumlah pinjaman telah diisi otomatis berdasarkan total estimasi biaya. Anda dapat menyesuaikan jika diperlukan.
                  </p>
                </div>
              )}

              {/* Add button to auto-fill loan amount from cost calculation */}
              {!isKurWirausaha && calculateTotalCosts().totalKeseluruhan > 0 && (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateFormData("loan_amount", calculateTotalCosts().totalKeseluruhan)}
                    className="text-sm"
                  >
                    Gunakan Total Estimasi Biaya (Rp {calculateTotalCosts().totalKeseluruhan.toLocaleString("id-ID")})
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="submission_type">Jenis Aplikasi KUR *</Label>
                {isKurWirausaha ? (
                  <div>
                    <Input
                      value="KUR Wirausaha PMI"
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Aplikasi khusus untuk KUR Wirausaha PMI
                    </p>
                  </div>
                ) : (
                  <>
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
                      Pilih jenis aplikasi terlebih dahulu untuk melihat produk
                      bank yang sesuai
                    </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loan_amount">Loan Amount *</Label>
                  <Input
                    id="loan_amount"
                    name="loan_amount"
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
                  {!isKurWirausaha && calculateTotalCosts().totalKeseluruhan > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Otomatis diisi dari total estimasi biaya: Rp {calculateTotalCosts().totalKeseluruhan.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="tenor_months">Tenor (Months) *</Label>
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
                    name="bunga_bank"
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
                  <Label htmlFor="grace_period">Grace Period (Months) *</Label>
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

              {(formData.submission_type || isKurWirausaha) && (
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

              {selectedBankId &&
                (formData.submission_type || isKurWirausaha) && (
                  <div>
                    <Label htmlFor="bank_product">Select Bank Product</Label>
                    <Select
                      value={selectedBankProductId}
                      onValueChange={(value) => {
                        setSelectedBankProductId(value);
                        // Find and set the product description
                        const selectedProduct = bankProducts.find(p => p.id === value);
                        setSelectedProductDescription(selectedProduct?.product_description || "");
                      }}
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
                        Tidak ada produk{" "}
                        {isKurWirausaha
                          ? "KUR_WIRAUSAHA_PMI"
                          : formData.submission_type}{" "}
                        yang tersedia untuk bank ini.
                      </p>
                    )}
                    
                    {/* Product Description Display */}
                    {selectedProductDescription && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">Deskripsi Produk</h4>
                        <p className="text-sm text-blue-700 whitespace-pre-wrap">
                          {selectedProductDescription}
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </TabsContent>

            <TabsContent value="komponen-biaya" className="space-y-6 mt-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Komponen Biaya PMI
                </h3>
                <p className="text-blue-700">
                  Silakan isi estimasi biaya-biaya yang diperlukan untuk penempatan PMI. 
                  Informasi ini akan membantu dalam perhitungan kebutuhan pinjaman.
                </p>
              </div>

              {/* Biaya Persiapan Penempatan */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="text-lg font-semibold text-[#5680E9] mb-4">
                  1. Biaya Persiapan Penempatan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="biaya_pelatihan">a. Pelatihan</Label>
                    <Input
                      id="biaya_pelatihan"
                      name="biaya_pelatihan"
                      type="number"
                      value={costData.biaya_pelatihan || ""}
                      onChange={(e) => updateCostData("biaya_pelatihan", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya pelatihan"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="biaya_sertifikasi">b. Sertifikasi Kompetensi</Label>
                    <Input
                      id="biaya_sertifikasi"
                      name="biaya_sertifikasi"
                      type="number"
                      value={costData.biaya_sertifikasi || ""}
                      onChange={(e) => updateCostData("biaya_sertifikasi", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya sertifikasi"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="biaya_jasa_perusahaan">c. Jasa Perusahaan</Label>
                    <Input
                      id="biaya_jasa_perusahaan"
                      name="biaya_jasa_perusahaan"
                      type="number"
                      value={costData.biaya_jasa_perusahaan || ""}
                      onChange={(e) => updateCostData("biaya_jasa_perusahaan", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya jasa perusahaan"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="biaya_transportasi_lokal">d. Transportasi Lokal dari Daerah Asal ke Tempat Keberangkatan di Indonesia</Label>
                    <Input
                      id="biaya_transportasi_lokal"
                      name="biaya_transportasi_lokal"
                      type="number"
                      value={costData.biaya_transportasi_lokal || ""}
                      onChange={(e) => updateCostData("biaya_transportasi_lokal", parseInt(e.target.value) || 0)}
                      placeholder="Dari daerah asal ke tempat keberangkatan"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="biaya_visa_kerja">e. Visa Kerja</Label>
                    <Input
                      id="biaya_visa_kerja"
                      name="biaya_visa_kerja"
                      type="number"
                      value={costData.biaya_visa_kerja || ""}
                      onChange={(e) => updateCostData("biaya_visa_kerja", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya visa kerja"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="biaya_tiket_keberangkatan">f. Tiket Keberangkatan</Label>
                    <Input
                      id="biaya_tiket_keberangkatan"
                      name="biaya_tiket_keberangkatan"
                      type="number"
                      value={costData.biaya_tiket_keberangkatan || ""}
                      onChange={(e) => updateCostData("biaya_tiket_keberangkatan", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya tiket keberangkatan"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="biaya_tiket_pulang">g. Tiket Pulang</Label>
                    <Input
                      id="biaya_tiket_pulang"
                      name="biaya_tiket_pulang"
                      type="number"
                      value={costData.biaya_tiket_pulang || ""}
                      onChange={(e) => updateCostData("biaya_tiket_pulang", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya tiket pulang"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="biaya_akomodasi">h. Akomodasi</Label>
                    <Input
                      id="biaya_akomodasi"
                      name="biaya_akomodasi"
                      type="number"
                      value={costData.biaya_akomodasi || ""}
                      onChange={(e) => updateCostData("biaya_akomodasi", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya akomodasi"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Biaya Berkaitan dengan Penempatan */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="text-lg font-semibold text-[#5680E9] mb-4">
                  2. Biaya Berkaitan dengan Penempatan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="biaya_pemeriksaan_kesehatan">a. Pemeriksaan Kesehatan dan Psikologi</Label>
                    <Input
                      id="biaya_pemeriksaan_kesehatan"
                      name="biaya_pemeriksaan_kesehatan"
                      type="number"
                      value={costData.biaya_pemeriksaan_kesehatan || ""}
                      onChange={(e) => updateCostData("biaya_pemeriksaan_kesehatan", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya pemeriksaan kesehatan"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="biaya_jaminan_sosial">b. Jaminan Sosial Pekerja Migran Indonesia</Label>
                    <Input
                      id="biaya_jaminan_sosial"
                      name="biaya_jaminan_sosial"
                      type="number"
                      value={costData.biaya_jaminan_sosial || ""}
                      onChange={(e) => updateCostData("biaya_jaminan_sosial", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya jaminan sosial"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="biaya_apostille">c. Apostille</Label>
                    <Input
                      id="biaya_apostille"
                      name="biaya_apostille"
                      type="number"
                      value={costData.biaya_apostille || ""}
                      onChange={(e) => updateCostData("biaya_apostille", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya apostille"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Biaya Lain-lain */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="text-lg font-semibold text-[#5680E9] mb-4">
                  3. Biaya Lain-lain
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="biaya_lain_lain_1">Biaya Lain-lain 1</Label>
                    <Input
                      id="biaya_lain_lain_1"
                      name="biaya_lain_lain_1"
                      type="number"
                      value={costData.biaya_lain_lain_1 || ""}
                      onChange={(e) => updateCostData("biaya_lain_lain_1", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya lain-lain"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="biaya_lain_lain_2">Biaya Lain-lain 2</Label>
                    <Input
                      id="biaya_lain_lain_2"
                      name="biaya_lain_lain_2"
                      type="number"
                      value={costData.biaya_lain_lain_2 || ""}
                      onChange={(e) => updateCostData("biaya_lain_lain_2", parseInt(e.target.value) || 0)}
                      placeholder="Masukkan biaya lain-lain"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="keterangan_biaya_lain">Keterangan Biaya Lain-lain</Label>
                    <Textarea
                      id="keterangan_biaya_lain"
                      name="keterangan_biaya_lain"
                      value={costData.keterangan_biaya_lain}
                      onChange={(e) => updateCostData("keterangan_biaya_lain", e.target.value)}
                      placeholder="Jelaskan detail biaya lain-lain jika ada"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Total Estimasi Biaya */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-4">
                  Total Estimasi Biaya
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-green-600 mb-1">Biaya Persiapan Penempatan</p>
                    <p className="text-xl font-bold text-green-800">
                      Rp {calculateTotalCosts().biayaPersiapan.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600 mb-1">Biaya Penempatan</p>
                    <p className="text-xl font-bold text-green-800">
                      Rp {calculateTotalCosts().biayaPenempatan.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600 mb-1">Biaya Lain-lain</p>
                    <p className="text-xl font-bold text-green-800">
                      Rp {calculateTotalCosts().biayaLainLain.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-600 mb-1">Total Keseluruhan</p>
                    <p className="text-2xl font-bold text-green-800">
                      Rp {calculateTotalCosts().totalKeseluruhan.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white rounded border">
                  <p className="text-sm text-gray-600">
                    <strong>Catatan:</strong> Total estimasi biaya ini akan membantu dalam menentukan 
                    jumlah pinjaman yang dibutuhkan. Pastikan semua komponen biaya telah diisi dengan akurat.
                  </p>
                  {calculateTotalCosts().totalKeseluruhan > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                      <strong>Saran:</strong> Pertimbangkan untuk mengajukan pinjaman sebesar 
                      Rp {calculateTotalCosts().totalKeseluruhan.toLocaleString("id-ID")} 
                      atau lebih untuk menutupi seluruh biaya penempatan PMI.
                    </p>
                  )}
                </div>
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

            {isKurWirausaha ? (
              <Button
                onClick={nextTab}
                disabled={
                  isSubmitting ||
                  !formData.full_name ||
                  !formData.email ||
                  (currentTab === "loan" &&
                    (!formData.loan_amount || !formData.tenor_months)) ||
                  (currentTab === "summary" && 
                    (!consentLoanApplication || !consentDataSharing || !consentCreditCheck))
                }
                className="bg-[#5680E9] hover:bg-[#5680E9]/90"
              >
                {currentIndex === tabs.length - 1
                  ? isSubmitting
                    ? "Submitting..."
                    : "Submit KUR Wirausaha Application"
                  : "Next"}
              </Button>
            ) : currentIndex === tabs.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !formData.submission_type ||
                  !formData.full_name ||
                  !formData.email ||
                  !consentLoanApplication ||
                  !consentDataSharing ||
                  !consentCreditCheck
                }
                className="bg-[#5680E9] hover:bg-[#5680E9]/90"
              >
                {isSubmitting
                  ? editData
                    ? "Updating..."
                    : "Submitting..."
                  : editData
                    ? "Update Application"
                    : `Submit ${formData.submission_type || "Application"}`}
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