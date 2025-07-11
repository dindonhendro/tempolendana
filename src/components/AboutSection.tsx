import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AboutSectionProps {
  title?: string;
  ojkRegistration?: string;
  ojkRegulation?: string;
  description?: string[];
}

const AboutSection = ({
  title = "About Lendana",
  ojkRegistration = "S-27/3/MS.72/2019",
  ojkRegulation = "No. 03 Tahun 2024",
  description = [
    "PT. Lendana Digitalindo Nusantara, merupakan perusahaan bergerak dibidang Financial Technology (Fintech) yang telah tercatat di Otoritas Jasa Keuangan (OJK).",
    "Melalui Peraturan Otoritas Jasa Keuangan (OJK) No. 03 Tahun 2024 tentang Penyelenggara Inovasi Keuangan Sektor Keuangan, Platform Lendana sebagai Penyelenggara Agregasi Produk dan Layanan Jasa Keuangan.",
    "LENDANA membantu Lembaga Jasa Keuangan untuk menyalurkan pembiayaan ke sector produktif diantarnya untuk calon Pekerja Migran Indonesia, Petani dan Nelayan, UMKM secara digital mudah, cepat dan terpercaya.",
    "Lendana akan fokus membantu Lembaga Keuangan penyalur Kredit Usaha Rakyat (KUR) yang diharapkan menjadi solusi pembiayaan yang mudah dan suku bunga rendah.",
  ],
}: AboutSectionProps) => {
  return (
    <section className="w-full py-16 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#5680E9]">
            {title}
          </h2>
          <div className="flex justify-center">
            <div className="w-20 h-1 bg-[#8860D0] rounded-full"></div>
          </div>
        </div>

        <Card className="shadow-lg border-t-4 border-t-[#5AB9EA]">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Platform Penyelenggara Agregasi Produk dan Layanan Jasa
                  Keuangan
                </h3>
                <div className="flex items-center mb-4">
                  <div className="bg-[#C1C8E4] p-3 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#5680E9]"
                    >
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                      <path d="M13 5v2" />
                      <path d="M13 17v2" />
                      <path d="M13 11v2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">OJK Registration</p>
                    <p className="text-lg font-bold">{ojkRegistration}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-[#C1C8E4] p-3 rounded-full mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#5680E9]"
                    >
                      <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 7 6 13 6 13s6-6 6-13Z" />
                      <circle cx="12" cy="8" r="2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">OJK Regulation</p>
                    <p className="text-lg font-bold">{ojkRegulation}</p>
                  </div>
                </div>
              </div>

              <div>
                {description.map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <Separator className="my-8" />

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex items-center">
                <div className="bg-[#84CEEB] p-3 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <span className="font-medium">Trusted Financial Partner</span>
              </div>

              <div className="flex items-center">
                <div className="bg-[#5AB9EA] p-3 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M12 2v20" />
                    <path d="m17 5-5-3-5 3" />
                    <path d="m17 19-5 3-5-3" />
                    <path d="M2 12h20" />
                    <path d="m5 7-3 5 3 5" />
                    <path d="m19 7 3 5-3 5" />
                  </svg>
                </div>
                <span className="font-medium">Digital Financial Solutions</span>
              </div>

              <div className="flex items-center">
                <div className="bg-[#8860D0] p-3 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="font-medium">
                  Supporting Productive Sectors
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutSection;
