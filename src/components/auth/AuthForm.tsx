import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  signIn,
  signUp,
  getAgentCompanies,
  getBanks,
  getBankBranches,
  getInsuranceCompanies,
  getCollectorCompanies,
} from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AuthFormProps {
  onAuthSuccess?: () => void;
  isWirausaha?: boolean;
}

export default function AuthForm({ onAuthSuccess, isWirausaha = false }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agentCompanyId, setAgentCompanyId] = useState("");
  const [agentCompanies, setAgentCompanies] = useState<any[]>([]);
  const [bankId, setBankId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [banks, setBanks] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [insuranceCompanyId, setInsuranceCompanyId] = useState("");
  const [insuranceCompanies, setInsuranceCompanies] = useState<any[]>([]);
  const [collectorCompanyId, setCollectorCompanyId] = useState("");

  // Consent checkboxes state
  const [consentDataProcessing, setConsentDataProcessing] = useState(false);
  const [consentTermsConditions, setConsentTermsConditions] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  
  // Scroll tracking for privacy policy
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const privacyPolicyRef = React.useRef<HTMLDivElement>(null);

  // Handle scroll event for privacy policy
  const handlePrivacyPolicyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 5;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  // Load agent companies and banks on component mount
  React.useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [companies, banksData, insuranceData, collectorData] =
          await Promise.all([
            getAgentCompanies(),
            getBanks(),
            getInsuranceCompanies(),
            getCollectorCompanies(),
          ]);
        if (isMounted) {
          setAgentCompanies(companies || []);
          setBanks(banksData || []);
          setInsuranceCompanies(insuranceData || []);
          setCollectorCompanies(collectorData || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        if (isMounted) {
          setAgentCompanies([]);
          setBanks([]);
          setInsuranceCompanies([]);
          setCollectorCompanies([]);
        }
      }
    };

    // Load data with timeout fallback
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn("Data loading timeout, setting empty arrays");
        setAgentCompanies([]);
        setBanks([]);
        setInsuranceCompanies([]);
        setCollectorCompanies([]);
      }
    }, 5000); // 5 second timeout

    loadData().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Load branches when bank is selected
  React.useEffect(() => {
    if (bankId) {
      const loadBranches = async () => {
        try {
          const branchesData = await getBankBranches(bankId);
          setBranches(branchesData || []);
        } catch (error) {
          console.error("Error loading branches:", error);
          setBranches([]);
        }
      };
      loadBranches();
    } else {
      setBranches([]);
      setBranchId("");
    }
  }, [bankId]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Add timeout for the entire sign-in process
    const signInTimeout = setTimeout(() => {
      setError("Sign in is taking too long. Please try again.");
      setIsLoading(false);
    }, 15000); // 15 second timeout

    try {
      console.log("Attempting sign in...");
      await signIn(signInEmail, signInPassword);
      
      clearTimeout(signInTimeout);
      setSuccess("Sign in successful! Redirecting...");

      // Immediate redirect without waiting
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          // Force page reload to ensure auth state is updated
          window.location.reload();
        }
      }, 100); // Very short delay
    } catch (error: any) {
      clearTimeout(signInTimeout);
      console.error("Sign in error:", error);
      setError(error.message || "Failed to sign in");
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!role) {
      setError("Please select a role");
      setIsLoading(false);
      return;
    }

    // Validate consent checkbox
    if (!consentTermsConditions) {
      setError("Anda harus menyetujui syarat dan ketentuan serta kebijakan privasi untuk melanjutkan");
      setIsLoading(false);
      return;
    }

    if ((role === "agent" || role === "checker_agent") && !agentCompanyId) {
      setError("Please select an agent company");
      setIsLoading(false);
      return;
    }

    if (role === "bank_staff" && (!bankId || !branchId)) {
      setError("Please select a bank and branch");
      setIsLoading(false);
      return;
    }

    if (role === "insurance" && !insuranceCompanyId) {
      setError("Please select an insurance company");
      setIsLoading(false);
      return;
    }

    if (role === "collector" && !collectorCompanyId) {
      setError("Please select a collector company");
      setIsLoading(false);
      return;
    }

    try {
      await signUp(
        signUpEmail,
        signUpPassword,
        role,
        fullName,
        role === "insurance"
          ? insuranceCompanyId
          : role === "collector"
            ? collectorCompanyId
            : agentCompanyId,
        bankId,
        branchId,
      );
      setSuccess(
        "Account created successfully! Please check your email to verify your account.",
      );
      // Reset form
      setSignUpEmail("");
      setSignUpPassword("");
      setFullName("");
      setRole("");
      setAgentCompanyId("");
      setBankId("");
      setBranchId("");
      setInsuranceCompanyId("");
      setCollectorCompanyId("");
      setConsentDataProcessing(false);
      setConsentTermsConditions(false);
      setConsentMarketing(false);
    } catch (error: any) {
      setError(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = (testEmail: string) => {
    setSignInEmail(testEmail);
    setSignInPassword("123456");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5680E9] to-[#8860D0] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#5680E9]">
            {isWirausaha ? "KUR Wirausaha PMI" : "KUR Penempatan PMI"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#5680E9] hover:bg-[#5680E9]/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={role}
                    onValueChange={(value) => {
                      setRole(value);
                      if (value !== "agent" && value !== "checker_agent") {
                        setAgentCompanyId("");
                      }
                      if (value !== "bank_staff") {
                        setBankId("");
                        setBranchId("");
                      }
                      if (value !== "insurance") {
                        setInsuranceCompanyId("");
                      }
                      if (value !== "collector") {
                        setCollectorCompanyId("");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {isWirausaha ? (
                        <SelectItem value="wirausaha">
                          User Wirausaha PMI
                        </SelectItem>
                      ) : (
                        <>
                          <SelectItem value="user">User (PMI)</SelectItem>
                          <SelectItem value="perusahaan">
                            Perusahaan (P3MI Business)
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {(role === "agent" || role === "checker_agent") &&
                  !isWirausaha && (
                    <div>
                      <Label htmlFor="agent-company">Agent Company *</Label>
                      <Select
                        value={agentCompanyId}
                        onValueChange={setAgentCompanyId}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select agent company" />
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
                  )}

                {role === "bank_staff" && !isWirausaha && (
                  <>
                    <div>
                      <Label htmlFor="bank">Bank</Label>
                      <Select
                        value={bankId}
                        onValueChange={(value) => {
                          setBankId(value);
                          setBranchId(""); // Reset branch when bank changes
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank" />
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

                    {bankId && (
                      <div>
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={branchId} onValueChange={setBranchId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name} - {branch.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {role === "insurance" && !isWirausaha && (
                  <div>
                    <Label htmlFor="insurance-company">
                      Insurance Company *
                    </Label>
                    <Select
                      value={insuranceCompanyId}
                      onValueChange={setInsuranceCompanyId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select insurance company" />
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
                )}

                {role === "collector" && !isWirausaha && (
                  <div>
                    <Label htmlFor="collector-company">
                      Collector Company *
                    </Label>
                    <Select
                      value={collectorCompanyId}
                      onValueChange={setCollectorCompanyId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collector company" />
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
                )}

                {/* Consent Checkboxes */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium text-gray-800">Persetujuan dan Consent</h4>
                  
                  {/* Privacy Policy Text - Scrollable */}
                  <div 
                    ref={privacyPolicyRef}
                    onScroll={handlePrivacyPolicyScroll}
                    className="max-h-48 overflow-y-auto border rounded-lg p-4 bg-white text-xs text-gray-700 space-y-3"
                  >
                    <h5 className="font-semibold text-sm text-gray-900">Kebijakan Privasi PT. Lendana Digitalindo Nusantara</h5>
                    
                    <p>
                      <strong>1. Pengumpulan Data Pribadi</strong><br/>
                      PT. Lendana Digitalindo Nusantara ("Lendana") mengumpulkan data pribadi Anda termasuk namun tidak terbatas pada: 
                      nama lengkap, alamat email, nomor telepon, alamat tempat tinggal, nomor identitas (KTP/Paspor), informasi pekerjaan, 
                      data keuangan, dan dokumen pendukung lainnya yang diperlukan untuk proses pengajuan Kredit Usaha Rakyat (KUR) 
                      untuk Pekerja Migran Indonesia (PMI).
                    </p>

                    <p>
                      <strong>2. Tujuan Penggunaan Data</strong><br/>
                      Data pribadi yang Anda berikan akan digunakan untuk:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Memproses aplikasi KUR PMI Anda</li>
                      <li>Verifikasi identitas dan kelayakan kredit</li>
                      <li>Komunikasi terkait status aplikasi dan layanan</li>
                      <li>Penyaluran kredit melalui bank mitra</li>
                      <li>Koordinasi dengan perusahaan penempatan (P3MI), asuransi, dan pihak terkait</li>
                      <li>Pemenuhan kewajiban hukum dan regulasi</li>
                      <li>Analisis dan peningkatan layanan</li>
                    </ul>

                    <p>
                      <strong>3. Pembagian Data dengan Pihak Ketiga</strong><br/>
                      Lendana dapat membagikan data pribadi Anda kepada:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Bank mitra (BNI, Mandiri, BRI, BTN, Bank Nano, BPR) untuk proses persetujuan kredit</li>
                      <li>Perusahaan Penempatan Pekerja Migran Indonesia (P3MI) yang terdaftar</li>
                      <li>Perusahaan asuransi untuk perlindungan kredit</li>
                      <li>Otoritas Jasa Keuangan (OJK) dan regulator terkait</li>
                      <li>Penyedia layanan teknologi dan infrastruktur yang mendukung platform</li>
                    </ul>

                    <p>
                      <strong>4. Keamanan Data</strong><br/>
                      Lendana menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi data pribadi Anda 
                      dari akses tidak sah, pengungkapan, perubahan, atau penghancuran. Data Anda disimpan dalam sistem yang aman 
                      dengan enkripsi dan kontrol akses yang ketat.
                    </p>

                    <p>
                      <strong>5. Penyimpanan Data</strong><br/>
                      Data pribadi Anda akan disimpan selama diperlukan untuk tujuan yang telah disebutkan atau sesuai dengan 
                      ketentuan peraturan perundang-undangan yang berlaku, termasuk namun tidak terbatas pada peraturan OJK 
                      dan ketentuan perpajakan.
                    </p>

                    <p>
                      <strong>6. Hak Anda</strong><br/>
                      Sesuai dengan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, Anda memiliki hak untuk:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Mengakses dan memperoleh salinan data pribadi Anda</li>
                      <li>Memperbarui atau memperbaiki data pribadi yang tidak akurat</li>
                      <li>Menghapus data pribadi dalam kondisi tertentu</li>
                      <li>Membatasi pemrosesan data pribadi</li>
                      <li>Mengajukan keberatan atas pemrosesan data</li>
                      <li>Meminta portabilitas data</li>
                    </ul>

                    <p>
                      <strong>7. Perubahan Kebijakan Privasi</strong><br/>
                      Lendana berhak untuk mengubah kebijakan privasi ini dari waktu ke waktu. Perubahan akan diinformasikan 
                      melalui platform atau email yang terdaftar.
                    </p>

                    <p>
                      <strong>8. Kontak</strong><br/>
                      Untuk pertanyaan atau permintaan terkait data pribadi Anda, silakan hubungi kami di:<br/>
                      Email: privacy@lendana.co.id<br/>
                      Telepon: 1500-XXX<br/>
                      Alamat: [Alamat Kantor Lendana]
                    </p>

                    <p className="text-gray-600 italic">
                      Dengan mendaftar dan menggunakan layanan Lendana, Anda menyatakan telah membaca, memahami, 
                      dan menyetujui kebijakan privasi ini.
                    </p>
                  </div>

                  {!hasScrolledToBottom && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      ⚠️ Silakan scroll ke bawah untuk membaca seluruh kebijakan privasi
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consent-terms"
                      checked={consentTermsConditions}
                      onCheckedChange={(checked) => setConsentTermsConditions(checked as boolean)}
                      disabled={!hasScrolledToBottom}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="consent-terms"
                        className={`text-sm font-medium leading-none cursor-pointer ${
                          !hasScrolledToBottom ? 'text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        Syarat dan Ketentuan *
                      </label>
                      <p className="text-xs text-gray-500">
                        Saya telah membaca dan menyetujui kebijakan privasi di atas
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    <p>* Wajib disetujui untuk melanjutkan pendaftaran</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#5680E9] hover:bg-[#5680E9]/90"
                  disabled={isLoading || !consentTermsConditions}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}