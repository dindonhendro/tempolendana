import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  Building2,
  Users,
  ArrowRight,
  Check,
  Globe,
  Briefcase,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted?: () => void;
}

const LandingPage = ({ onGetStarted = () => {} }: LandingPageProps) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [showAboutLendana, setShowAboutLendana] = useState(false);
  const [showBankList, setShowBankList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [loanFormData, setLoanFormData] = useState({
    name: "",
    phone: "",
    email: "",
    amount: "",
    bank: "",
    product: "",
    cowCount: "",
    farmLocation: "",
    loanPurpose: "",
    dailyMilkYield: "",
    cooperative: "",
    ktpFile: null as File | null,
  });

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const testimonials = [
    {
      quote: "KUR-PMI bantu saya berangkat ke Taiwan tanpa pinjam rentenir!",
      name: "Ayu Aminah",
      location: "Purworejo, Jawa Tengah",
      role: "PMI Taiwan",
    },
    {
      quote:
        "Dengan KUR-PMI, saya bisa buka warung kecil setelah pulang dari Malaysia.",
      name: "Ahmad Fauzi",
      location: "Lombok, NTB",
      role: "Purna PMI Malaysia",
    },
    {
      quote:
        "Prosesnya mudah dan bunga ringan, sangat membantu keluarga PMI seperti kami.",
      name: "Ratna Sari",
      location: "Indramayu, Jawa Barat",
      role: "PMI Hongkong",
    },
  ];

  const bumnBanks = [
    {
      name: "Bank Mandiri",
      fullName: "PT Bank Mandiri (Persero) Tbk",
      logo: "/images/Bank_Mandiri_logo_2016.svg",
      description: "Bank terbesar di Indonesia dengan jaringan cabang terluas",
    },
    {
      name: "Bank BNI",
      fullName: "PT Bank Negara Indonesia (Persero) Tbk",
      logo: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=200&q=80",
      description: "Bank tertua di Indonesia yang didirikan pada tahun 1946",
    },
    {
      name: "Bank BRI",
      fullName: "PT Bank Rakyat Indonesia (Persero) Tbk",
      logo: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=200&q=80",
      description:
        "Bank dengan fokus utama pada sektor mikro, kecil, dan menengah",
    },
    {
      name: "Bank BTN",
      fullName: "PT Bank Tabungan Negara (Persero) Tbk",
      logo: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=200&q=80",
      description: "Bank yang mengkhususkan diri dalam pembiayaan perumahan",
    },
  ];

  const bankProducts = {
    "KUR Perumahan PMI": [
      {
        bank: "Bank Mandiri",
        product: "KUR Perumahan Mandiri - Bunga 6% p.a",
        maxAmount: "Rp 500 juta",
      },
      {
        bank: "Bank BNI",
        product: "KUR Perumahan BNI - Bunga 6% p.a",
        maxAmount: "Rp 500 juta",
      },
      {
        bank: "Bank BRI",
        product: "KUR Perumahan BRI - Bunga 6% p.a",
        maxAmount: "Rp 500 juta",
      },
      {
        bank: "Bank BTN",
        product: "KUR Perumahan BTN - Bunga 6% p.a",
        maxAmount: "Rp 500 juta",
      },
    ],
    "KUR Rumah Subsidi PMI": [
      {
        bank: "Bank Mandiri",
        product: "KUR Subsidi Mandiri - Bunga 5% p.a",
        maxAmount: "Rp 150 juta",
      },
      {
        bank: "Bank BNI",
        product: "KUR Subsidi BNI - Bunga 5% p.a",
        maxAmount: "Rp 150 juta",
      },
      {
        bank: "Bank BRI",
        product: "KUR Subsidi BRI - Bunga 5% p.a",
        maxAmount: "Rp 150 juta",
      },
      {
        bank: "Bank BTN",
        product: "KUR Subsidi BTN - Bunga 5% p.a",
        maxAmount: "Rp 150 juta",
      },
    ],
    "KUR Wirausaha PMI": [
      {
        bank: "Bank Mandiri",
        product: "KUR Mikro Mandiri - Bunga 6% p.a",
        maxAmount: "Rp 50 juta",
      },
      {
        bank: "Bank BNI",
        product: "KUR Mikro BNI - Bunga 6% p.a",
        maxAmount: "Rp 50 juta",
      },
      {
        bank: "Bank BRI",
        product: "KUR Mikro BRI - Bunga 6% p.a",
        maxAmount: "Rp 50 juta",
      },
      {
        bank: "Bank Nano",
        product: "KUR Mikro Nano - Bunga 6% p.a",
        maxAmount: "Rp 25 juta",
      },
    ],
    "Peternak Sapi PMI": [
      {
        bank: "Bank BPR",
        product: "KUR Peternakan BPR - Bunga 6% p.a",
        maxAmount: "Rp 75 juta",
      },
    ],
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Terima kasih ${loanFormData.name}! Pengajuan ${selectedProduct} Anda telah diterima. Tim kami akan menghubungi Anda dalam 1x24 jam.`,
    );
    setShowLoanDialog(false);
    setLoanFormData({
      name: "",
      phone: "",
      email: "",
      amount: "",
      bank: "",
      product: "",
      cowCount: "",
      farmLocation: "",
      loanPurpose: "",
      dailyMilkYield: "",
      cooperative: "",
      ktpFile: null,
    });
  };

  const privacyPolicyText = `
KEBIJAKAN PRIVASI KUR-PMI

1. PENGUMPULAN INFORMASI
Kami mengumpulkan informasi pribadi yang Anda berikan secara langsung kepada kami, termasuk namun tidak terbatas pada:
- Nama lengkap dan informasi identitas
- Informasi kontak (alamat, nomor telepon, email)
- Informasi keuangan dan pekerjaan
- Dokumen pendukung aplikasi pinjaman

2. PENGGUNAAN INFORMASI
Informasi yang kami kumpulkan digunakan untuk:
- Memproses aplikasi pinjaman KUR-PMI
- Melakukan verifikasi dan penilaian kredit
- Berkomunikasi mengenai status aplikasi
- Mematuhi persyaratan hukum dan regulasi

3. PERLINDUNGAN DATA
Kami berkomitmen melindungi informasi pribadi Anda dengan:
- Enkripsi data yang kuat
- Akses terbatas hanya untuk personel yang berwenang
- Sistem keamanan berlapis
- Audit keamanan berkala

4. PEMBAGIAN INFORMASI
Informasi Anda dapat dibagikan kepada:
- Bank penyalur KUR yang bekerja sama
- Lembaga pemerintah terkait (sesuai regulasi)
- Pihak ketiga yang mendukung layanan (dengan perjanjian kerahasiaan)

5. HAK ANDA
Anda memiliki hak untuk:
- Mengakses informasi pribadi yang kami miliki
- Meminta koreksi data yang tidak akurat
- Meminta penghapusan data (sesuai ketentuan hukum)
- Menarik persetujuan penggunaan data

6. KONTAK
Untuk pertanyaan mengenai kebijakan privasi ini, hubungi:
Email: privacy@kur-pmi.id
Telepon: 0813.8111.1135

Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan diberitahukan melalui website resmi kami.

Terakhir diperbarui: ${new Date().toLocaleDateString("id-ID")}
  `;

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src="/images/logo lendana_trans1.png"
                alt="Lendana"
                className="h-10 w-auto"
              />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-10">
              <a
                href="#beranda"
                className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors relative group"
              >
                Beranda
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </a>
              <a
                href="#produk"
                className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors relative group"
              >
                Produk
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </a>
              <a
                href="#tentang"
                className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors relative group"
              >
                Tentang
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </a>
              <a
                href="#kontak"
                className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors relative group"
              >
                Kontak
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-medium"
                onClick={() => (window.location.href = "/auth")}
              >
                Masuk
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300"
                onClick={() => (window.location.href = "/auth")}
              >
                Daftar Gratis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="beranda"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-mesh-blue opacity-60" />

        {/* Floating Decorative Elements */}
        <div className="absolute top-32 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-blue-300/20 rounded-full blur-2xl animate-float-slow" />

        {/* Geometric Shapes */}
        <div className="absolute top-40 right-20 w-4 h-4 bg-blue-500 rounded-full opacity-60 animate-float" />
        <div className="absolute top-60 right-40 w-3 h-3 bg-indigo-400 rounded-full opacity-40 animate-float-delayed" />
        <div className="absolute bottom-40 left-20 w-5 h-5 bg-blue-400 rounded-full opacity-50 animate-float-slow" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 text-blue-600 text-sm font-medium shadow-sm">
                  <Sparkles className="w-4 h-4" />
                  Terdaftar di OJK • S-27/3/MS.72/2019
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
              >
                Pembiayaan <span className="text-gradient-blue">KUR PMI</span>
                <br />
                untuk Masa Depan Cerah
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Berangkat kerja ke luar negeri dengan aman dan legal. Dapatkan
                pembiayaan hingga{" "}
                <span className="font-semibold text-slate-900">
                  Rp 100 juta
                </span>{" "}
                dengan bunga hanya{" "}
                <span className="font-semibold text-blue-600">
                  6% per tahun
                </span>
                .
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={onGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg px-10 py-7 h-auto rounded-xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-300 group"
                  >
                    Daftar Sekarang
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => setShowAboutLendana(true)}
                    size="lg"
                    variant="outline"
                    className="border-2 border-slate-300 bg-white/60 backdrop-blur-sm text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 font-semibold text-lg px-10 py-7 h-auto rounded-xl transition-all duration-300"
                  >
                    Tentang Lendana
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={fadeInUp}
                className="mt-10 flex items-center gap-8 justify-center lg:justify-start"
              >
                <div className="flex items-center gap-2 text-slate-500">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Terdaftar OJK</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">10K+ Pengguna</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">4 Bank BUMN</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - Feature Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main Card */}
                <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/40">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
                      <span className="text-white text-3xl font-bold">L</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Fasilitas KUR PMI
                    </h3>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                      <span className="text-blue-700 font-bold text-xl">
                        6% /tahun
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    {[
                      "Bunga rendah hanya 6% per tahun",
                      "Proses cepat & mudah",
                      "Tanpa agunan tambahan",
                      "Dilindungi asuransi",
                    ].map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/80 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-slate-700 font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Stats Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 shadow-xl border border-white/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        Rp 50M+
                      </p>
                      <p className="text-sm text-slate-500">Dana Tersalurkan</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section
        id="produk"
        className="py-24 px-4 bg-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:40px_40px] opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
              <Briefcase className="w-4 h-4" />
              Produk Unggulan
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Pilih Produk Sesuai{" "}
              <span className="text-gradient-blue">Kebutuhan Anda</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Berbagai pilihan pembiayaan KUR yang telah disesuaikan untuk
              kebutuhan Pekerja Migran Indonesia
            </p>
          </motion.div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* KUR Penempatan PMI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer group overflow-hidden bg-gradient-to-br from-blue-50 to-white hover:-translate-y-2"
                onClick={() => (window.location.href = "/auth")}
              >
                <CardContent className="p-8">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-500">
                    <Globe className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    KUR Penempatan PMI
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Biaya penempatan, pelatihan, & dokumen hingga{" "}
                    <span className="font-semibold text-slate-900">
                      Rp 100 juta
                    </span>
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {["Bunga 6% per tahun", "Tanpa agunan", "Proses cepat"].map(
                      (item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-slate-600">{item}</span>
                        </div>
                      ),
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 rounded-xl shadow-lg shadow-blue-600/25 group-hover:shadow-blue-600/40 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = "/auth";
                    }}
                  >
                    Daftar Sekarang
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pengembangan Usaha P3MI */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden bg-gradient-to-br from-indigo-50 to-white hover:-translate-y-2">
                <CardContent className="p-8">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-500">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    Pengembangan Usaha P3MI
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Pinjaman khusus untuk pengembangan usaha P3MI/Agent dengan
                    proses mudah
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {[
                      "Bunga kompetitif",
                      "Limit tinggi",
                      "Pendampingan bisnis",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-slate-600">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-6 rounded-xl shadow-lg shadow-indigo-600/25 group-hover:shadow-indigo-600/40 transition-all"
                    onClick={() => (window.location.href = "/auth/perusahaan")}
                  >
                    Ajukan Pinjaman
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Mengapa Memilih{" "}
              <span className="text-gradient-blue">Lendana?</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Solusi pembiayaan terpercaya untuk mendukung perjalanan PMI
              Indonesia
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Bunga Ringan
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Suku bunga hanya{" "}
                    <span className="font-semibold text-green-600">
                      6% efektif
                    </span>{" "}
                    per tahun, jauh lebih rendah dari pinjaman konvensional
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card
                className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1 cursor-pointer"
                onClick={() => setShowBankList(true)}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Bank Terpercaya
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Disalurkan melalui bank-bank BUMN terpercaya di Indonesia
                  </p>
                  <span className="inline-flex items-center text-sm text-blue-600 font-medium hover:text-blue-700">
                    Lihat daftar bank
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Proses Cepat
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Proses persetujuan yang cepat dan mudah dengan pendampingan
                    profesional
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learn More Section */}
      <section id="tentang" className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Pelajari Lebih Lanjut
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem
                    value="what-is-kur-pmi"
                    className="border-none"
                  >
                    <AccordionTrigger className="px-8 py-6 text-left hover:no-underline hover:bg-blue-100/50 transition-colors">
                      <div className="flex items-center text-xl font-semibold text-slate-900">
                        <span className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-white text-lg">?</span>
                        </span>
                        Apa itu KUR-PMI?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-8">
                      <div className="text-slate-700 space-y-4 text-lg leading-relaxed pl-14">
                        <p>
                          <strong className="text-blue-600">
                            KUR-PMI (Kredit Usaha Rakyat untuk Pekerja Migran
                            Indonesia)
                          </strong>{" "}
                          adalah program pembiayaan khusus yang dirancang untuk
                          membantu calon PMI dan purna PMI dalam mengakses modal
                          dengan mudah dan terjangkau.
                        </p>
                        <p>Program ini terdiri dari dua jenis:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>
                            <strong>KUR Penempatan PMI:</strong> Untuk membiayai
                            biaya penempatan, pelatihan, dan dokumen dengan
                            plafon hingga Rp100 juta
                          </li>
                          <li>
                            <strong>KUR Mikro PMI Purna:</strong> Untuk modal
                            usaha bagi PMI yang telah kembali ke Indonesia,
                            tanpa memerlukan agunan pokok
                          </li>
                        </ul>
                        <p>
                          Dengan suku bunga hanya{" "}
                          <span className="font-semibold text-blue-600">
                            6% efektif per tahun
                          </span>
                          , KUR-PMI menjadi solusi pembiayaan yang sangat
                          terjangkau.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-slate-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="md:col-span-2">
              <img
                src="/images/logo lendana_trans1.png"
                alt="Lendana"
                className="h-10 w-auto mb-6 brightness-0 invert"
              />
              <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
                Lendana adalah Penyelenggara Agregasi Jasa Keuangan yang
                terdaftar dan diawasi oleh Otoritas Jasa Keuangan (OJK).
              </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg inline-flex">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-300">
                  Terdaftar OJK: S-27/3/MS.72/2019
                </span>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-blue-400">
                Hubungi Kami
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div className="text-slate-400 text-sm">
                    <p className="font-medium text-white">
                      PT Lendana Digitalindo Nusantara
                    </p>
                    <p>Sovereign 78 E1</p>
                    <p>Jalan Raya Kemang Raya 78</p>
                    <p>Jakarta Selatan 12730</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <a
                    href="mailto:admin@lendana.id"
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    admin@lendana.id
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-500" />
                  <a
                    href="tel:081381111135"
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
                  >
                    0813.8111.1135
                  </a>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-blue-400">
                Layanan
              </h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">
                  KUR Penempatan PMI
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  KUR Perumahan PMI
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  KUR Wirausaha PMI
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Konsultasi Gratis
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Pendampingan Aplikasi
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-slate-500">
                <Dialog
                  open={showPrivacyPolicy}
                  onOpenChange={setShowPrivacyPolicy}
                >
                  <DialogTrigger asChild>
                    <button className="hover:text-blue-400 transition-colors">
                      Kebijakan Privasi
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-blue-600">
                        Kebijakan Privasi
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                        {privacyPolicyText}
                      </pre>
                    </div>
                  </DialogContent>
                </Dialog>
                <button className="hover:text-blue-400 transition-colors">
                  Syarat & Ketentuan
                </button>
                <button className="hover:text-blue-400 transition-colors">
                  FAQ
                </button>
              </div>
              <div className="text-sm text-slate-500">
                © {new Date().getFullYear()} Lendana. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* About Lendana Dialog */}
      <Dialog open={showAboutLendana} onOpenChange={setShowAboutLendana}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient-blue">
              Tentang Lendana
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-blue-600 mb-3">
                Platform Penyelenggara Agregasi Produk dan Layanan Jasa Keuangan
              </h3>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  PT. Lendana Digitalindo Nusantara, merupakan perusahaan
                  bergerak dibidang Financial Technology (Fintech) yang telah
                  tercatat di Otoritas Jasa Keuangan (OJK) nomor
                  S-27/3/MS.72/2019.
                </p>
                <p>
                  LENDANA membantu Lembaga Jasa Keuangan untuk menyalurkan
                  pembiayaan ke sektor produktif diantarnya untuk calon Pekerja
                  Migran Indonesia, Petani dan Nelayan, UMKM secara digital
                  mudah, cepat dan terpercaya.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-blue-600 mb-3">
                Misi Kami
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Lendana akan fokus membantu Lembaga Keuangan penyalur Kredit
                Usaha Rakyat (KUR) yang diharapkan menjadi solusi pembiayaan
                yang mudah dan suku bunga rendah.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank List Dialog */}
      <Dialog open={showBankList} onOpenChange={setShowBankList}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient-blue">
              Bank BUMN Mitra Lendana
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-slate-600 mb-6 text-center">
              Lendana bekerja sama dengan bank-bank BUMN terpercaya untuk
              menyalurkan KUR kepada masyarakat Indonesia
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bumnBanks.map((bank, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={bank.logo}
                          alt={`${bank.name} logo`}
                          className="w-16 h-16 object-contain rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-blue-600 mb-1">
                          {bank.name}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {bank.fullName}
                        </p>
                        <p className="text-sm text-slate-700">
                          {bank.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-blue-700 mb-2">
                Mengapa Memilih Bank BUMN?
              </h4>
              <ul className="text-sm text-slate-700 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Terjamin keamanan dan kredibilitasnya
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Memiliki jaringan cabang yang luas di seluruh Indonesia
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Berpengalaman dalam penyaluran KUR
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Didukung penuh oleh pemerintah Indonesia
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
