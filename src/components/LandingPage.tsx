import React, { useState } from "react";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LandingPageProps {
  onGetStarted?: () => void;
}

const LandingPage = ({ onGetStarted = () => {} }: LandingPageProps) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [showAboutLendana, setShowAboutLendana] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loanFormData, setLoanFormData] = useState({
    name: "",
    phone: "",
    email: "",
    amount: "",
    bank: "",
    product: "",
  });

  const testimonials = [
    {
      quote: "KUR-PMI bantu saya berangkat ke Taiwan tanpa pinjam rentenir!",
      name: "Siti Aminah",
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

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

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
  };

  const handleLoanApplication = (productType: string) => {
    setSelectedProduct(productType);
    setLoanFormData({ ...loanFormData, product: productType });
    setShowLoanDialog(true);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5680E9] via-[#84CEEB] to-[#8860D0] opacity-90"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Akses Kredit Usaha Rakyat (KUR) untuk
              <br />
              Pekerja Migran Indonesia
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              KUR-PMI membantu calon PMI , PMI di LN dan purna PMI dengan
              pembiayaan penempatan , subsidi perumahan , KUR Renovasi Rumah &
              pengembangan usaha – bunga ringan 6%, plafon hingga Rp100 juta!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-[#5680E9] hover:bg-[#8860D0] text-white font-bold text-xl px-12 py-6 h-auto rounded-full shadow-2xl transition-all duration-300"
                >
                  Daftar Sekarang
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setShowAboutLendana(true)}
                  size="lg"
                  className="bg-[#5680E9] hover:bg-[#8860D0] text-white font-bold text-xl px-12 py-6 h-auto rounded-full shadow-2xl transition-all duration-300"
                >
                  Tentang Lendana
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Produk KUR-PMI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pilih produk yang sesuai dengan kebutuhan Anda
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
                onClick={() => (window.location.href = "/auth")}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    ✈️
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#5680E9] group-hover:text-[#8860D0] transition-colors duration-300">
                    KUR Penempatan PMI
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Biaya penempatan, pelatihan, & dokumen hingga Rp100 juta
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-[#5680E9] hover:bg-[#8860D0] text-white transition-colors duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = "/auth";
                    }}
                  >
                    Daftar Sekarang
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    🏠
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#5680E9] group-hover:text-[#8860D0] transition-colors duration-300">
                    KUR Perumahan PMI
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Kredit untuk pembelian atau renovasi rumah bagi PMI
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-[#5680E9] hover:bg-[#8860D0] text-white transition-colors duration-300"
                    onClick={() => handleLoanApplication("KUR Perumahan PMI")}
                  >
                    Pelajari lebih lanjut
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    🏘️
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#5680E9] group-hover:text-[#8860D0] transition-colors duration-300">
                    Rumah Subsidi PMI
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Program rumah bersubsidi khusus untuk PMI dengan bunga
                    rendah
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-[#5680E9] hover:bg-[#8860D0] text-white transition-colors duration-300"
                    onClick={() =>
                      handleLoanApplication("KUR Rumah Subsidi PMI")
                    }
                  >
                    Pelajari lebih lanjut
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    💼
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#5680E9] group-hover:text-[#8860D0] transition-colors duration-300">
                    KUR Wirausaha PMI
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Modal usaha untuk PMI yang ingin memulai bisnis
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-[#5680E9] hover:bg-[#8860D0] text-white transition-colors duration-300"
                    onClick={() => handleLoanApplication("KUR Wirausaha PMI")}
                  >
                    Pelajari lebih lanjut
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Keunggulan KUR-PMI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Solusi pembiayaan terpercaya untuk mendukung perjalanan PMI
              Indonesia
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-6">💰</div>
                  <h3 className="text-2xl font-bold mb-4 text-[#5680E9]">
                    Bunga Ringan
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Suku bunga 6% efektif per tahun
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-6">🏦</div>
                  <h3 className="text-2xl font-bold mb-4 text-[#5680E9]">
                    Bank Terpercaya
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Disalurkan melalui bank-bank BUMN terpercaya
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-6">⚡</div>
                  <h3 className="text-2xl font-bold mb-4 text-[#5680E9]">
                    Proses Cepat
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Proses persetujuan yang cepat dan mudah
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learn More Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Pelajari Lebih Lanjut
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="bg-[#C1C8E4] border-none">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem
                    value="what-is-kur-pmi"
                    className="border-none"
                  >
                    <AccordionTrigger className="px-8 py-6 text-left hover:no-underline">
                      <div className="flex items-center text-xl font-semibold text-gray-900">
                        <span className="mr-3">▶️</span>
                        Apa itu KUR-PMI?
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-8">
                      <div className="text-gray-800 space-y-4 text-lg leading-relaxed">
                        <p>
                          <strong>
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
                          Dengan suku bunga hanya 6% efektif per tahun, KUR-PMI
                          menjadi solusi pembiayaan yang sangat terjangkau
                          dibandingkan dengan pinjaman konvensional lainnya.
                        </p>
                        <p>
                          Program ini didukung oleh pemerintah dan disalurkan
                          melalui bank-bank terpercaya seperti Bank Mandiri,
                          BNI, dan BRI untuk memastikan keamanan dan
                          kredibilitas.
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

      {/* Testimonial Carousel */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Testimoni PMI
            </h2>
            <p className="text-xl text-gray-600">
              Dengarkan pengalaman mereka yang telah terbantu oleh KUR-PMI
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Card className="bg-gradient-to-r from-[#5AB9EA] to-[#84CEEB] border-none text-white">
              <CardContent className="p-8 md:p-12">
                <div className="text-center">
                  <div className="text-6xl mb-6">💬</div>
                  <blockquote className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
                    "{testimonials[currentTestimonial].quote}"
                  </blockquote>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold">
                      {testimonials[currentTestimonial].name}
                    </p>
                    <p className="text-lg opacity-90">
                      {testimonials[currentTestimonial].role}
                    </p>
                    <p className="text-base opacity-80">
                      {testimonials[currentTestimonial].location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center items-center mt-8 space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                className="rounded-full p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                      index === currentTestimonial
                        ? "bg-[#5680E9]"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                className="rounded-full p-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#8860D0] to-[#5680E9] text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Lendana</h3>
              <p className="text-lg opacity-90 leading-relaxed mb-4">
                Lendana adalah Penyelenggara Agregasi Jasa Keuangan dan
                terdaftar di Otoritas Jasa Keuangan (OJK)
              </p>
              <div>
                <h4 className="text-xl font-semibold mb-4">
                  Hubungi Kami DI :
                </h4>
                <div className="space-y-1 opacity-90">
                  <p className="font-semibold">
                    PT Lendana Digitalindo Nusantara
                  </p>
                  <p className="font-semibold">ALAMAT KANTOR</p>
                  <p>Sovereign 78 E1</p>
                  <p>Jalan Raya Kemang Raya 78</p>
                  <p>Jakarta Selatan 12730</p>
                  <p className="font-semibold mt-2">Call Center :</p>
                  <p>Email : admin@lendana.id</p>
                  <p>Phone : 0813.8111.1135</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 opacity-90">
                <li>KUR Penempatan PMI</li>
                <li>KUR Perumahan PMI</li>
                <li>KUR Rumah Subsidi PMI</li>
                <li>KUR Wirausaha PMI</li>
                <li>Konsultasi Gratis</li>
                <li>Pendampingan Aplikasi</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm">
                <Dialog
                  open={showPrivacyPolicy}
                  onOpenChange={setShowPrivacyPolicy}
                >
                  <DialogTrigger asChild>
                    <button className="hover:underline transition-all duration-200">
                      Kebijakan Privasi
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-[#5680E9]">
                        Kebijakan Privasi
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                        {privacyPolicyText}
                      </pre>
                    </div>
                  </DialogContent>
                </Dialog>
                <button className="hover:underline transition-all duration-200">
                  Syarat & Ketentuan
                </button>
                <button className="hover:underline transition-all duration-200">
                  FAQ
                </button>
                <button className="hover:underline transition-all duration-200">
                  Kontak
                </button>
              </div>
              <div className="text-sm opacity-75">
                © {new Date().getFullYear()} Lendana. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Loan Application Dialog */}
      <Dialog open={showLoanDialog} onOpenChange={setShowLoanDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#5680E9]">
              Pengajuan {selectedProduct}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={loanFormData.name}
                  onChange={(e) =>
                    setLoanFormData({ ...loanFormData, name: e.target.value })
                  }
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={loanFormData.phone}
                  onChange={(e) =>
                    setLoanFormData({ ...loanFormData, phone: e.target.value })
                  }
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={loanFormData.email}
                onChange={(e) =>
                  setLoanFormData({ ...loanFormData, email: e.target.value })
                }
                placeholder="nama@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Pinjaman *</Label>
              <Input
                id="amount"
                type="text"
                required
                value={loanFormData.amount}
                onChange={(e) =>
                  setLoanFormData({ ...loanFormData, amount: e.target.value })
                }
                placeholder="Rp 50.000.000"
              />
            </div>

            <div className="space-y-2">
              <Label>Pilih Bank & Produk *</Label>
              <Select
                value={loanFormData.bank}
                onValueChange={(value) =>
                  setLoanFormData({ ...loanFormData, bank: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bank dan produk" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct &&
                    bankProducts[
                      selectedProduct as keyof typeof bankProducts
                    ]?.map((item, index) => (
                      <SelectItem
                        key={index}
                        value={`${item.bank} - ${item.product}`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{item.bank}</span>
                          <span className="text-sm text-gray-600">
                            {item.product}
                          </span>
                          <span className="text-xs text-gray-500">
                            Maksimal: {item.maxAmount}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-[#5680E9] mb-2">
                Informasi Produk {selectedProduct}
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {selectedProduct === "KUR Perumahan PMI" && (
                  <>
                    <li>• Suku bunga: 6% efektif per tahun</li>
                    <li>• Plafon: Hingga Rp 500 juta</li>
                    <li>• Jangka waktu: Hingga 20 tahun</li>
                    <li>• Untuk pembelian atau renovasi rumah</li>
                  </>
                )}
                {selectedProduct === "KUR Rumah Subsidi PMI" && (
                  <>
                    <li>• Suku bunga: 5% efektif per tahun</li>
                    <li>• Plafon: Hingga Rp 150 juta</li>
                    <li>• Jangka waktu: Hingga 20 tahun</li>
                    <li>• Program bersubsidi pemerintah</li>
                  </>
                )}
                {selectedProduct === "KUR Wirausaha PMI" && (
                  <>
                    <li>• Suku bunga: 6% efektif per tahun</li>
                    <li>• Plafon: Hingga Rp 50 juta</li>
                    <li>• Jangka waktu: Hingga 5 tahun</li>
                    <li>• Untuk modal usaha dan investasi</li>
                  </>
                )}
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLoanDialog(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#5680E9] hover:bg-[#8860D0] text-white"
              >
                Ajukan Pinjaman
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* About Lendana Dialog */}
      <Dialog open={showAboutLendana} onOpenChange={setShowAboutLendana}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#5680E9]">
              Tentang Lendana
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#5680E9] mb-3">
                Sebagai Platform Penyelenggara Agregasi Produk dan Layanan Jasa
                Keuangan
              </h3>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  PT. Lendana Digitalindo Nusantara, merupakan perusahaan
                  bergerak dibidang Financial Technology (Fintech) yang telah
                  tercatat di Otoritas Jasa Keuangan (OJK) nomor
                  S-27/3/MS.72/2019. Melalui Peraturan Otoritas Jasa Keuangan
                  (OJK) No. 03 Tahun 2024 tentang Penyelenggara Inovasi Keuangan
                  Sektor Keuangan, Platform Lendana sebagai Penyelenggara
                  Agregasi Produk dan Layanan Jasa Keuangan.
                </p>
                <p>
                  LENDANA membantu Lembaga Jasa Keuangan untuk menyalurkan
                  pembiayaan ke sector produktif diantarnya untuk calon Pekerja
                  Migran Indonesia, Petani dan Nelayan, UMKM secara digital
                  mudah, cepat dan terpercaya.
                </p>
                <p>
                  Lendana akan fokus membantu Lembaga Keuangan penyalur Kredit
                  Usaha Rakyat (KUR) yang diharapkan menjadi solusi pembiayaan
                  yang mudah dan suku bunga rendah.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#5680E9] mb-3">
                Registrasi OJK
              </h3>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  PT. Lendana Digitalindo Nusantara merupakan perusahaan
                  bergerak dibidang Financial Technology (Fintech) yang telah
                  tercatat di Otoritas Jasa Keuangan (OJK) nomor
                  S-27/3/MS.72/2019.
                </p>
                <p>
                  Melalui Peraturan Otoritas Jasa Keuangan (OJK) No. 03 Tahun
                  2024 tentang Penyelenggara Inovasi Keuangan Sektor Keuangan,
                  Platform Lendana sebagai Penyelenggara Agregasi Produk dan
                  Layanan Jasa Keuangan.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#5680E9] mb-3">
                Misi Kami
              </h3>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  LENDANA membantu Lembaga Jasa Keuangan untuk menyalurkan
                  pembiayaan ke sektor produktif diantaranya untuk calon Pekerja
                  Migran Indonesia, Petani dan Nelayan, UMKM secara digital
                  mudah, cepat dan terpercaya.
                </p>
                <p>
                  Lendana akan fokus membantu Lembaga Keuangan penyalur Kredit
                  Usaha Rakyat (KUR) yang diharapkan menjadi solusi pembiayaan
                  yang mudah dan suku bunga rendah.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
