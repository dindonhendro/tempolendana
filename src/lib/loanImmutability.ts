/**
 * Loan Application Immutability Utilities
 * 
 * This module provides functions for submitting loan applications
 * and verifying their hash integrity for bank and OJK audit.
 * 
 * WORKFLOW:
 * 1. User fills loan application form
 * 2. User clicks submit → calls submitLoanApplication()
 * 3. Database trigger automatically computes SHA-256 hash
 * 4. Record becomes immutable (cannot be modified)
 * 5. Bank/OJK can verify integrity using verifyLoanApplicationHash()
 */

import { supabase } from './supabase';

/**
 * Result type for loan submission
 */
export interface SubmitLoanResult {
  success: boolean;
  transactionId?: string;
  dataHash?: string;
  error?: string;
}

/**
 * Result type for hash verification
 */
export interface HashVerificationResult {
  applicationId: string;
  transactionId: string | null;
  storedHash: string | null;
  computedHash: string | null;
  isValid: boolean;
  status: string | null;
}

/**
 * Submits a loan application by changing its status to 'Validated'.
 * The database trigger will automatically:
 * 1. Compute SHA-256 hash of the canonical JSON representation
 * 2. Store the hash in data_hash column
 * 3. Make the record immutable
 * 
 * @param applicationId - UUID of the loan application to submit
 * @returns Promise<SubmitLoanResult> - Result of the submission
 * 
 * @example
 * ```typescript
 * const result = await submitLoanApplication('123e4567-e89b-12d3-a456-426614174000');
 * if (result.success) {
 *   console.log('Validated! Transaction ID:', result.transactionId);
 *   console.log('Data Hash:', result.dataHash);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */
export async function submitLoanApplication(applicationId: string): Promise<SubmitLoanResult> {
  try {
    // Update status to 'Validated' - hash is generated automatically by trigger
    const { data, error } = await supabase
      .from('loan_applications')
      .update({ status: 'Validated' })
      .eq('id', applicationId)
      .select('transaction_id, data_hash, status')
      .single();

    if (error) {
      // Check if it's an immutability error
      if (error.message.includes('Immutable record')) {
        return {
          success: false,
          error: 'Aplikasi ini sudah divalidasi dan tidak dapat diubah lagi.'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      transactionId: data.transaction_id,
      dataHash: data.data_hash
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}

/**
 * Verifies the hash integrity of a submitted loan application.
 * Compares the stored hash with a freshly computed hash.
 * 
 * @param applicationId - UUID of the loan application to verify
 * @returns Promise<HashVerificationResult | null> - Verification result
 * 
 * @example
 * ```typescript
 * const result = await verifyLoanApplicationHash('123e4567-e89b-12d3-a456-426614174000');
 * if (result?.isValid) {
 *   console.log('✅ Hash verified - data integrity confirmed');
 * } else {
 *   console.log('❌ Hash mismatch - data may have been tampered');
 * }
 * ```
 */
export async function verifyLoanApplicationHash(
  applicationId: string
): Promise<HashVerificationResult | null> {
  try {
    const { data, error } = await supabase
      .rpc('verify_loan_application_hash', {
        p_loan_application_id: applicationId
      });

    if (error) {
      console.error('Error verifying hash:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      applicationId: result.application_id,
      transactionId: result.transaction_id,
      storedHash: result.stored_hash,
      computedHash: result.computed_hash,
      isValid: result.is_valid,
      status: result.status
    };
  } catch (err) {
    console.error('Error verifying hash:', err);
    return null;
  }
}

/**
 * Fetches all verified (submitted) loan applications with their hash verification status.
 * Used for bank and OJK audit purposes.
 * 
 * @param filters - Optional filters for the query
 * @returns Promise<VerifiedLoanApplication[]> - List of verified applications
 * 
 * @example
 * ```typescript
 * const applications = await getVerifiedLoanApplications();
 * applications.forEach(app => {
 *   console.log(`${app.transaction_id}: ${app.hash_verified ? '✅' : '❌'}`);
 * });
 * ```
 */
export async function getVerifiedLoanApplications(filters?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  try {
    let query = supabase
      .from('loan_applications_verified')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching verified applications:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching verified applications:', err);
    return [];
  }
}

/**
 * Fetches audit trail for a specific loan application.
 * Shows all changes made to the application before submission.
 * 
 * @param applicationId - UUID of the loan application
 * @returns Promise<AuditEntry[]> - List of audit entries
 * 
 * @example
 * ```typescript
 * const auditTrail = await getLoanApplicationAuditTrail('123e4567-e89b-12d3-a456-426614174000');
 * auditTrail.forEach(entry => {
 *   console.log(`${entry.action} at ${entry.changed_at}`);
 * });
 * ```
 */
export async function getLoanApplicationAuditTrail(applicationId: string) {
  try {
    const { data, error } = await supabase
      .from('loan_applications_audit')
      .select('*')
      .eq('loan_application_id', applicationId)
      .order('changed_at', { ascending: true });

    if (error) {
      console.error('Error fetching audit trail:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching audit trail:', err);
    return [];
  }
}

/**
 * Checks if a loan application is immutable (already validated with hash).
 * 
 * @param applicationId - UUID of the loan application
 * @returns Promise<boolean> - True if immutable, false otherwise
 */
export async function isLoanApplicationImmutable(applicationId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('status, data_hash')
      .eq('id', applicationId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.status === 'Validated' && data.data_hash !== null;
  } catch (err) {
    return false;
  }
}

/**
 * Batch verify multiple loan applications.
 * Useful for periodic integrity checks.
 * 
 * @param applicationIds - Array of UUIDs to verify
 * @returns Promise<Map<string, boolean>> - Map of applicationId to verification result
 */
export async function batchVerifyLoanApplications(
  applicationIds: string[]
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();

  for (const id of applicationIds) {
    const verification = await verifyLoanApplicationHash(id);
    results.set(id, verification?.isValid ?? false);
  }

  return results;
}
