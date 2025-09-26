import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Building, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { 
  findLoanByTransactionId, 
  validateTransactionIdFormat, 
  formatTransactionId,
  parseFormattedTransactionId 
} from '@/lib/transactionUtils';

interface LoanApplication {
  id: string;
  transaction_id: string;
  full_name: string;
  submission_type: string;
  loan_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  email: string;
  phone_number: string;
  negara_penempatan: string;
  tenor_months: number;
  bunga_bank: number;
  grace_period: number;
  users?: {
    full_name: string;
    email: string;
  };
  agent_companies?: {
    name: string;
    code: string;
  };
}

interface TransactionTrackerProps {
  onLoanFound?: (loan: LoanApplication) => void;
}

export default function TransactionTracker({ onLoanFound }: TransactionTrackerProps = {}) {
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<LoanApplication | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Please enter a transaction ID');
      return;
    }

    // Parse formatted ID if it contains dashes
    const cleanId = parseFormattedTransactionId(searchId.trim());

    if (!validateTransactionIdFormat(cleanId)) {
      setError('Invalid transaction ID format. Please use format: YYMMDDxxxx or YYMMDD-xxxx');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResult(null);

    try {
      const result = await findLoanByTransactionId(cleanId);
      
      if (result) {
        setSearchResult(result as LoanApplication);
        if (onLoanFound) {
          onLoanFound(result as LoanApplication);
        }
      } else {
        setError('No loan application found with this transaction ID');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'under review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSubmissionType = (type: string) => {
    const typeMap: Record<string, string> = {
      'PMI': 'KUR PMI',
      'KUR_PERUMAHAN_PMI': 'KUR Perumahan PMI',
      'RUMAH_SUBSIDI_PMI': 'Rumah Subsidi PMI',
      'KUR_WIRAUSAHA_PMI': 'KUR Wirausaha PMI',
      'PETERNAK_SAPI_PMI': 'Peternak Sapi PMI'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5680E9] to-[#8860D0] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-[#5680E9] flex items-center justify-center">
              <Search className="h-6 w-6 mr-2" />
              Track Your Loan Application
            </CardTitle>
            <p className="text-center text-gray-600">
              Enter your transaction ID to track the status of your loan application
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="transaction-id">Transaction ID</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="transaction-id"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter transaction ID (e.g., 2501210001 or 250121-0001)"
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-[#5680E9] hover:bg-[#5680E9]/90"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: YYMMDDxxxx (e.g., 2501210001) or YYMMDD-xxxx (e.g., 250121-0001)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-[#5680E9] flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Loan Application Details
                </CardTitle>
                <Badge className={getStatusColor(searchResult.status)}>
                  {getStatusIcon(searchResult.status)}
                  <span className="ml-1">{searchResult.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transaction Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">Transaction Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Transaction ID</p>
                    <p className="font-mono text-lg font-bold text-blue-800">
                      {formatTransactionId(searchResult.transaction_id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Application Type</p>
                    <p className="font-semibold text-blue-800">
                      {formatSubmissionType(searchResult.submission_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Submitted Date</p>
                    <p className="font-semibold text-blue-800 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(searchResult.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 mb-1">Last Updated</p>
                    <p className="font-semibold text-blue-800 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(searchResult.updated_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="font-semibold">{searchResult.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold">{searchResult.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold">{searchResult.phone_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Country of Placement</p>
                    <p className="font-semibold">{searchResult.negara_penempatan || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Loan Information */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Loan Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Loan Amount</p>
                    <p className="font-semibold text-lg text-green-600">
                      Rp {searchResult.loan_amount?.toLocaleString('id-ID') || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tenor</p>
                    <p className="font-semibold">{searchResult.tenor_months || 'Not specified'} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
                    <p className="font-semibold">{searchResult.bunga_bank || 6}% per year</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Grace Period</p>
                    <p className="font-semibold">{searchResult.grace_period || 0} months</p>
                  </div>
                </div>
              </div>

              {/* Agent Information */}
              {searchResult.agent_companies && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Agent Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Agent Company</p>
                        <p className="font-semibold">{searchResult.agent_companies.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Agent Code</p>
                        <p className="font-semibold font-mono">{searchResult.agent_companies.code}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Status Information */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-gray-800 mb-2">Application Status</h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(searchResult.status)}
                  <span className="font-semibold">{searchResult.status}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {searchResult.status === 'Submitted' && 
                    'Your application has been submitted and is being reviewed by our team.'}
                  {searchResult.status === 'Under Review' && 
                    'Your application is currently under review by our validation team.'}
                  {searchResult.status === 'Approved' && 
                    'Congratulations! Your application has been approved.'}
                  {searchResult.status === 'Rejected' && 
                    'Your application has been rejected. Please contact our support team for more information.'}
                </p>
              </div>

              {/* Important Note */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Important Note</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please save your transaction ID <strong>{formatTransactionId(searchResult.transaction_id)}</strong> for future reference. 
                      You can use this ID to track your application status at any time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}