import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, RefreshCw, FileText, ShieldCheck } from "lucide-react";

const ConsentLogsAdmin = ({ onBack }: { onBack: () => void }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("ConsentLogsAdmin DEBUG:", {
            currentUser: user?.email,
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
            timestamp: new Date().toISOString()
        });
        setLoading(true);
        try {
            const { data, error, count } = await supabase
                .from('user_consent_logs')
                .select(`
          id,
          document_type,
          document_version,
          consent_given,
          consent_at,
          ip_address,
          user_agent,
          source,
          user_id,
          users:user_id (
            email,
            full_name
          )
        `, { count: 'exact' });

            if (error) {
                console.error("ConsentLogsAdmin: Supabase Error:", error);
                throw error;
            }

            console.log("ConsentLogsAdmin: Data received, count:", count, "items:", data?.length);
            setLogs(data || []);
        } catch (err: any) {
            console.error("ConsentLogsAdmin: Exception caught:", err);
            alert("Gagal memuat log: " + (err.message || String(err)));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            onClick={onBack}
                            className="flex items-center space-x-2 bg-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Kembali</span>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="h-6 w-6 text-blue-600" />
                                Evidence of Consent (OJK)
                            </h1>
                            <p className="text-slate-500 text-sm">Rekaman persetujuan Syarat & Ketentuan serta Kebijakan Privasi</p>
                        </div>
                    </div>
                    <Button
                        onClick={fetchLogs}
                        variant="outline"
                        disabled={loading}
                        className="flex items-center space-x-2 bg-white"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Muat Ulang</span>
                    </Button>
                </div>

                <Card className="border-none shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-20 bg-white">
                                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
                                <p className="text-slate-500">Memuat data consent...</p>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-20 bg-white">
                                <FileText className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                                <p className="text-slate-500 text-lg">Belum ada rekaman persetujuan</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto bg-white">
                                <div className="p-4 bg-blue-50 text-blue-700 text-xs border-b">
                                    DEBUG: Total records in state: {logs.length}
                                </div>
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-900">User ID</TableHead>
                                            <TableHead className="font-bold text-slate-900">User Info</TableHead>
                                            <TableHead className="font-bold text-slate-900">Dokumen</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-center">Versi</TableHead>
                                            <TableHead className="font-bold text-slate-900 text-center">Status</TableHead>
                                            <TableHead className="font-bold text-slate-900">Waktu Persetujuan</TableHead>
                                            <TableHead className="font-bold text-slate-900">IP Address</TableHead>
                                            <TableHead className="font-bold text-slate-900">Browser/Agent</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map((log) => (
                                            <TableRow key={log.id} className="hover:bg-slate-50/50">
                                                <TableCell className="font-mono text-[10px] text-slate-500 max-w-[120px] truncate" title={log.user_id}>
                                                    {log.user_id || 'ANONYMOUS'}
                                                </TableCell>
                                                <TableCell className="max-w-[180px]">
                                                    <div className="text-sm font-medium text-slate-900 truncate">
                                                        {log.users?.full_name || '-'}
                                                    </div>
                                                    <div className="text-xs text-slate-500 truncate">
                                                        {log.users?.email || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="capitalize font-medium text-slate-700">
                                                    {log.document_type.replace('_', ' ')}
                                                </TableCell>
                                                <TableCell className="text-center text-slate-600">{log.document_version || '1.0'}</TableCell>
                                                <TableCell className="text-center">
                                                    {log.consent_given ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            SETUJU
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            TIDAK
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    {new Date(log.consent_at).toLocaleString('id-ID', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-slate-600 font-mono text-xs">{log.ip_address || 'N/A'}</TableCell>
                                                <TableCell className="text-slate-400 text-[10px] max-w-[200px] truncate" title={log.user_agent}>
                                                    {log.user_agent || 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ConsentLogsAdmin;