import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AccessLevel {
  read: boolean;
  write: boolean;
  delete: boolean;
  approve?: boolean;
}

interface ModuleAccess {
  [key: string]: AccessLevel;
}

interface RoleAccess {
  [roleName: string]: ModuleAccess;
}

const UserAccessMatrix = () => {
  // Define all system modules/features
  const modules = [
    'Loan Applications',
    'User Management', 
    'Agent Companies',
    'Bank Management',
    'Bank Products',
    'Bank Reviews',
    'Insurance Management',
    'Collector Management',
    'Transaction Tracking',
    'Cost Components (Komponen Biaya)',
    'Document Management',
    'Reports & Analytics',
    'System Administration'
  ];

  // Define access matrix for each role
  const accessMatrix: RoleAccess = {
    'user': {
      'Loan Applications': { read: true, write: true, delete: false },
      'User Management': { read: true, write: true, delete: false }, // Own profile only
      'Agent Companies': { read: true, write: false, delete: false },
      'Bank Management': { read: true, write: false, delete: false },
      'Bank Products': { read: true, write: false, delete: false },
      'Bank Reviews': { read: false, write: false, delete: false },
      'Insurance Management': { read: false, write: false, delete: false },
      'Collector Management': { read: false, write: false, delete: false },
      'Transaction Tracking': { read: true, write: false, delete: false }, // Own transactions only
      'Cost Components (Komponen Biaya)': { read: true, write: true, delete: false },
      'Document Management': { read: true, write: true, delete: false }, // Own documents only
      'Reports & Analytics': { read: false, write: false, delete: false },
      'System Administration': { read: false, write: false, delete: false }
    },
    'agent': {
      'Loan Applications': { read: true, write: true, delete: false, approve: false },
      'User Management': { read: true, write: true, delete: false }, // Own profile + assigned users
      'Agent Companies': { read: true, write: true, delete: false }, // Own company only
      'Bank Management': { read: true, write: false, delete: false },
      'Bank Products': { read: true, write: false, delete: false },
      'Bank Reviews': { read: true, write: false, delete: false },
      'Insurance Management': { read: true, write: false, delete: false },
      'Collector Management': { read: true, write: false, delete: false },
      'Transaction Tracking': { read: true, write: true, delete: false }, // Assigned applications
      'Cost Components (Komponen Biaya)': { read: true, write: true, delete: false },
      'Document Management': { read: true, write: true, delete: false }, // Assigned applications
      'Reports & Analytics': { read: true, write: false, delete: false }, // Limited scope
      'System Administration': { read: false, write: false, delete: false }
    },
    'checker_agent': {
      'Loan Applications': { read: true, write: true, delete: false, approve: true },
      'User Management': { read: true, write: true, delete: false },
      'Agent Companies': { read: true, write: true, delete: false },
      'Bank Management': { read: true, write: false, delete: false },
      'Bank Products': { read: true, write: false, delete: false },
      'Bank Reviews': { read: true, write: true, delete: false },
      'Insurance Management': { read: true, write: true, delete: false },
      'Collector Management': { read: true, write: true, delete: false },
      'Transaction Tracking': { read: true, write: true, delete: false },
      'Cost Components (Komponen Biaya)': { read: true, write: true, delete: false },
      'Document Management': { read: true, write: true, delete: false },
      'Reports & Analytics': { read: true, write: true, delete: false },
      'System Administration': { read: false, write: false, delete: false }
    },
    'validator': {
      'Loan Applications': { read: true, write: true, delete: false, approve: true },
      'User Management': { read: true, write: false, delete: false },
      'Agent Companies': { read: true, write: false, delete: false },
      'Bank Management': { read: true, write: false, delete: false },
      'Bank Products': { read: true, write: false, delete: false },
      'Bank Reviews': { read: true, write: false, delete: false },
      'Insurance Management': { read: true, write: false, delete: false },
      'Collector Management': { read: true, write: false, delete: false },
      'Transaction Tracking': { read: true, write: true, delete: false },
      'Cost Components (Komponen Biaya)': { read: true, write: true, delete: false },
      'Document Management': { read: true, write: true, delete: false },
      'Reports & Analytics': { read: true, write: false, delete: false },
      'System Administration': { read: false, write: false, delete: false }
    },
    'bank_staff': {
      'Loan Applications': { read: true, write: true, delete: false, approve: true },
      'User Management': { read: true, write: true, delete: false }, // Own profile + bank staff
      'Agent Companies': { read: true, write: false, delete: false },
      'Bank Management': { read: true, write: true, delete: false }, // Own bank only
      'Bank Products': { read: true, write: true, delete: false }, // Own bank products
      'Bank Reviews': { read: true, write: true, delete: false },
      'Insurance Management': { read: true, write: false, delete: false },
      'Collector Management': { read: true, write: false, delete: false },
      'Transaction Tracking': { read: true, write: true, delete: false },
      'Cost Components (Komponen Biaya)': { read: true, write: false, delete: false },
      'Document Management': { read: true, write: false, delete: false },
      'Reports & Analytics': { read: true, write: true, delete: false }, // Bank-specific reports
      'System Administration': { read: false, write: false, delete: false }
    },
    'insurance': {
      'Loan Applications': { read: true, write: true, delete: false },
      'User Management': { read: true, write: true, delete: false }, // Own profile + insurance staff
      'Agent Companies': { read: true, write: false, delete: false },
      'Bank Management': { read: true, write: false, delete: false },
      'Bank Products': { read: true, write: false, delete: false },
      'Bank Reviews': { read: true, write: false, delete: false },
      'Insurance Management': { read: true, write: true, delete: true }, // Full insurance access
      'Collector Management': { read: true, write: false, delete: false },
      'Transaction Tracking': { read: true, write: true, delete: false },
      'Cost Components (Komponen Biaya)': { read: true, write: false, delete: false },
      'Document Management': { read: true, write: true, delete: false }, // Insurance documents
      'Reports & Analytics': { read: true, write: true, delete: false }, // Insurance reports
      'System Administration': { read: false, write: false, delete: false }
    },
    'collector': {
      'Loan Applications': { read: true, write: true, delete: false },
      'User Management': { read: true, write: true, delete: false }, // Own profile + collector staff
      'Agent Companies': { read: true, write: false, delete: false },
      'Bank Management': { read: true, write: false, delete: false },
      'Bank Products': { read: true, write: false, delete: false },
      'Bank Reviews': { read: true, write: false, delete: false },
      'Insurance Management': { read: true, write: false, delete: false },
      'Collector Management': { read: true, write: true, delete: true }, // Full collector access
      'Transaction Tracking': { read: true, write: true, delete: false },
      'Cost Components (Komponen Biaya)': { read: true, write: false, delete: false },
      'Document Management': { read: true, write: true, delete: false }, // Collection documents
      'Reports & Analytics': { read: true, write: true, delete: false }, // Collection reports
      'System Administration': { read: false, write: false, delete: false }
    },
    'wirausaha': {
      'Loan Applications': { read: true, write: true, delete: false }, // KUR Wirausaha applications
      'User Management': { read: true, write: true, delete: false }, // Own profile only
      'Agent Companies': { read: true, write: false, delete: false },
      'Bank Management': { read: true, write: false, delete: false },
      'Bank Products': { read: true, write: false, delete: false }, // KUR products only
      'Bank Reviews': { read: false, write: false, delete: false },
      'Insurance Management': { read: false, write: false, delete: false },
      'Collector Management': { read: false, write: false, delete: false },
      'Transaction Tracking': { read: true, write: false, delete: false }, // Own transactions only
      'Cost Components (Komponen Biaya)': { read: true, write: true, delete: false },
      'Document Management': { read: true, write: true, delete: false }, // Own documents only
      'Reports & Analytics': { read: false, write: false, delete: false },
      'System Administration': { read: false, write: false, delete: false }
    },
    'perusahaan': {
      'Loan Applications': { read: true, write: true, delete: false }, // Company loan applications
      'User Management': { read: true, write: true, delete: false }, // Company employees
      'Agent Companies': { read: true, write: false, delete: false },
      'Bank Management': { read: true, write: false, delete: false },
      'Bank Products': { read: true, write: false, delete: false },
      'Bank Reviews': { read: true, write: false, delete: false },
      'Insurance Management': { read: true, write: false, delete: false },
      'Collector Management': { read: true, write: false, delete: false },
      'Transaction Tracking': { read: true, write: true, delete: false }, // Company transactions
      'Cost Components (Komponen Biaya)': { read: true, write: true, delete: false },
      'Document Management': { read: true, write: true, delete: false }, // Company documents
      'Reports & Analytics': { read: true, write: false, delete: false }, // Company reports
      'System Administration': { read: false, write: false, delete: false }
    },
    'admin': {
      'Loan Applications': { read: true, write: true, delete: true, approve: true },
      'User Management': { read: true, write: true, delete: true }, // Full user management
      'Agent Companies': { read: true, write: true, delete: true },
      'Bank Management': { read: true, write: true, delete: true },
      'Bank Products': { read: true, write: true, delete: true },
      'Bank Reviews': { read: true, write: true, delete: true },
      'Insurance Management': { read: true, write: true, delete: true },
      'Collector Management': { read: true, write: true, delete: true },
      'Transaction Tracking': { read: true, write: true, delete: true },
      'Cost Components (Komponen Biaya)': { read: true, write: true, delete: true },
      'Document Management': { read: true, write: true, delete: true },
      'Reports & Analytics': { read: true, write: true, delete: true },
      'System Administration': { read: true, write: true, delete: true }
    }
  };

  const getAccessIcon = (hasAccess: boolean) => {
    return hasAccess ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getApprovalIcon = (canApprove?: boolean) => {
    if (canApprove === undefined) return null;
    return canApprove ? (
      <AlertCircle className="h-4 w-4 text-blue-600" />
    ) : null;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'user': 'bg-gray-100 text-gray-800',
      'agent': 'bg-blue-100 text-blue-800',
      'checker_agent': 'bg-indigo-100 text-indigo-800',
      'validator': 'bg-purple-100 text-purple-800',
      'bank_staff': 'bg-green-100 text-green-800',
      'insurance': 'bg-yellow-100 text-yellow-800',
      'collector': 'bg-orange-100 text-orange-800',
      'wirausaha': 'bg-pink-100 text-pink-800',
      'perusahaan': 'bg-cyan-100 text-cyan-800',
      'admin': 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Matriks Akses User - Aplikasi Lendana
            </CardTitle>
            <div className="text-center text-sm text-gray-600 mt-2">
              <p>Laporan akses sistem berdasarkan role pengguna</p>
              <p className="mt-1">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" /> = Akses Diberikan
                </span>
                <span className="inline-flex items-center gap-1 ml-4">
                  <XCircle className="h-4 w-4 text-red-600" /> = Tidak Ada Akses
                </span>
                <span className="inline-flex items-center gap-1 ml-4">
                  <AlertCircle className="h-4 w-4 text-blue-600" /> = Dapat Approve
                </span>
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {/* Role Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Ringkasan Role Sistem</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.keys(accessMatrix).map((role) => (
                  <Badge key={role} className={getRoleBadgeColor(role)}>
                    {role.replace('_', ' ').toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Access Matrix Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Modul/Fitur</TableHead>
                    {Object.keys(accessMatrix).map((role) => (
                      <TableHead key={role} className="text-center min-w-[120px]">
                        <Badge className={getRoleBadgeColor(role)}>
                          {role.replace('_', ' ')}
                        </Badge>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module}>
                      <TableCell className="font-medium">{module}</TableCell>
                      {Object.keys(accessMatrix).map((role) => {
                        const access = accessMatrix[role][module];
                        return (
                          <TableCell key={`${role}-${module}`} className="text-center">
                            <div className="flex justify-center items-center gap-1">
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex gap-1">
                                  <div title="Read">{getAccessIcon(access.read)}</div>
                                  <div title="Write">{getAccessIcon(access.write)}</div>
                                  <div title="Delete">{getAccessIcon(access.delete)}</div>
                                  {getApprovalIcon(access.approve)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  R/W/D{access.approve ? '/A' : ''}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Keterangan:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><strong>R</strong> = Read (Baca)</div>
                <div><strong>W</strong> = Write (Tulis/Edit)</div>
                <div><strong>D</strong> = Delete (Hapus)</div>
                <div><strong>A</strong> = Approve (Setujui)</div>
              </div>
              
              <div className="mt-4">
                <h5 className="font-semibold mb-2">Catatan Khusus:</h5>
                <ul className="text-sm space-y-1">
                  <li>• <strong>User</strong>: Hanya dapat mengakses data pribadi mereka sendiri</li>
                  <li>• <strong>Agent</strong>: Dapat mengelola aplikasi yang ditugaskan kepada mereka</li>
                  <li>• <strong>Checker Agent</strong>: Memiliki akses lebih luas untuk validasi dan pemeriksaan</li>
                  <li>• <strong>Bank Staff</strong>: Dapat mengelola data bank dan produk bank mereka sendiri</li>
                  <li>• <strong>Wirausaha</strong>: Akses terbatas untuk aplikasi KUR Wirausaha</li>
                  <li>• <strong>Admin</strong>: Akses penuh ke seluruh sistem</li>
                </ul>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">10</div>
                  <div className="text-sm text-gray-600">Total Roles</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">13</div>
                  <div className="text-sm text-gray-600">Total Modules</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">130</div>
                  <div className="text-sm text-gray-600">Access Points</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">5</div>
                  <div className="text-sm text-gray-600">Approval Roles</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAccessMatrix;