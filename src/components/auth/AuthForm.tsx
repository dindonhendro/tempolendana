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
  onAuthSuccess?: () => void | Promise<void>;
  isWirausaha?: boolean;
  isPerusahaan?: boolean;
}

export default function AuthForm({
  onAuthSuccess,
  isWirausaha = false,
  isPerusahaan = false,
}: AuthFormProps) {
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
  const [collectorCompanies, setCollectorCompanies] = useState<any[]>([]);

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

    // Validate scroll requirement for privacy policy
    if (!hasScrolledToBottom) {
      setError("Silakan scroll dan baca seluruh kebijakan privasi terlebih dahulu");
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
        consentTermsConditions, // Pass privacy policy consent for OJK logging
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
            {isPerusahaan
              ? "P3MI Business Loan"
              : isWirausaha
                ? "KUR Wirausaha PMI"
                : "KUR Penempatan PMI"}
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
                      ) : isPerusahaan ? (
                        <SelectItem value="perusahaan">
                          Perusahaan (P3MI Business)
                        </SelectItem>
                      ) : (
                        <>
                          <SelectItem value="user">User (PMI)</SelectItem>
                          <SelectItem value="perusahaan" disabled>
                            Perusahaan (P3MI Business) - Coming Soon
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
                    <h5 className="font-semibold text-sm text-gray-900 text-center">KEBIJAKAN PRIVASI</h5>
                    <h6 className="font-semibold text-sm text-gray-900 text-center">PT. LENDANA DIGITALINDO NUSANTARA</h6>

                    <p>
                      <strong>I. KATA PENGANTAR</strong><br />
                      Kebijakan Privasi ini ("Kebijakan Privasi") menjelaskan bagaimana PT. Lendana Digitalindo Nusantara (selanjutnya disebut "Lendana" atau "Kami") sebagai Penyelenggara Agregasi Jasa keuangan terdaftar di OJK sesuai dengan POJK 4/2025, yang akan memproses Data Pribadi Anda sehubungan dengan penggunaan transaksi dan layanan agregasi data di platform Lendana ("Pemrosesan Data Pribadi").
                    </p>
                    <p>
                      Kebijakan Privasi ini disediakan di platform atau website Lendana sehingga Anda dapat mengklik, membaca dan memahami secara lebih detil dan memberikan persetujuan apabila ingin melanjutkan pendaftaran dan transaksi di platform Lendana. Kebijakan privasi ini tunduk dan mengikuti POJK Nomor 22 Tahun 2023 tentang Pelindungan Konsumen dan Masyarakat di Sektor Jasa Keuangan, SEOJK 14/SEOJK.07/2014 tentang kewajiban PUJK merahasiakan data nasabah dan melarang pemberian ke pihak ketiga, serta mengharuskan persetujuan dari konsumen untuk pemrosesan data.
                    </p>

                    <p>
                      <strong>II. PENGAKUAN DAN PERSETUJUAN</strong><br />
                      Dengan mendaftar akun dan menggunakan Layanan Kami, berarti Anda mengakui bahwa Anda telah membaca dan memahami Kebijakan Privasi ini dan memberikan persetujuan atas Pemrosesan Data Pribadi Anda sesuai dengan Kebijakan Privasi ini. Secara khusus, Anda sepakat dan memberikan persetujuan kepada Kami untuk Memproses Data Pribadi Anda sesuai dengan Kebijakan Privasi ini.
                    </p>
                    <p>
                      Anda dapat menarik persetujuan Anda untuk setiap atau seluruh pengumpulan, penggunaan, atau pengungkapan Data Pribadi Anda kapan saja dengan memberikan kepada Kami pemberitahuan secara tertulis melalui email ke privacy@lendana.id. Setelah menerima pemberitahuan Anda untuk menarik persetujuan atas pengumpulan, penggunaan, atau pengungkapan Data Pribadi Anda, Kami akan memberi tahu Anda tentang konsekuensi yang mungkin terjadi dari penarikan tersebut sehingga Anda dapat memutuskan apakah Anda tetap ingin menarik persetujuan.
                    </p>

                    <p>
                      <strong>III. DATA PRIBADI YANG DIKUMPULKAN</strong><br />
                      "Data Pribadi" berarti data yang mengidentifikasi atau dapat digunakan untuk mengidentifikasi, menghubungi, atau menemukan orang atau perangkat yang terkait dengan data tersebut. Data Pribadi termasuk, namun tidak terbatas pada, nama, alamat, tanggal lahir, pekerjaan, nomor telepon, alamat email, rekening bank, jenis kelamin, identifikasi (termasuk paspor atau dokumen identitas nasional) atau tanda pengenal lainnya yang dikeluarkan pemerintah, Visa Kerja, foto, kewarganegaraan, nomor telepon Pengguna dan non-Pengguna di dalam daftar kontak telepon seluler Anda, data terkait keuangan, data biometrik (termasuk namun tidak terbatas pada pengenalan sidik jari dan pengenalan wajah), dan data lainnya yang termasuk sebagai Data Pribadi sesuai dengan hukum dan peraturan perundang-undangan yang berlaku.
                    </p>
                    <p>
                      Jenis Data Pribadi yang Kami kumpulkan bergantung pada keadaan pengumpulan dan sifat layanan yang diminta atau transaksi yang dilakukan. Mengingat Lendana sebagai Penyelenggara Agregasi Jasa Keuangan (PAJK) maka data/dokumen yang dikumpulkan termasuk diantaranya sesuai dengan kebutuhan LJK sebagai Mitra Lendana.
                    </p>
                    <p>
                      Sepanjang diizinkan oleh Peraturan Perundang-undangan yang Berlaku, Kami dapat memproses, mengumpulkan, menggunakan, menyimpan dan mentransfer berbagai jenis Data Pribadi, yang terdiri dari Data Pribadi umum dan khusus/sensitif, tentang Anda yang telah Kami klasifikasikan sebagai berikut:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Data Identitas</strong> termasuk nama, nama pengguna, kata sandi, kartu tanda penduduk, nomor pokok wajib pajak, Kartu keluarga, Paspor, Surat Nikah, identitas pengguna atau pengenal lainnya sesuai kebutuhan LJK, jabatan, tanggal kelahiran, jenis kelamin, tempat kelahiran, pekerjaan, kewarganegaraan, Visa Kerja, Nomor regristasi PMI, foto dan/atau data biometric.</li>
                      <li><strong>Data Kontak</strong> termasuk alamat di Indonesia atau di Luar Negeri apabila menjadi PMI sebagai informasi alamat penagihan, alamat email, nomor telepon.</li>
                      <li><strong>Data Kelayakan</strong> termasuk, dalam kaitannya dengan kontrak kerja dari pemberi kerja di Luar Negeri, Sertifikat Kompetensi, Nama Perusahaan Pemberi kerja beserta alamatnya, Bukti mendaftar di SISKO Kementerian P2MI dan Siap Kerja di Kemenaker, polis asuransi dan dokumen tambahan. Untuk pengguna korporasi seperti NIB, NPWP, Informasi keuangan dan data lainnya sesuai kebutuhan LJK.</li>
                      <li><strong>Data Transaksi</strong> termasuk data pengajuan pinjaman, minat, preferensi, masukan, dan tanggapan survei Anda, sehubungan dengan Pengguna, jenis layanan yang dicari dan jenis layanan yang dilakukan pada saat itu.</li>
                      <li><strong>Data Catatan (log)</strong> termasuk catatan pada server yang menerima data seperti alamat IP perangkat, tanggal dan waktu akses, fitur aplikasi atau laman yang dilihat, proses kerja aplikasi dan aktivitas sistem lainnya, jenis peramban (browser), dan/atau situs atau layanan pihak ketiga yang Pengguna gunakan sebelum berinteraksi dengan Layanan.</li>
                      <li><strong>Data Lokasi</strong> termasuk data lokasi geografis waktu-nyata (real-time) Anda, titik koordinat lokasi bujur lintang (longitude latitude), dan lokasi Wi-Fi.</li>
                    </ul>
                    <p>
                      Kami dapat membuat, menggunakan, mengungkapkan Data Gabungan seperti data statistik atau demografis untuk tujuan apa pun. Data Gabungan dapat berasal dari Data Pribadi Anda tetapi tidak akan dianggap sebagai Data Pribadi karena data ini tidak akan secara langsung atau tidak langsung mengungkapkan identitas Anda karena Kami akan memastikan: (i) bahwa semua pengenal telah dihapus sehingga data tersebut, sendiri atau bersama-sama dengan data lain yang tersedia, tidak dapat dikaitkan atau dihubungkan dengan atau tidak dapat mengidentifikasi siapa pun, dan (ii) data tersebut kemudian digabungkan dengan data serupa sehingga data asli membentuk bagian dari kumpulan data yang lebih besar.
                    </p>

                    <p>
                      <strong>Cara Kami Mengumpulkan Data Pribadi Anda</strong><br />
                      Data Pribadi yang Kami kumpulkan dapat diberikan oleh Anda secara langsung atau oleh pihak ketiga (misalnya: Mitra P3MI, Mitra LPK/SO, BNSP sebagai Lembaga Sertifikasi, Imigrasi untuk Paspor dan Visa, Poliklinik untuk data medical checkup ketika Anda mendaftar secara kolektif melalui Mitra Penempatan atau menggunakan Layanan, ketika Anda menghubungi layanan pelanggan Kami, atau ketika Anda menyediakan Data Pribadi kepada Kami). Kami dapat mengumpulkan data dalam berbagai macam bentuk dan tujuan (termasuk tujuan yang diizinkan berdasarkan Peraturan Perundang-undangan yang Berlaku).
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Informasi yang Kami kumpulkan dari Anda atau dari perangkat seluler Anda secara langsung</strong> - Anda dapat memberikan kepada Kami Data Identitas, Kontak, Kelayakan, Data transaksi dan lain-lain termasuk dalam keadaan di mana hal tersebut diminta oleh Kami atau Mitra LJK kami. Hal ini termasuk Data Pribadi yang Anda sediakan ketika Anda: mendaftar dan membuat sebuah akun menggunakan Layanan; menggunakan Layanan yang tersedia di platform Lendana; menggunakan fitur obrolan (chat); memberikan masukan kepada Kami atau menghubungi Kami.</li>
                      <li><strong>Informasi yang dikumpulkan setiap kali Anda menggunakan Layanan</strong> - Anda dapat memberikan Data Teknis dan Lokasi kepada Kami setiap kali Anda menggunakan dan/atau mengunjungi Layanan. Setiap kali Anda mengakses Layanan melalui Perangkat Seluler Anda, Kami akan melacak dan mengumpulkan data lokasi geografis Anda secara waktu-nyata (real-time).</li>
                      <li><strong>Data yang dikumpulkan dari pihak ketiga</strong> - Kami juga dapat mengumpulkan Data Pribadi Anda dari pihak ketiga (termasuk Mitra P3MI, Mitra LPK, Mitra Sending Organization dan atau pihak lainnya yang bekerjasama dengan kami).</li>
                      <li><strong>Informasi tentang pihak ketiga yang Anda berikan kepada Kami</strong> - Anda dapat memberikan kepada Kami Data Pribadi yang berkaitan dengan individu pihak ketiga lainnya (termasuk Data Pribadi yang berkaitan dengan pasangan Anda, anggota keluarga, teman, atau individu lainnya). Dalam hal tersebut, Anda tentu saja akan memerlukan persetujuan dari individu pihak ketiga lainnya tersebut.</li>
                    </ul>

                    <p>
                      <strong>IV. PENGGUNAAN DATA PRIBADI</strong><br />
                      Kami dapat menggunakan Data Pribadi yang dikumpulkan untuk salah satu dari tujuan berikut ini serta untuk tujuan lain yang diizinkan oleh Peraturan Perundang-undangan yang Berlaku ("Tujuan"):
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>untuk mengidentifikasi dan mendaftarkan Anda sebagai Pengguna dan untuk membuat, memverifikasi, menonaktifkan, atau mengelola akun Anda pada Layanan Kami;</li>
                      <li>untuk memfasilitasi atau memungkinkan verifikasi apa pun yang menurut pertimbangan Kami diperlukan sebelum menggunakan produk dan layanan kami atau sebelum Kami mendaftarkan Anda sebagai Pengguna, termasuk melakukan proses KYC (Know Your Customer) dan/atau penilaian kredit (credit scoring) (jika dibutuhkan);</li>
                      <li>untuk memungkinkan Lendana menyediakan layanan, baik layanan yang telah tersedia seperti pengajuan pinjaman ke Lembaga Jasa Keuangan yang telah bekerjasama dengan kami, layanan yang Anda minta sebagai kelengkapan produk dan layanan, maupun layanan yang akan kami sediakan mendatang sesuai pertimbangan kami;</li>
                      <li>untuk memberitahu Anda atas transaksi atau aktivitas yang terjadi dalam platform atau sistem lain yang terhubung dengan Layanan Kami;</li>
                      <li>untuk memfasilitasi penautan akun VA melalui mitra Payment Gateway sesuai dengan layanan yang anda aktifkan sesuai kebutuhan layanan;</li>
                      <li>untuk berkomunikasi dengan Anda dan mengirimkan Anda data sehubungan dengan penggunaan Layanan;</li>
                      <li>untuk memberitahu Anda mengenai segala pembaruan pada platform atau perubahan pada Layanan yang tersedia;</li>
                      <li>untuk memproses, menyelesaikan dan menanggapi keluhan, permasalahan, pertanyaan dan saran yang diterima dari Anda;</li>
                      <li>untuk melakukan pemeliharaan, mengembangkan, menguji, meningkatkan, dan mempersonalisasikan Layanan untuk memenuhi kebutuhan dan preferensi Anda sebagai Pengguna;</li>
                      <li>untuk memantau dan menganalisis aktivitas, perilaku, dan data demografis pengguna termasuk tren dan penggunaan berbagai layanan yang tersedia pada Layanan Kami, termasuk mengevaluasi kelayakan kredit dan penilaian kredit (credit scoring) berdasarkan penggunaan Layanan oleh Anda secara keseluruhan;</li>
                      <li>untuk memproses dan mengelola reward points Anda apabila terdapat program promosi dari kami.</li>
                    </ul>

                    <p>
                      <strong>V. MELINDUNGI DATA PRIBADI ANDA</strong>
                    </p>
                    <p>
                      <strong>1. Keamanan Data</strong><br />
                      Kerahasiaan Data Pribadi Anda adalah hal yang terpenting bagi Lendana. Kami akan melakukan segala upaya yang wajar untuk melindungi dan mengamankan Data Pribadi Anda dari akses, pengumpulan, penggunaan atau pengungkapan oleh orang-orang yang tidak berwenang dan dari pemrosesan yang melanggar hukum. Namun, pengiriman data melalui internet tidak sepenuhnya aman. Meskipun Kami selalu melakukan yang terbaik untuk melindungi Data Pribadi Anda, Anda mengakui bahwa Kami tidak dapat menjamin integritas dan keakuratan Data Pribadi apa pun yang Anda kirimkan melalui Internet, atau menjamin bahwa Data Pribadi tersebut tidak akan dicegat, diakses, diungkapkan, diubah atau dimusnahkan oleh pihak ketiga yang tidak berwenang, karena faktor-faktor di luar kendali Kami. Anda bertanggung jawab untuk menjaga kerahasiaan rincian akun Anda dan Anda wajib untuk tidak membagikan rincian akun Anda, termasuk kata sandi Anda dan One Time Password (OTP) Anda, kepada siapa pun dan Anda juga harus selalu menjaga dan bertanggung jawab atas keamanan perangkat yang Anda gunakan.
                    </p>
                    <p>
                      <strong>2. Penyimpanan Data</strong><br />
                      Data Pribadi Anda hanya akan disimpan selama diperlukan untuk memenuhi tujuan dari pengumpulannya. Untuk keperluan pengajuan pinjaman hanya disimpan sesuai tenor pinjaman anda plus 6 (enam) bulan tambahan apabila anda ingin mengajukan pinjaman baru, yang mana selama masa retensi atau selama penyimpanan tersebut diwajibkan atau diizinkan oleh Peraturan Perundang-undangan yang Berlaku. Kami akan berhenti menyimpan Data Pribadi, atau menghapus maksud dari dikaitkannya Data Pribadi tersebut dengan Anda sebagai individu, segera setelah dianggap bahwa tujuan pengumpulan Data Pribadi tersebut tidak lagi dibutuhkan dengan menyimpan Data Pribadi, terdapat permintaan dari Anda untuk melakukan penghapusan akun Anda, dan penyimpanan tidak lagi diperlukan untuk tujuan bisnis atau secara hukum.
                    </p>
                    <p>
                      Lendana akan menghapus dan/atau menganonimkan Data Pribadi Pengguna yang ada di bawah kendali Lendana apabila (i) Data Pribadi Pengguna tidak lagi diperlukan untuk memenuhi tujuan dari pengumpulannya; (ii) berakhirnya masa retensi dan (iii) penyimpanan tidak lagi diperlukan untuk tujuan kepatuhan menurut ketentuan Peraturan Perundang-undangan yang Berlaku.
                    </p>
                    <p>
                      Mohon diperhatikan bahwa masih ada kemungkinan bahwa beberapa Data Pribadi Anda disimpan oleh pihak lain, termasuk institusi pemerintah dengan cara tertentu. Dalam hal Kami membagikan Data Pribadi Anda kepada institusi pemerintah yang berwenang dan/atau institusi lainnya yang dapat ditunjuk oleh otoritas pemerintah yang berwenang atau memiliki kerja sama dengan Kami, Anda menyetujui dan mengakui bahwa penyimpanan Data Pribadi Anda oleh institusi terkait akan mengikuti kebijakan penyimpanan data masing-masing institusi tersebut.
                    </p>
                    <p>
                      Sepanjang diizinkan oleh Peraturan Perundang-undangan yang Berlaku, Anda setuju untuk membebaskan Kami dari dan terhadap setiap dan semua klaim, kerugian, kewajiban, pengeluaran, kerusakan, dan biaya (termasuk namun tidak terbatas pada biaya dan pengeluaran hukum atas dasar ganti rugi penuh) yang diakibatkan secara langsung atau tidak langsung dari setiap penyimpanan Data Pribadi Anda yang tidak sah.
                    </p>

                    <p>
                      <strong>VI. HAK PENGGUNA</strong><br />
                      Anda sebagai pengguna dari platform kami memiliki hak tertentu berdasarkan Peraturan Perundang-undangan yang Berlaku untuk meminta kepada Kami terhadap akses berupa koreksi dari dan/atau penghapusan terhadap Data Pribadi Anda yang berada dalam penguasaan dan kendali Kami. Anda dapat menghapus akun anda melalui platform kami atau menghubungi kami melalui email di privacy@lendana.id
                    </p>
                    <p>
                      Kami berhak untuk menolak permintaan Anda terhadap akses pada, koreksi dari dan/atau penghapusan terhadap, sebagian atau semua Data Pribadi Anda yang Kami kuasai atau kendalikan jika diperbolehkan atau diperlukan berdasarkan Peraturan Perundang-undangan yang Berlaku. Hal ini termasuk dalam keadaan di mana Data Pribadi tersebut dapat berisi referensi kepada orang lain atau di mana permintaan untuk akses atau permintaan untuk memperbaiki atau menghapus adalah untuk alasan yang Kami anggap tidak relevan, sembrono, atau sulit.
                    </p>
                    <p>
                      Sesuai Peraturan Perundang-undangan yang Berlaku, Kami berhak untuk membebankan biaya administrasi untuk setiap permintaan akses dan/atau koreksi.
                    </p>

                    <p>
                      <strong>VII. HUBUNGI KAMI</strong><br />
                      Apabila Anda memiliki pertanyaan atau keluhan terkait Kebijakan Privasi ini atau apabila Anda ingin mengakses, mengoreksi dan/atau hak-hak lainnya atas Data Pribadi Anda, silakan hubungi kami melalui layanan pelanggan di privacy@lendana.id
                    </p>

                    <p className="text-gray-600 italic text-center">
                      Dikeluarkan per 17 Desember 2025
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
                        className={`text-sm font-medium leading-none cursor-pointer ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-900'
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