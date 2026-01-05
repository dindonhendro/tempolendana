/**
 * Immutability Confirmation Dialog
 * 
 * OJK Compliance Component: Displays official confirmation when loan application
 * becomes immutable (cannot be modified after submission).
 * 
 * This dialog can be screenshotted for audit purposes.
 */

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Clock, FileCheck } from "lucide-react";

interface ImmutabilityConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  applicationId: string;
  dataHash?: string;
  submittedAt: string;
  applicantName: string;
  submissionType: string;
}

export default function ImmutabilityConfirmationDialog({
  open,
  onClose,
  transactionId,
  applicationId,
  dataHash,
  submittedAt,
  applicantName,
  submissionType,
}: ImmutabilityConfirmationDialogProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Jakarta",
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl bg-white">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-2xl font-bold text-slate-900">
            Permohonan Pinjaman Berhasil Diajukan
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base text-slate-600">
            Data permohonan telah divalidasi dan tidak dapat diubah lagi
            <br />
            (OJK Compliance - Data Immutability)
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-6">
          {/* Official Notice */}
          <Card className="border-2 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 mb-1">
                    Pemberitahuan Resmi
                  </p>
                  <p className="text-sm text-amber-800">
                    Sesuai ketentuan OJK (Otoritas Jasa Keuangan), data
                    permohonan pinjaman yang telah diajukan bersifat{" "}
                    <strong>immutable (tidak dapat diubah)</strong>. Setiap
                    perubahan data akan tercatat dalam sistem audit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card className="border border-slate-200">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b">
                <h3 className="font-semibold text-slate-900">
                  Detail Permohonan
                </h3>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <FileCheck className="w-3 h-3 mr-1" />
                  Submitted
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Nama Pemohon</p>
                  <p className="font-medium text-slate-900">{applicantName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Jenis Permohonan</p>
                  <p className="font-medium text-slate-900">
                    {submissionType === "KUR_WIRAUSAHA_PMI"
                      ? "KUR Wirausaha PMI"
                      : "PMI Standard"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Transaction ID
                  </p>
                  <p className="font-mono text-sm text-slate-900 break-all">
                    {transactionId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Application ID</p>
                  <p className="font-mono text-sm text-slate-900 break-all">
                    {applicationId.substring(0, 18)}...
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Waktu Pengajuan (WIB)
                  </p>
                  <p className="font-medium text-slate-900">
                    {formatDateTime(submittedAt)}
                  </p>
                </div>
              </div>

              {dataHash && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-slate-500 mb-1">
                    Data Integrity Hash (SHA-256)
                  </p>
                  <p className="font-mono text-xs text-slate-700 bg-slate-50 p-2 rounded break-all">
                    {dataHash}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hash ini menjamin integritas data untuk keperluan audit OJK
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                📸 Petunjuk untuk Dokumentasi:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>
                  Screenshot halaman ini untuk arsip dan bukti pengajuan
                </li>
                <li>
                  Simpan Transaction ID untuk melacak status permohonan Anda
                </li>
                <li>
                  Data hash SHA-256 dapat diverifikasi oleh bank dan OJK
                </li>
                <li>
                  Perubahan apapun pada data akan terdeteksi oleh sistem
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Footer Notes */}
          <div className="text-xs text-slate-500 text-center pt-2">
            <p>PT. Lendana Digitalindo Nusantara</p>
            <p>Terdaftar dan Diawasi oleh OJK</p>
            <p className="mt-1">
              Dokumen ini dibuat secara otomatis oleh sistem pada{" "}
              {formatDateTime(submittedAt)}
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            Saya Mengerti dan Menyimpan Informasi Ini
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
