import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, RefreshCw, History, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const AuditLogsAdmin = ({ onBack }: { onBack: () => void }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLog, setSelectedLog] = useState<any | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('audit_logs' as any)
                .select(`
                    *,
                    users:changed_by (
                        email,
                        full_name
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) throw error;
            setLogs(data || []);
        } catch (err: any) {
            console.error("Failed to fetch audit logs", err);
            alert("Gagal memuat audit log: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'INSERT': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">CREATE</span>;
            case 'UPDATE': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">UPDATE</span>;
            case 'DELETE': return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">DELETE</span>;
            default: return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{action}</span>;
        }
    };

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
                                <History className="h-6 w-6 text-indigo-600" />
                                Audit Trail System (OJK)
                            </h1>
                            <p className="text-slate-500 text-sm">Rekaman aktivitas operasional dan perubahan data sistem</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Cari tabel, aksi, atau user..."
                                className="pl-9 w-64 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={fetchLogs}
                            variant="outline"
                            disabled={loading}
                            className="bg-white"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="border-none shadow-lg overflow-hidden h-[calc(100vh-180px)]">
                            <CardContent className="p-0 h-full">
                                <div className="overflow-auto h-full bg-white">
                                    <Table>
                                        <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead>Waktu</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Tabel</TableHead>
                                                <TableHead>Aksi</TableHead>
                                                <TableHead className="text-right">Detail</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading && logs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-20">
                                                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
                                                        <p className="text-slate-500">Memuat audit log...</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredLogs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-20">
                                                        <History className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                                                        <p className="text-slate-500 text-lg">Tidak ada data audit</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredLogs.map((log) => (
                                                    <TableRow
                                                        key={log.id}
                                                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-indigo-50/50' : ''}`}
                                                        onClick={() => setSelectedLog(log)}
                                                    >
                                                        <TableCell className="text-xs whitespace-nowrap">
                                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-xs font-medium">{log.users?.full_name || 'System'}</div>
                                                            <div className="text-[10px] text-slate-500">{log.users?.email || '-'}</div>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-xs text-indigo-600">{log.table_name}</TableCell>
                                                        <TableCell>{getActionBadge(log.action)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-lg h-[calc(100vh-180px)] overflow-hidden">
                            <CardHeader className="border-b bg-slate-50/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-indigo-600" />
                                    Data Comparison
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 h-[calc(100%-70px)] overflow-auto">
                                {selectedLog ? (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-wider">Metatada</h3>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="text-slate-500">Record ID:</div>
                                                <div className="font-mono break-all">{selectedLog.record_id}</div>
                                                <div className="text-slate-500">Tabel:</div>
                                                <div className="font-bold">{selectedLog.table_name}</div>
                                                <div className="text-slate-500">Waktu:</div>
                                                <div>{new Date(selectedLog.created_at).toLocaleString()}</div>
                                            </div>
                                        </div>

                                        {selectedLog.old_data && (
                                            <div>
                                                <h3 className="text-sm font-bold text-red-600 mb-2 uppercase tracking-wider">Before Change</h3>
                                                <pre className="p-3 bg-red-50 text-red-800 rounded-lg text-[10px] overflow-x-auto border border-red-100">
                                                    {JSON.stringify(selectedLog.old_data, null, 2)}
                                                </pre>
                                            </div>
                                        )}

                                        {selectedLog.new_data && (
                                            <div>
                                                <h3 className="text-sm font-bold text-green-600 mb-2 uppercase tracking-wider">After Change</h3>
                                                <pre className="p-3 bg-green-50 text-green-800 rounded-lg text-[10px] overflow-x-auto border border-green-100">
                                                    {JSON.stringify(selectedLog.new_data, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <History className="h-12 w-12 mb-2 opacity-20" />
                                        <p className="text-sm">Pilih satu baris untuk melihat detail perubahan data</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogsAdmin;
