import React from "react";
import HeroSection from "./HeroSection";
import PartnerBanks from "./PartnerBanks";
import ProductTabs from "./ProductTabs";
import AboutSection from "./AboutSection";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      {/* Partner Banks Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Banking Partners</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Lendana works with trusted financial institutions to provide you
            with the best financial services and solutions.
          </p>
        </div>
        <PartnerBanks />
      </section>
      {/* Product Tabs Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-[#C1C8E4] to-[#84CEEB]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Products</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Explore our range of financial products designed to meet the needs
              of various sectors.
            </p>
          </div>
          <ProductTabs />
        </div>
      </section>

      {/* P3MI Business Development Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#5680E9]">
              Pengembangan Usaha P3MI
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pinjaman khusus untuk pengembangan usaha P3MI/Agent dengan proses
              yang mudah dan bunga kompetitif.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-[#5680E9]">
                Keunggulan Program
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#5680E9] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Proses Cepat
                    </h4>
                    <p className="text-gray-600">
                      Agent mengisi form, diverifikasi Lendana, langsung ke bank
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#5680E9] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Khusus Business Loan
                    </h4>
                    <p className="text-gray-600">
                      Produk bank yang ditampilkan hanya Business Loan
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#5680E9] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Dokumentasi Lengkap
                    </h4>
                    <p className="text-gray-600">
                      Upload 16 dokumen pendukung untuk kelengkapan aplikasi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#5680E9] to-[#8860D0] p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-6">Alur Pengajuan</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white text-[#5680E9] rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <span>Data Perusahaan P3MI</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white text-[#5680E9] rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <span>Upload 16 Dokumen</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white text-[#5680E9] rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <span>Data Pinjaman & Pilihan Bank</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => (window.location.href = "/p3mi-business-loan")}
                  className="w-full bg-white text-[#5680E9] font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors duration-300"
                >
                  Ajukan Pinjaman Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">About Lendana</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn more about our mission, vision, and regulatory compliance.
          </p>
        </div>
        <AboutSection />
      </section>
      {/* Contact Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-[#5680E9] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="max-w-2xl mx-auto">
              Get in touch with our team for more information about our
              services.
            </p>
          </div>

          <Card className="bg-white text-black shadow-xl">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    PT Lendana Digitalindo Nusantara
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-[#8860D0] mt-1" />
                      <div>
                        <p className="font-medium">Office Address:</p>
                        <p>Sovereign 78 E1</p>
                        <p>Jalan Raya Kemang Raya 78</p>
                        <p>Jakarta Selatan 12730</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-[#8860D0]" />
                      <div>
                        <p className="font-medium">Email:</p>
                        <a
                          href="mailto:admin@lendana.id"
                          className="text-[#5680E9] hover:underline"
                        >
                          admin@lendana.id
                        </a>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-[#8860D0]" />
                      <div>
                        <p className="font-medium">Phone:</p>
                        <a
                          href="tel:+6281381111135"
                          className="text-[#5680E9] hover:underline"
                        >
                          0813.8111.1135
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="bg-gradient-to-br from-[#5AB9EA] to-[#8860D0] p-8 rounded-lg text-white text-center w-full">
                    <h3 className="text-xl font-bold mb-4">Call Center</h3>
                    <p className="mb-4">
                      Our customer service team is available to assist you with
                      any inquiries.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <a
                        href="tel:+6281381111135"
                        className="bg-white text-[#5680E9] px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-colors"
                      >
                        Call Now
                      </a>
                      <a
                        href="mailto:admin@lendana.id"
                        className="bg-white text-[#5680E9] px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-colors"
                      >
                        Email Us
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Lendana</h3>
              <p className="text-gray-400 text-sm mt-1">
                Financial Technology Aggregator Platform
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} PT Lendana Digitalindo Nusantara.
                All rights reserved.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Registered with OJK: S-27/3/MS.72/2019
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
