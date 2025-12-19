import { supabase } from './supabase';

interface RegistrationLogData {
  userId?: string;
  email: string;
  fullName?: string;
  role: string;
  registrationStatus: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

// Function to get IP address (client-side approximation)
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

// Function to parse user agent without external library
function parseUserAgent() {
  const ua = navigator.userAgent;
  
  // Detect device type
  let deviceType = 'desktop';
  if (/Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = /iPad|Tablet/i.test(ua) ? 'tablet' : 'mobile';
  }
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'Internet Explorer';
  
  // Detect OS
  let operatingSystem = 'Unknown';
  if (ua.includes('Windows NT 10')) operatingSystem = 'Windows 10';
  else if (ua.includes('Windows NT 6.3')) operatingSystem = 'Windows 8.1';
  else if (ua.includes('Windows NT 6.2')) operatingSystem = 'Windows 8';
  else if (ua.includes('Windows NT 6.1')) operatingSystem = 'Windows 7';
  else if (ua.includes('Windows')) operatingSystem = 'Windows';
  else if (ua.includes('Mac OS X')) operatingSystem = 'macOS';
  else if (ua.includes('Android')) operatingSystem = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) operatingSystem = 'iOS';
  else if (ua.includes('Linux')) operatingSystem = 'Linux';
  
  return {
    userAgent: ua,
    deviceType,
    browser,
    operatingSystem
  };
}

// Main function to log user registration
export async function logUserRegistration(data: RegistrationLogData): Promise<void> {
  try {
    const ipAddress = await getClientIpAddress();
    const deviceInfo = parseUserAgent();

    const logEntry = {
      user_id: data.userId || null,
      email: data.email,
      full_name: data.fullName || null,
      role: data.role,
      ip_address: ipAddress,
      user_agent: deviceInfo.userAgent,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      operating_system: deviceInfo.operatingSystem,
      registration_status: data.registrationStatus,
      error_message: data.errorMessage || null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_registration_logs')
      .insert(logEntry);

    if (error) {
      console.error('Failed to log registration:', error);
      // Don't throw - logging failure shouldn't block registration
    }
  } catch (error) {
    console.error('Error in logUserRegistration:', error);
    // Silent fail - logging is not critical for registration flow
  }
}

// Function to get registration logs for admin/audit purposes
export async function getRegistrationLogs(filters?: {
  startDate?: string;
  endDate?: string;
  role?: string;
  email?: string;
  status?: string;
}) {
  let query = supabase
    .from('user_registration_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  if (filters?.role) {
    query = query.eq('role', filters.role);
  }
  if (filters?.email) {
    query = query.ilike('email', `%${filters.email}%`);
  }
  if (filters?.status) {
    query = query.eq('registration_status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

// Function to get registration summary for OJK reporting
export async function getRegistrationSummary(startDate?: string, endDate?: string) {
  let query = supabase
    .from('v_registration_logs_summary')
    .select('*')
    .order('registration_date', { ascending: false });

  if (startDate) {
    query = query.gte('registration_date', startDate);
  }
  if (endDate) {
    query = query.lte('registration_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}
