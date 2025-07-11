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
  "user" | "agent" | "validator" | "bank_staff" | null
> => {
  const user = await getCurrentUser();
  return user?.role as "user" | "agent" | "validator" | "bank_staff" | null;
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
