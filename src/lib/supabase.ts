import { createClient } from "@supabase/supabase-js";
import { Database, User } from "@/types/supabase";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const signUp = async (
  email: string,
  password: string,
  role: string,
  fullName: string,
  agentCompanyId?: string,
  bankId?: string,
  branchId?: string,
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
      },
    },
  });

  if (error) throw error;

  // Create user profile in public.users table
  if (data.user) {
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role,
    });

    if (profileError) throw profileError;

    // If user is an agent, create agent_staff record
    if (role === "agent" && agentCompanyId) {
      const { error: agentError } = await supabase.from("agent_staff").insert({
        user_id: data.user.id,
        agent_company_id: agentCompanyId,
        position: "Agent",
      });

      if (agentError) throw agentError;
    }

    // If user is bank_staff, create bank_staff record
    if (role === "bank_staff" && bankId && branchId) {
      const { error: bankStaffError } = await supabase
        .from("bank_staff")
        .insert({
          user_id: data.user.id,
          bank_id: bankId,
          branch_id: branchId,
          position: "Staff",
        });

      if (bankStaffError) throw bankStaffError;
    }

    // If user is insurance, create insurance_staff record
    if (role === "insurance" && agentCompanyId) {
      const { error: insuranceStaffError } = await supabase
        .from("insurance_staff")
        .insert({
          user_id: data.user.id,
          insurance_company_id: agentCompanyId, // reusing agentCompanyId param for insurance company
          position: "Staff",
        });

      if (insuranceStaffError) throw insuranceStaffError;
    }

    // If user is collector, create collector_staff record
    if (role === "collector" && agentCompanyId) {
      const { error: collectorStaffError } = await supabase
        .from("collector_staff")
        .insert({
          user_id: data.user.id,
          collector_company_id: agentCompanyId, // reusing agentCompanyId param for collector company
          position: "Staff",
        });

      if (collectorStaffError) throw collectorStaffError;
    }
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      // Don't return null immediately for certain recoverable errors
      if (
        authError.message?.includes("Invalid JWT") ||
        authError.message?.includes("JWT expired")
      ) {
        console.log("JWT expired, attempting to refresh session...");
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Session refresh failed:", refreshError);
          return null;
        }
        if (refreshData.user) {
          // Retry with refreshed session
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", refreshData.user.id)
            .single();

          if (profileError) {
            console.error(
              "Error fetching user profile after refresh:",
              profileError,
            );
            return null;
          }
          return profile;
        }
      }
      return null;
    }

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      // Check if it's a network error or temporary issue
      if (
        error.code === "PGRST116" ||
        error.message?.includes("No rows returned")
      ) {
        console.error("User profile not found in database for user:", user.id);
      }
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

export const getCurrentUserRole = async (): Promise<
  | "user"
  | "agent"
  | "validator"
  | "bank_staff"
  | "insurance"
  | "collector"
  | null
> => {
  const user = await getCurrentUser();
  return user?.role as
    | "user"
    | "agent"
    | "validator"
    | "bank_staff"
    | "insurance"
    | "collector"
    | null;
};

export const getCurrentUserId = async (): Promise<string | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !!user;
};

// Get agent companies
export const getAgentCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from("agent_companies")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching agent companies:", error);
      // Return empty array instead of throwing error
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in getAgentCompanies:", error);
    // Always return empty array to prevent app hanging
    return [];
  }
};

// Get banks
export const getBanks = async () => {
  try {
    const { data, error } = await supabase
      .from("banks")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching banks:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in getBanks:", error);
    return [];
  }
};

// Get bank branches by bank ID
export const getBankBranches = async (bankId: string) => {
  try {
    const { data, error } = await supabase
      .from("bank_branches")
      .select("*")
      .eq("bank_id", bankId)
      .order("name");

    if (error) {
      console.error("Error fetching bank branches:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in getBankBranches:", error);
    return [];
  }
};

// Get bank products by bank ID
export const getBankProducts = async (bankId: string) => {
  try {
    const { data, error } = await supabase
      .from("bank_products")
      .select("*")
      .eq("bank_id", bankId)
      .order("name");

    if (error) {
      console.error("Error fetching bank products:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in getBankProducts:", error);
    return [];
  }
};

// Get insurance companies
export const getInsuranceCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from("insurance_companies")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching insurance companies:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in getInsuranceCompanies:", error);
    return [];
  }
};

// Get collector companies
export const getCollectorCompanies = async () => {
  try {
    const { data, error } = await supabase
      .from("collector_companies")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching collector companies:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in getCollectorCompanies:", error);
    return [];
  }
};

// Simple file upload function
export const uploadFileToStorage = async (
  file: File,
  folder: string,
): Promise<{ url?: string; error?: string }> => {
  // Basic validation
  if (!file) return { error: "No file selected" };
  if (file.size > 5242880) return { error: "File too large (max 5MB)" };

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only JPG and PNG files allowed" };
  }

  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Direct upload - let Supabase handle bucket creation
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    return { url: data.publicUrl };
  } catch (error) {
    return { error: "Upload failed. Please try again." };
  }
};

// Delete all loan data and relations
export const deleteAllLoanData = async () => {
  try {
    console.log("Starting to delete all loan data...");

    // Delete in order to respect foreign key constraints
    // 1. Delete bank_reviews first (references branch_applications)
    const { error: reviewsError } = await supabase
      .from("bank_reviews")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (reviewsError) {
      console.error("Error deleting bank reviews:", reviewsError);
      throw new Error(`Failed to delete bank reviews: ${reviewsError.message}`);
    }
    console.log("Bank reviews deleted successfully");

    // 2. Delete branch_applications (references loan_applications)
    const { error: branchAppsError } = await supabase
      .from("branch_applications")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (branchAppsError) {
      console.error("Error deleting branch applications:", branchAppsError);
      throw new Error(
        `Failed to delete branch applications: ${branchAppsError.message}`,
      );
    }
    console.log("Branch applications deleted successfully");

    // 3. Finally delete loan_applications
    const { error: loansError } = await supabase
      .from("loan_applications")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (loansError) {
      console.error("Error deleting loan applications:", loansError);
      throw new Error(
        `Failed to delete loan applications: ${loansError.message}`,
      );
    }
    console.log("Loan applications deleted successfully");

    console.log("All loan data deleted successfully!");
    return {
      success: true,
      message: "All loan data has been deleted successfully",
    };
  } catch (error) {
    console.error("Error in deleteAllLoanData:", error);
    throw error;
  }
};

// Bulk upload applications from CSV
export const processBulkApplications = async (
  csvData: any[],
  agentCompanyId: string,
  fileMap: Map<string, { ktpFile: File; selfPhotoFile: File }>,
) => {
  const results = {
    successful: [] as any[],
    failed: [] as any[],
    totalProcessed: 0,
  };

  console.log(`Processing ${csvData.length} applications...`);

  for (const row of csvData) {
    results.totalProcessed++;

    try {
      // Validate required fields
      if (!row.full_name || !row.email || !row.phone_number) {
        throw new Error(
          "Missing required fields: full_name, email, or phone_number",
        );
      }

      // Get files for this row (using email as identifier)
      const files = fileMap.get(row.email);
      if (!files) {
        throw new Error(`Files not found for email: ${row.email}`);
      }

      // Upload KTP photo
      const ktpUpload = await uploadFileToStorage(files.ktpFile, "ktp_photos");
      if (ktpUpload.error) {
        throw new Error(`KTP upload failed: ${ktpUpload.error}`);
      }

      // Upload self photo
      const selfPhotoUpload = await uploadFileToStorage(
        files.selfPhotoFile,
        "self_photos",
      );
      if (selfPhotoUpload.error) {
        throw new Error(`Self photo upload failed: ${selfPhotoUpload.error}`);
      }

      // Create loan application
      const applicationData = {
        full_name: row.full_name,
        email: row.email,
        phone_number: row.phone_number,
        gender: row.gender || null,
        age: row.age ? parseInt(row.age) : null,
        birth_place: row.birth_place || null,
        birth_date: row.birth_date || null,
        nik_ktp: row.nik_ktp || null,
        address_ktp: row.address_ktp || null,
        address_domicile: row.address_domicile || null,
        last_education: row.last_education || null,
        nomor_sisko: row.nomor_sisko || null,
        nama_ibu_kandung: row.nama_ibu_kandung || null,
        nama_pasangan: row.nama_pasangan || null,
        ktp_pasangan: row.ktp_pasangan || null,
        alamat_pasangan: row.alamat_pasangan || null,
        telp_pasangan: row.telp_pasangan || null,
        institution: row.institution || null,
        major: row.major || null,
        work_experience: row.work_experience || null,
        work_location: row.work_location || null,
        nama_pemberi_kerja: row.nama_pemberi_kerja || null,
        alamat_pemberi_kerja: row.alamat_pemberi_kerja || null,
        telp_pemberi_kerja: row.telp_pemberi_kerja || null,
        tanggal_keberangkatan: row.tanggal_keberangkatan || null,
        loan_amount: row.loan_amount ? parseInt(row.loan_amount) : null,
        tenor_months: row.tenor_months ? parseInt(row.tenor_months) : null,
        other_certifications: row.other_certifications || null,
        ktp_photo_url: ktpUpload.url,
        self_photo_url: selfPhotoUpload.url,
        assigned_agent_id: agentCompanyId,
        status: "Submitted",
        submission_type: "bulk_upload",
      };

      const { data: application, error: appError } = await supabase
        .from("loan_applications")
        .insert(applicationData)
        .select()
        .single();

      if (appError) {
        throw new Error(`Database insert failed: ${appError.message}`);
      }

      results.successful.push({
        email: row.email,
        name: row.full_name,
        applicationId: application.id,
      });

      console.log(`Successfully processed: ${row.full_name} (${row.email})`);
    } catch (error: any) {
      console.error(`Failed to process ${row.email}:`, error);
      results.failed.push({
        email: row.email || "Unknown",
        name: row.full_name || "Unknown",
        error: error.message,
      });
    }
  }

  return results;
};

// Parse CSV content
export const parseCSVContent = (csvContent: string): any[] => {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const row: any = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });

    data.push(row);
  }

  return data;
};

// Delete user account and all related data
export const deleteUserAccount = async (userId: string) => {
  try {
    console.log("Starting to delete user account:", userId);

    // Delete user's loan applications and related data first
    const { error: branchReviewsError } = await supabase
      .from("bank_reviews")
      .delete()
      .in(
        "branch_application_id",
        supabase
          .from("branch_applications")
          .select("id")
          .in(
            "loan_application_id",
            supabase
              .from("loan_applications")
              .select("id")
              .eq("user_id", userId),
          ),
      );

    if (branchReviewsError) {
      console.error("Error deleting bank reviews:", branchReviewsError);
    }

    // Delete branch applications
    const { error: branchAppsError } = await supabase
      .from("branch_applications")
      .delete()
      .in(
        "loan_application_id",
        supabase.from("loan_applications").select("id").eq("user_id", userId),
      );

    if (branchAppsError) {
      console.error("Error deleting branch applications:", branchAppsError);
    }

    // Delete loan applications
    const { error: loansError } = await supabase
      .from("loan_applications")
      .delete()
      .eq("user_id", userId);

    if (loansError) {
      console.error("Error deleting loan applications:", loansError);
    }

    // Delete agent staff record if exists
    const { error: agentStaffError } = await supabase
      .from("agent_staff")
      .delete()
      .eq("user_id", userId);

    if (agentStaffError) {
      console.error("Error deleting agent staff:", agentStaffError);
    }

    // Delete bank staff record if exists
    const { error: bankStaffError } = await supabase
      .from("bank_staff")
      .delete()
      .eq("user_id", userId);

    if (bankStaffError) {
      console.error("Error deleting bank staff:", bankStaffError);
    }

    // Delete insurance staff record if exists
    const { error: insuranceStaffError } = await supabase
      .from("insurance_staff")
      .delete()
      .eq("user_id", userId);

    if (insuranceStaffError) {
      console.error("Error deleting insurance staff:", insuranceStaffError);
    }

    // Delete user profile
    const { error: profileError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting user profile:", profileError);
      throw new Error(`Failed to delete user profile: ${profileError.message}`);
    }

    // Delete auth user (this will cascade delete the auth record)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      // Don't throw error here as the profile is already deleted
      // The auth deletion might fail due to permissions but profile deletion is more important
    }

    console.log("User account deleted successfully!");
    return {
      success: true,
      message: "User account has been deleted successfully",
    };
  } catch (error) {
    console.error("Error in deleteUserAccount:", error);
    throw error;
  }
};

// Assign application to bank branch
export const assignApplicationToBranch = async (
  applicationId: string,
  bankProductId: string,
  branchId: string,
) => {
  console.log("Starting assignment process:", {
    applicationId,
    bankProductId,
    branchId,
  });

  try {
    // First, check if the application exists and is in the correct status
    const { data: existingApp, error: checkError } = await supabase
      .from("loan_applications")
      .select("id, status")
      .eq("id", applicationId)
      .single();

    if (checkError) {
      console.error("Error checking application:", checkError);
      throw new Error(`Application not found: ${checkError.message}`);
    }

    if (!existingApp) {
      throw new Error("Application not found");
    }

    console.log("Application found:", existingApp);

    // Check if application is already assigned
    const { data: existingAssignment, error: assignmentCheckError } =
      await supabase
        .from("branch_applications")
        .select("id")
        .eq("loan_application_id", applicationId)
        .maybeSingle();

    if (assignmentCheckError) {
      console.error(
        "Error checking existing assignment:",
        assignmentCheckError,
      );
      throw new Error(
        `Error checking assignment: ${assignmentCheckError.message}`,
      );
    }

    if (existingAssignment) {
      throw new Error("Application is already assigned to a branch");
    }

    // Verify bank product and branch exist
    const { data: bankProduct, error: productError } = await supabase
      .from("bank_products")
      .select("id, name")
      .eq("id", bankProductId)
      .single();

    if (productError || !bankProduct) {
      console.error("Bank product not found:", productError);
      throw new Error("Selected bank product not found");
    }

    const { data: branch, error: branchError } = await supabase
      .from("bank_branches")
      .select("id, name")
      .eq("id", branchId)
      .single();

    if (branchError || !branch) {
      console.error("Bank branch not found:", branchError);
      throw new Error("Selected bank branch not found");
    }

    console.log("Validation passed. Creating assignment...");

    // Create branch application record
    const { data: branchAppData, error: branchAppError } = await supabase
      .from("branch_applications")
      .insert({
        loan_application_id: applicationId,
        bank_product_id: bankProductId,
        branch_id: branchId,
        assigned_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (branchAppError) {
      console.error("Error creating branch application:", branchAppError);
      throw new Error(`Failed to create assignment: ${branchAppError.message}`);
    }

    console.log("Branch application created:", branchAppData);

    // Update loan application status to 'Checked' (indicating it's been processed by agent)
    const { data: updatedApp, error: updateError } = await supabase
      .from("loan_applications")
      .update({
        status: "Checked",
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating loan application:", updateError);
      // Try to rollback the branch application creation
      await supabase
        .from("branch_applications")
        .delete()
        .eq("id", branchAppData.id);
      throw new Error(
        `Failed to update application status: ${updateError.message}`,
      );
    }

    console.log("Application updated successfully:", updatedApp);
    return {
      success: true,
      branchApplication: branchAppData,
      updatedApplication: updatedApp,
    };
  } catch (error) {
    console.error("Error in assignApplicationToBranch:", error);
    throw error;
  }
};
