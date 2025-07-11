import React from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

const HeroSection = ({
  title = "Lendana Financial Access Platform",
  subtitle = "Membantu Masyarakat mendapatkan akses Pembiayaan",
  description = "Membantu Masyarakat mendapatkan akses Pembiayaan ke Lembaga Keuangan dan channeling Kredit Usaha Rakyat (KUR)",
  ctaText = "Pelajari Lebih Lanjut",
  onCtaClick = () => console.log("CTA clicked"),
}: HeroSectionProps) => {
  return (
    <div className="w-full bg-gradient-to-br from-[#5680E9] via-[#84CEEB] to-[#8860D0] min-h-[600px] flex items-center justify-center px-4 md:px-8 lg:px-16 py-16">
      <div className="max-w-7xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col space-y-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                {title}
              </h1>
              <h2 className="text-xl md:text-2xl font-medium text-white/90">
                {subtitle}
              </h2>
            </div>
            <p className="text-lg text-white/80 max-w-lg">{description}</p>
            <div>
              <Button
                onClick={onCtaClick}
                size="lg"
                className="bg-white text-[#5680E9] hover:bg-white/90 hover:text-[#5680E9]/90 font-medium text-lg px-8 py-6 h-auto"
              >
                {ctaText}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:flex justify-center items-center"
          >
            <div className="bg-white/20 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/30 w-full max-w-md">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[#5680E9] text-3xl font-bold">L</span>
                </div>
              </div>
              <div className="space-y-4 text-center">
                <h3 className="text-2xl font-bold text-white">
                  Platform Agregator Keuangan
                </h3>
                <p className="text-white/80">
                  Terdaftar di Otoritas Jasa Keuangan (OJK) dengan nomor
                  S-27/3/MS.72/2019
                </p>
                <div className="pt-4 flex justify-center">
                  <div className="flex space-x-2">
                    {[
                      "#5680E9",
                      "#84CEEB",
                      "#5AB9EA",
                      "#C1C8E4",
                      "#8860D0",
                    ].map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
