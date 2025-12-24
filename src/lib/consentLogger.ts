import { supabase } from './supabase';

export type DocumentType = 'privacy_policy' | 'terms_of_service' | 'data_processing';
export type SourceType = 'web' | 'mobile' | 'api';

interface ConsentLogData {
  userId: string;
  documentType: DocumentType;
  documentVersion?: string;
  consentGiven: boolean;
  source?: SourceType;
}

// Function to get IP address (client-side)
async function getClientIpAddress(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return null;
  }
}

// Main function to log user consent
export async function logUserConsent(data: ConsentLogData): Promise<{ success: boolean; error?: string }> {
  try {
    const ipAddress = await getClientIpAddress();

    const logEntry = {
      user_id: data.userId,
      document_type: data.documentType,
      document_version: data.documentVersion || '1.0',
      consent_given: data.consentGiven,
      consent_at: new Date().toISOString(),
      ip_address: ipAddress,
      user_agent: navigator.userAgent,
      source: data.source || 'web',
    };

    const { error } = await supabase
      .from('user_consent_logs')
      .insert(logEntry);

    if (error) {
      console.error('Failed to log consent:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in logUserConsent:', error);
    return { success: false, error: error.message };
  }
}

// Function to get user's consent logs
export async function getUserConsentLogs(userId: string, documentType?: DocumentType) {
  let query = supabase
    .from('user_consent_logs')
    .select('*')
    .eq('user_id', userId)
    .order('consent_at', { ascending: false });

  if (documentType) {
    query = query.eq('document_type', documentType);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

// Function to check if user has given consent for a specific document
export async function hasUserConsented(userId: string, documentType: DocumentType): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_consent_logs')
    .select('consent_given')
    .eq('user_id', userId)
    .eq('document_type', documentType)
    .eq('consent_given', true)
    .order('consent_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error checking consent:', error);
    return false;
  }

  return data && data.length > 0;
}

// Function to get all consent logs (for admin/audit)
export async function getAllConsentLogs(filters?: {
  startDate?: string;
  endDate?: string;
  documentType?: DocumentType;
  userId?: string;
}) {
  let query = supabase
    .from('user_consent_logs')
    .select('*')
    .order('consent_at', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('consent_at', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('consent_at', filters.endDate);
  }
  if (filters?.documentType) {
    query = query.eq('document_type', filters.documentType);
  }
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

// Function to get consent summary for OJK reporting
export async function getConsentSummary(startDate?: string, endDate?: string) {
  let query = supabase
    .from('v_consent_logs_summary')
    .select('*')
    .order('consent_date', { ascending: false });

  if (startDate) {
    query = query.gte('consent_date', startDate);
  }
  if (endDate) {
    query = query.lte('consent_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}
