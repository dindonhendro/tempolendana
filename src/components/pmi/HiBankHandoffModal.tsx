import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Send,
  Copy,
  Check,
  Clock,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Building2,
  Sparkles,
} from "lucide-react";
import {
  HiBankReferralData,
  generateWhatsAppHandoffUrl,
} from "@/lib/hibankService";

interface HiBankHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralData: HiBankReferralData | null;
  onOpenSimulator: () => void;
  onRefreshStatus: () => void;
}

export default function HiBankHandoffModal({
  isOpen,
  onClose,
  referralData,
  onOpenSimulator,
  onRefreshStatus,
}: HiBankHandoffModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!referralData) return;

    const updateCountdown = () => {
      const diff = new Date(referralData.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Kedaluwarsa (Expired)");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours} jam ${minutes} mnt ${seconds} dtk`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [referralData]);

  if (!referralData) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralData.smartDeepLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralData.recoveryCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const waUrl = generateWhatsAppHandoffUrl(
      referralData.customerSummary.mobilePhoneNumber,
      referralData.customerSummary.fullName,
      referralData.customerSummary.loanAmount,
      referralData.smartDeepLink,
      referralData.recoveryCode,
      referralData.customerSummary.nik
    );
    window.open(waUrl, "_blank");
  };

  const maskedNik =
    referralData.customerSummary.nik.length >= 16
      ? `${referralData.customerSummary.nik.substring(0, 6)}******${referralData.customerSummary.nik.substring(12)}`
      : referralData.customerSummary.nik;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
        {/* Header with HiBank branding */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <DialogTitle className="text-xl font-bold tracking-tight text-white">
                    Validator Handoff Hub
                  </DialogTitle>
                  <Badge className="bg-blue-500/30 text-white border-white/20 text-xs font-semibold px-2.5">
                    HiTalang by HiBank
                  </Badge>
                </div>
                <DialogDescription className="text-blue-100 text-xs mt-0.5">
                  Pengalihan pengajuan pinjaman calon PMI ke aplikasi digital HiBank
                </DialogDescription>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-blue-100 border border-white/10">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>SNAP BI Compliant</span>
            </div>
          </div>

          {/* Quick Summary Strip */}
          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-blue-200 block">Nama Calon PMI:</span>
              <strong className="text-white font-semibold">{referralData.customerSummary.fullName}</strong>
            </div>
            <div>
              <span className="text-blue-200 block">NIK:</span>
              <strong className="text-white font-mono">{maskedNik}</strong>
            </div>
            <div>
              <span className="text-blue-200 block">Plafon Pinjaman:</span>
              <strong className="text-emerald-300 font-semibold">
                Rp {referralData.customerSummary.loanAmount.toLocaleString("id-ID")}
              </strong>
            </div>
            <div>
              <span className="text-blue-200 block">Status eKYC:</span>
              <span className="inline-flex items-center text-amber-300 font-semibold">
                {referralData.status === "PENDING_EKYC" ? "Menunggu eKYC" : referralData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/50">
          {/* Sisi Kiri: Dynamic QR Code Scanner */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="flex items-center space-x-1.5 text-slate-700 font-semibold text-sm mb-3">
              <QrCode className="h-4 w-4 text-blue-600" />
              <span>Pindai QR Code di Tempat</span>
            </div>

            <div className="p-3 bg-white border-2 border-dashed border-blue-200 rounded-xl shadow-inner mb-3">
              <img
                src={referralData.qrDataUrl}
                alt="HiBank Smart Deep-Link QR Code"
                className="w-48 h-48 object-contain rounded-lg"
              />
            </div>

            <p className="text-xs text-slate-500 max-w-[200px]">
              Minta calon PMI mengarahkan kamera HP ke QR Code di atas untuk membuka HiBank.
            </p>
          </div>

          {/* Sisi Kanan: Action Channels (WhatsApp & Recovery Code) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            {/* Opsi 1: WhatsApp Direct Dispatcher */}
            <Card className="border border-emerald-200 bg-emerald-50/40 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                      <Send className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Kirim Link via WhatsApp
                      </h4>
                      <p className="text-xs text-slate-500">
                        Nomor HP PMI: <span className="font-mono font-medium text-slate-700">{referralData.customerSummary.mobilePhoneNumber}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSendWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4 mr-1" />
                  <span>Buka WhatsApp & Kirim Pesan</span>
                </Button>
              </CardContent>
            </Card>

            {/* Opsi 2: Recovery Code & Copy Link */}
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Kode Pemulihan Cadangan (Manual Recovery Code)
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-100 border border-slate-300 font-mono text-base font-bold text-slate-800 px-3 py-2 rounded-lg text-center tracking-widest">
                      {referralData.recoveryCode}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      className="border-slate-300 hover:bg-slate-100 text-slate-700"
                    >
                      {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      <span className="ml-1.5 text-xs">{copiedCode ? "Tersalin" : "Salin"}</span>
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gunakan kode ini di aplikasi HiBank jika deep-link tidak otomatis memuat formulir.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Sisa Waktu: <strong>{timeLeft}</strong></span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    <span>{copiedLink ? "Link Tersalin" : "Salin Tautan Deep-Link"}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Opsi 3: Simulator Demo eKYC */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-indigo-600" />
                <span className="text-xs text-indigo-900 font-medium">
                  Uji Tampilan eKYC Smartphone PMI (Testing Mode)
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSimulator}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-100 bg-white text-xs h-8"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                <span>Buka Simulator eKYC</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshStatus}
            className="text-xs text-slate-600 hover:text-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span>Refresh Status eKYC</span>
          </Button>

          <Button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-6"
          >
            Selesai / Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
