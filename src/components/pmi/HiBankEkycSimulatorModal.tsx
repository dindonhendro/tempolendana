import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Smartphone,
  CheckCircle2,
  Lock,
  Camera,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { HiBankReferralData, updateHiBankStatus } from "@/lib/hibankService";

interface HiBankEkycSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralData: HiBankReferralData | null;
  onEkycCompleted: () => void;
}

export default function HiBankEkycSimulatorModal({
  isOpen,
  onClose,
  referralData,
  onEkycCompleted,
}: HiBankEkycSimulatorModalProps) {
  const [step, setStep] = useState<"PREFILL_OTP" | "LIVENESS" | "SUCCESS">("PREFILL_OTP");
  const [otpCode, setOtpCode] = useState<string>("8912");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [livenessProgress, setLivenessProgress] = useState<number>(0);

  if (!referralData) return null;

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep("LIVENESS");
    }, 1000);
  };

  const handleStartLiveness = () => {
    setIsVerifying(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setLivenessProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsVerifying(false);
        // Mark as completed in service
        updateHiBankStatus(referralData.applicationId, "EKYC_COMPLETED");
        setStep("SUCCESS");
        onEkycCompleted();
      }
    }, 600);
  };

  const resetSimulator = () => {
    setStep("PREFILL_OTP");
    setLivenessProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetSimulator}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-2xl rounded-3xl text-slate-100">
        {/* Mobile Device Frame Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-mono text-slate-400 ml-2">HiBank Mobile Simulator</span>
          </div>
          <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30">
            Preview Smartphone PMI
          </Badge>
        </div>

        {/* HiBank Native App Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-200" />
              <span className="font-bold tracking-tight text-sm">HiBank Digital</span>
            </div>
            <div className="flex items-center space-x-1 text-xs bg-white/10 px-2 py-0.5 rounded-full">
              <Lock className="h-3 w-3 text-emerald-300" />
              <span>eKYC HiTalang</span>
            </div>
          </div>
        </div>

        {/* Screen 1: Pre-filled Review & OTP */}
        {step === "PREFILL_OTP" && (
          <div className="p-5 space-y-4 bg-slate-900">
            <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3.5 flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-blue-200">Data Terisi Otomatis via Lendana</p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Identitas Anda telah diverifikasi oleh mitra Lendana. Silakan periksa dan konfirmasi kode OTP.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <Label className="text-slate-400 text-[11px]">Nama Lengkap (e-KTP)</Label>
                <div className="mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-medium flex items-center justify-between">
                  <span>{referralData.customerSummary.fullName}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-400 text-[11px]">NIK</Label>
                  <div className="mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-lg font-mono text-slate-100 font-medium">
                    {referralData.customerSummary.nik}
                  </div>
                </div>
                <div>
                  <Label className="text-slate-400 text-[11px]">No. Handphone</Label>
                  <div className="mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-lg font-mono text-slate-100 font-medium">
                    {referralData.customerSummary.mobilePhoneNumber}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-slate-400 text-[11px]">Fasilitas Kredit</Label>
                <div className="mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 flex justify-between items-center">
                  <span>HiTalang PMI (Taiwan)</span>
                  <strong className="text-emerald-400 font-semibold">
                    Rp {referralData.customerSummary.loanAmount.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              <div className="pt-2">
                <Label className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>Masukkan 4 Digit Kode SMS OTP</span>
                  <span className="text-blue-400 text-[10px] cursor-pointer">Kirim Ulang OTP</span>
                </Label>
                <div className="mt-1 flex items-center space-x-2">
                  <Input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={4}
                    className="bg-slate-800 border-slate-700 text-center font-mono text-lg font-bold tracking-widest text-white"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleVerifyOtp}
              disabled={isVerifying || otpCode.length < 4}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl shadow-lg mt-2"
            >
              {isVerifying ? "Memverifikasi OTP..." : "Konfirmasi OTP & Lanjut eKYC"}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        )}

        {/* Screen 2: Liveness Face Match Verification */}
        {step === "LIVENESS" && (
          <div className="p-5 text-center space-y-4 bg-slate-900">
            <div>
              <h3 className="text-base font-bold text-white">Verifikasi Wajah (Liveness Test)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Posisikan wajah Anda tepat di dalam bingkai oval di bawah ini.
              </p>
            </div>

            <div className="relative mx-auto w-48 h-56 rounded-full border-4 border-dashed border-blue-500 bg-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              <Camera className="h-12 w-12 text-slate-500 mb-2" />
              {isVerifying ? (
                <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                  <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs font-semibold text-white">Memindai... {livenessProgress}%</span>
                  <span className="text-[10px] text-blue-200 mt-1">Kedipkan mata perlahan</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 px-4">Siap untuk memindai wajah</span>
              )}
            </div>

            <Button
              onClick={handleStartLiveness}
              disabled={isVerifying}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl shadow-lg"
            >
              {isVerifying ? "Sedang Memverifikasi..." : "Mulai Verifikasi Biometrik Wajah"}
            </Button>
          </div>
        )}

        {/* Screen 3: eKYC Success */}
        {step === "SUCCESS" && (
          <div className="p-6 text-center space-y-4 bg-slate-900">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Verifikasi eKYC Berhasil!</h3>
              <p className="text-xs text-slate-300 mt-1">
                Fasilitas pinjaman <strong>HiTalang</strong> Anda sebesar{" "}
                <strong>Rp {referralData.customerSummary.loanAmount.toLocaleString("id-ID")}</strong> telah disetujui.
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl text-left text-xs space-y-1.5 border border-slate-700 text-slate-300">
              <div className="flex justify-between">
                <span>Partner Reference:</span>
                <span className="font-mono text-white">{referralData.partnerReferenceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>HiBank Reference:</span>
                <span className="font-mono text-emerald-400">{referralData.hibankReferenceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Status Sinkronisasi:</span>
                <span className="text-emerald-400 font-semibold">Tersinkron ke Lendana</span>
              </div>
            </div>

            <Button
              onClick={resetSimulator}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2.5 rounded-xl"
            >
              Tutup Simulator
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
