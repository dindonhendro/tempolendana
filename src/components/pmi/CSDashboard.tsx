import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Shield,
  Users,
  CheckCircle,
  Search,
  FileText,
  Mail,
  Clock,
  User,
  LogOut,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/supabase";

interface CSDashboardProps {
  currentUser: any;
  onSignOut: () => Promise<void>;
}

type SupportTicket = Tables<"support_tickets">;
type ConsentLog = Tables<"user_consent_logs">;
type UserProfile = Tables<"users">;

export default function CSDashboard({ currentUser, onSignOut }: CSDashboardProps) {
  const [activeTab, setActiveTab] = useState<"tickets" | "consent" | "users">("tickets");
  
  // Data States
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [consentLogs, setConsentLogs] = useState<ConsentLog[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  
  // Loading & Filtering States
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Action States
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "tickets") {
        const { data, error } = await supabase
          .from("support_tickets")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setTickets(data || []);
      } else if (activeTab === "consent") {
        const { data, error } = await supabase
          .from("user_consent_logs")
          .select("*")
          .order("consent_at", { ascending: false });
        if (error) throw error;
        setConsentLogs(data || []);
      } else if (activeTab === "users") {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setUsersList(data || []);
      }
    } catch (error: any) {
      console.error(`Error fetching ${activeTab}:`, error);
      alert(`Terjadi kesalahan memuat data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResponseDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setResponseText(ticket.response_details || "");
  };

  const handleSubmitResponse = async (status: "In Progress" | "Resolved") => {
    if (!selectedTicket) return;
    if (!responseText.trim()) {
      alert("Silakan masukkan tanggapan terlebih dahulu.");
      return;
    }

    setSubmittingResponse(true);
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({
          response_details: responseText,
          status: status,
          responded_at: new Date().toISOString(),
          responded_by: currentUser.id,
        })
        .eq("id", selectedTicket.id);

      if (error) throw error;

      alert(`Sukses! Tiket berhasil diperbarui ke status [${status}].`);
      setSelectedTicket(null);
      setResponseText("");
      fetchData();
    } catch (error: any) {
      console.error("Error responding to ticket:", error);
      alert(`Gagal memperbarui tiket: ${error.message}`);
    } finally {
      setSubmittingResponse(false);
    }
  };

  // Filters based on search queries
  const filteredTickets = tickets.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.ticket_id.toLowerCase().includes(query) ||
      t.full_name.toLowerCase().includes(query) ||
      t.email.toLowerCase().includes(query) ||
      t.whatsapp.toLowerCase().includes(query) ||
      (t.complaint_details && t.complaint_details.toLowerCase().includes(query))
    );
  });

  const filteredConsents = consentLogs.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.user_id.toLowerCase().includes(query) ||
      c.document_type.toLowerCase().includes(query) ||
      (c.user_agent && c.user_agent.toLowerCase().includes(query))
    );
  });

  const filteredUsers = usersList.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(query)) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#5680E9] p-2 rounded-lg text-white">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lendana Customer Service</h1>
              <p className="text-xs text-gray-500 font-medium">Layanan Bantuan & Kepatuhan Konsumen</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{currentUser.full_name || "Staff CS"}</p>
              <p className="text-xs text-[#5680E9] font-medium capitalize">{currentUser.role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-800">Daftar Tiket Bantuan</h2>
            {tickets.filter(t => t.status === "Open").length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {tickets.filter(t => t.status === "Open").length} Baru
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Cari di tiket bantuan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm bg-white border-gray-200 focus:border-[#5680E9] focus:ring-[#5680E9]"
            />
          </div>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5680E9] mb-4"></div>
            <p className="font-medium text-sm">Memuat data dari database...</p>
          </div>
        ) : (
          <div>
            {/* TICKET TAB */}
            {activeTab === "tickets" && (
              <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                  <Card className="border-gray-200">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
                      <HelpCircle className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="font-semibold text-base text-gray-700">Tidak Ada Tiket</p>
                      <p className="text-sm text-gray-500 text-center max-w-xs mt-1">
                        Belum ada tiket bantuan yang diajukan oleh pengguna atau filter pencarian tidak cocok.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredTickets.map((ticket) => (
                      <Card key={ticket.id} className="border-gray-200 hover:shadow-md transition-shadow duration-200 bg-white">
                        <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-gray-900 font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                              {ticket.ticket_id}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{ticket.full_name}</span>
                              <div className="flex items-center text-xs text-gray-500 gap-3 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> {ticket.email}
                                </span>
                                <span>•</span>
                                <span>WA: {ticket.whatsapp}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              ticket.status === "Open" 
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : ticket.status === "In Progress"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-green-50 text-green-700 border border-green-200"
                            }`}>
                              {ticket.status}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Keluhan Pelanggan:</p>
                              <p className="text-sm text-gray-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                                {ticket.complaint_details}
                              </p>
                            </div>

                            {/* Response history */}
                            {ticket.response_details && (
                              <div className="border-t border-dashed border-gray-100 pt-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  Tanggapan CS (Tersimpan):
                                </p>
                                <p className="text-sm text-gray-800 bg-green-50/50 p-3 rounded-lg border border-green-100/50 whitespace-pre-wrap">
                                  {ticket.response_details}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 justify-end">
                                  <Clock className="h-3 w-3" /> 
                                  Ditanggapi pada: {new Date(ticket.responded_at || "").toLocaleString()}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Masuk pada: {new Date(ticket.created_at).toLocaleString()}
                              </span>
                              <Button
                                onClick={() => handleOpenResponseDialog(ticket)}
                                size="sm"
                                className="bg-[#5680E9] text-white hover:bg-[#436cd1] flex items-center gap-1"
                              >
                                <MessageSquare className="h-4 w-4" />
                                {ticket.response_details ? "Ubah Tanggapan / Update" : "Tanggapi Tiket"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CONSENT TAB */}
            {activeTab === "consent" && (
              <Card className="border-gray-200 bg-white">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User ID</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe Dokumen</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Versi</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Persetujuan Pada</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Browser (User Agent)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                      {filteredConsents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            Tidak ada log consent yang ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredConsents.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-900 font-semibold">{log.user_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium capitalize">
                              {log.document_type.replace(/_/g, " ")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">{log.document_version || "1.0"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                log.consent_given 
                                  ? "bg-green-50 text-green-700 border border-green-100" 
                                  : "bg-red-50 text-red-700 border border-red-100"
                              }`}>
                                {log.consent_given ? "Setuju" : "Ditolak"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                              {new Date(log.consent_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-xs">
                              {(log.ip_address as string) || "-"}
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate text-xs text-gray-500" title={log.user_agent || ""}>
                              {log.user_agent || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              <Card className="border-gray-200 bg-white">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Pengguna</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Registrasi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            Tidak ada profil user yang ditemukan.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">{user.full_name || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">{user.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                              {new Date(user.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Response/Tanggapan Dialog */}
      <Dialog open={selectedTicket !== null} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#5680E9]" />
              Form Tanggapan CS
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 mt-2">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-xs text-gray-600">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-bold text-gray-400">ID Tiket:</span>
                    <p className="font-mono text-gray-800 font-semibold">{selectedTicket.ticket_id}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400">Pengirim:</span>
                    <p className="text-gray-800 font-semibold">{selectedTicket.full_name}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400">Email:</span>
                    <p className="text-gray-800 font-semibold">{selectedTicket.email}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400">WhatsApp:</span>
                    <p className="text-gray-800 font-semibold">{selectedTicket.whatsapp}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200/50 pt-2 mt-2">
                  <span className="font-bold text-gray-400">Isi Keluhan:</span>
                  <p className="text-gray-700 whitespace-pre-wrap mt-0.5 bg-white p-2 rounded border border-gray-100 max-h-32 overflow-y-auto">
                    {selectedTicket.complaint_details}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="cs-response" className="text-sm font-bold text-gray-700">
                  Tulis Tanggapan Anda:
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  *Tanggapan ini disimpan di database untuk audit keluhan OJK. Pengiriman formal ke pengguna tetap dikirim manual via email/WhatsApp.
                </p>
                <Textarea
                  id="cs-response"
                  placeholder="Ketik tanggapan Anda atau solusi keluhan di sini..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  className="w-full border-gray-200 focus:border-[#5680E9] focus:ring-[#5680E9] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTicket(null)}
                  disabled={submittingResponse}
                  className="text-gray-600 border-gray-200"
                >
                  Batal
                </Button>
                <Button
                  onClick={() => handleSubmitResponse("In Progress")}
                  disabled={submittingResponse}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                >
                  Proses Keluhan
                </Button>
                <Button
                  onClick={() => handleSubmitResponse("Resolved")}
                  disabled={submittingResponse}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  Selesaikan Tiket
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
