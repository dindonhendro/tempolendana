import { supabase } from './supabase';

/**
 * Search for loan applications by transaction ID
 * @param transactionId - The transaction ID to search for
 * @returns Promise with loan application data or null if not found
 */
export async function findLoanByTransactionId(transactionId: string) {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select(`
        *,
        users!loan_applications_user_id_fkey(full_name, email),
        agent_companies!loan_applications_assigned_agent_id_fkey(name, code)
      `)
      .eq('transaction_id', transactionId)
      .single();

    if (error) {
      console.error('Error finding loan by transaction ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in findLoanByTransactionId:', error);
    return null;
  }
}

/**
 * Get all loan applications for a user with transaction IDs
 * @param userId - The user ID to get loans for
 * @returns Promise with array of loan applications
 */
export async function getUserLoansWithTransactionIds(userId: string) {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select(`
        id,
        transaction_id,
        full_name,
        submission_type,
        loan_amount,
        status,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user loans:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserLoansWithTransactionIds:', error);
    return [];
  }
}

/**
 * Validate transaction ID format (YYMMDDxxxx)
 * @param transactionId - The transaction ID to validate
 * @returns boolean indicating if format is valid
 */
export function validateTransactionIdFormat(transactionId: string): boolean {
  // Check if it's exactly 10 characters and matches YYMMDDxxxx pattern
  const pattern = /^\d{10}$/;
  if (!pattern.test(transactionId)) {
    return false;
  }

  // Extract date parts
  const year = parseInt(transactionId.substring(0, 2));
  const month = parseInt(transactionId.substring(2, 4));
  const day = parseInt(transactionId.substring(4, 6));

  // Basic date validation
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  return true;
}

/**
 * Format transaction ID for display (adds dashes for readability)
 * @param transactionId - The transaction ID to format
 * @returns Formatted transaction ID (YYMMDD-xxxx)
 */
export function formatTransactionId(transactionId: string): string {
  if (!transactionId || transactionId.length !== 10) {
    return transactionId;
  }
  
  return `${transactionId.substring(0, 6)}-${transactionId.substring(6)}`;
}

/**
 * Parse formatted transaction ID back to original format
 * @param formattedId - The formatted transaction ID (YYMMDD-xxxx)
 * @returns Original transaction ID (YYMMDDxxxx)
 */
export function parseFormattedTransactionId(formattedId: string): string {
  return formattedId.replace('-', '');
}