import React, { Suspense, useEffect, useState } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import LandingPage from "./components/LandingPage";
import AuthForm from "./components/auth/AuthForm";
import Welcome from "./components/Welcome";
import UserDashboard from "./components/pmi/UserDashboard";
import AgentDashboard from "./components/pmi/AgentDashboard";
import ValidatorDashboard from "./components/pmi/ValidatorDashboard";
import BankStaffDashboard from "./components/pmi/BankStaffDashboard";
import InsuranceDashboard from "./components/pmi/InsuranceDashboard";
import CollectorDashboard from "./components/pmi/CollectorDashboard";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { supabase, getCurrentUser, signOut } from "./lib/supabase";
import { User, Tables } from "./types/supabase";
import routes from "tempo-routes";
import {
  LogOut,
  Building2,
  Users,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
} from "lucide-react";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Starting auth initialization...");

        // Set a maximum timeout for the entire initialization
        const initTimeout = setTimeout(() => {
          if (isMounted && !authInitialized) {
            console.warn(
              "Auth initialization timeout, proceeding without user",
            );
            setAuthError("Authentication timeout");
            setUser(null);
            setLoading(false);
            setAuthInitialized(true);
          }
        }, 8000);

        const currentUser = await getCurrentUser();

        if (isMounted) {
          clearTimeout(initTimeout);
          setUser(currentUser);
          setLoading(false);
          setAuthInitialized(true);
          setAuthError(null);

          if (currentUser) {
            console.log(
              "User authenticated:",
              currentUser.email,
              currentUser.role,
            );
          } else {
            console.log("No authenticated user found");
          }
        }
      } catch (error: any) {
        if (isMounted) {
          console.error("Error checking user:", error);
          setAuthError(error.message || "Authentication failed");
          setUser(null);
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log("Auth state change:", event, session?.user?.id);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error("Error getting user after auth change:", error);
          setUser(null);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out, clearing state");
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        console.log("User authenticated:", currentUser.email, currentUser.role);
      }
    } catch (error: any) {
      console.error("Error checking user:", error);
      setUser(null);
    }
  };

  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
    // Always clear user state and redirect
    setUser(null);
    setSigningOut(false);
    window.location.href = "/";
  };

  const [activeAdminSection, setActiveAdminSection] = useState<string | null>(
    null,
  );
  const [banks, setBanks] = useState<Tables<"banks">[]>([]);
  const [agentCompanies, setAgentCompanies] = useState<
    Tables<"agent_companies">[]
  >([]);
  const [bankBranches, setBankBranches] = useState<Tables<"bank_branches">[]>(
    [],
  );
  const [bankProducts, setBankProducts] = useState<Tables<"bank_products">[]>(
    [],
  );
  const [bankStaff, setBankStaff] = useState<Tables<"bank_staff">[]>([]);
  const [agentStaff, setAgentStaff] = useState<Tables<"agent_staff">[]>([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState<
    Tables<"insurance_companies">[]
  >([]);
  const [collectorCompanies, setCollectorCompanies] = useState<
    Tables<"collector_companies">[]
  >([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [editingBank, setEditingBank] = useState<Tables<"banks"> | null>(null);
  const [editingAgent, setEditingAgent] =
    useState<Tables<"agent_companies"> | null>(null);
  const [editingBranch, setEditingBranch] =
    useState<Tables<"bank_branches"> | null>(null);
  const [editingProduct, setEditingProduct] =
    useState<Tables<"bank_products"> | null>(null);
  const [editingStaff, setEditingStaff] = useState<Tables<"bank_staff"> | null>(
    null,
  );
  const [editingInsurance, setEditingInsurance] =
    useState<Tables<"insurance_companies"> | null>(null);
  const [editingCollector, setEditingCollector] =
    useState<Tables<"collector_companies"> | null>(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showInsuranceForm, setShowInsuranceForm] = useState(false);
  const [showCollectorForm, setShowCollectorForm] = useState(false);
  const [allApplications, setAllApplications] = useState<
    Tables<"loan_applications">[]
  >([]);
  const [editingApplication, setEditingApplication] =
    useState<Tables<"loan_applications"> | null>(null);
  const [showApplicationEditDialog, setShowApplicationEditDialog] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredApplications, setFilteredApplications] = useState<
    Tables<"loan_applications">[]
  >([]);

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from("banks")
        .select("*")
        .order("name");
      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const fetchAgentCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("agent_companies")
        .select("*")
        .order("name");
      if (error) throw error;
      setAgentCompanies(data || []);
    } catch (error) {
      console.error("Error fetching agent companies:", error);
    }
  };

  const fetchInsuranceCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("insurance_companies")
        .select("*")
        .order("name");
      if (error) throw error;
      setInsuranceCompanies(data || []);
    } catch (error) {
      console.error("Error fetching insurance companies:", error);
    }
  };

  const fetchCollectorCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("collector_companies")
        .select("*")
        .order("name");
      if (error) throw error;
      setCollectorCompanies(data || []);
    } catch (error) {
      console.error("Error fetching collector companies:", error);
    }
  };

  const fetchBankBranches = async () => {
    try {
      const { data, error } = await supabase
        .from("bank_branches")
        .select(
          `
          *,
          banks!inner(name)
        `,
        )
        .order("name");
      if (error) throw error;
      setBankBranches(data || []);
    } catch (error) {
      console.error("Error fetching bank branches:", error);
    }
  };

  const fetchBankProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("bank_products")
        .select(
          `
          *,
          banks!inner(name)
        `,
        )
        .order("name");
      if (error) throw error;
      setBankProducts(data || []);
    } catch (error) {
      console.error("Error fetching bank products:", error);
    }
  };

  const fetchBankStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("bank_staff")
        .select(
          `
          *,
          users!inner(full_name, email),
          banks!inner(name),
          bank_branches!inner(name)
        `,
        )
        .order("position");
      if (error) throw error;
      setBankStaff(data || []);
    } catch (error) {
      console.error("Error fetching bank staff:", error);
    }
  };

  const handleBankManagement = async () => {
    setActiveAdminSection("banks");
    setAdminLoading(true);
    await Promise.all([
      fetchBanks(),
      fetchBankBranches(),
      fetchBankProducts(),
      fetchBankStaff(),
    ]);
    setAdminLoading(false);
  };

  const handleAgentManagement = async () => {
    setActiveAdminSection("agents");
    setAdminLoading(true);
    await fetchAgentCompanies();
    setAdminLoading(false);
  };

  const handleInsuranceManagement = async () => {
    setActiveAdminSection("insurance");
    setAdminLoading(true);
    await fetchInsuranceCompanies();
    setAdminLoading(false);
  };

  const handleCollectorManagement = async () => {
    setActiveAdminSection("collector");
    setAdminLoading(true);
    await fetchCollectorCompanies();
    setAdminLoading(false);
  };

  const handleSaveBank = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const bankData = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      logo_url: (formData.get("logo_url") as string) || null,
    };

    try {
      if (editingBank) {
        const { error } = await supabase
          .from("banks")
          .update(bankData)
          .eq("id", editingBank.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banks").insert([bankData]);
        if (error) throw error;
      }

      await fetchBanks();
      setShowBankForm(false);
      setEditingBank(null);
    } catch (error) {
      console.error("Error saving bank:", error);
      alert("Error saving bank. Please try again.");
    }
  };

  const handleSaveAgent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Validate required fields
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;

    if (!name || !code) {
      alert("Name and Code are required fields.");
      return;
    }

    const agentData = {
      name: name.trim(),
      code: code.trim(),
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      address: (formData.get("address") as string)?.trim() || null,
      license_number:
        (formData.get("license_number") as string)?.trim() || null,
    };

    console.log("Saving agent data:", agentData);

    try {
      if (editingAgent) {
        console.log("Updating existing agent:", editingAgent.id);
        const { data, error } = await supabase
          .from("agent_companies")
          .update(agentData)
          .eq("id", editingAgent.id)
          .select();

        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        console.log("Agent updated successfully:", data);
      } else {
        console.log("Creating new agent");
        const { data, error } = await supabase
          .from("agent_companies")
          .insert([agentData])
          .select();

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        console.log("Agent created successfully:", data);
      }

      await fetchAgentCompanies();
      setShowAgentForm(false);
      setEditingAgent(null);
      alert(
        editingAgent
          ? "Agent company updated successfully!"
          : "Agent company created successfully!",
      );
    } catch (error: any) {
      console.error("Error saving agent:", error);
      let errorMessage = "Error saving agent company. ";

      if (error?.code === "23505") {
        errorMessage += "A company with this code already exists.";
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }

      alert(errorMessage);
    }
  };

  const handleDeleteBank = async (bankId: string) => {
    if (!confirm("Are you sure you want to delete this bank?")) return;

    try {
      const { error } = await supabase.from("banks").delete().eq("id", bankId);
      if (error) throw error;
      await fetchBanks();
    } catch (error) {
      console.error("Error deleting bank:", error);
      alert("Error deleting bank. Please try again.");
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent company?")) return;

    try {
      const { error } = await supabase
        .from("agent_companies")
        .delete()
        .eq("id", agentId);
      if (error) throw error;
      await fetchAgentCompanies();
    } catch (error) {
      console.error("Error deleting agent company:", error);
      alert("Error deleting agent company. Please try again.");
    }
  };

  const handleSaveInsurance = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;

    if (!name || !code) {
      alert("Name and Code are required fields.");
      return;
    }

    const insuranceData = {
      name: name.trim(),
      code: code.trim(),
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      address: (formData.get("address") as string)?.trim() || null,
      license_number:
        (formData.get("license_number") as string)?.trim() || null,
    };

    try {
      if (editingInsurance) {
        const { error } = await supabase
          .from("insurance_companies")
          .update(insuranceData)
          .eq("id", editingInsurance.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("insurance_companies")
          .insert([insuranceData]);
        if (error) throw error;
      }

      await fetchInsuranceCompanies();
      setShowInsuranceForm(false);
      setEditingInsurance(null);
      alert(
        editingInsurance
          ? "Insurance company updated successfully!"
          : "Insurance company created successfully!",
      );
    } catch (error: any) {
      console.error("Error saving insurance company:", error);
      let errorMessage = "Error saving insurance company. ";

      if (error?.code === "23505") {
        errorMessage += "A company with this code already exists.";
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }

      alert(errorMessage);
    }
  };

  const handleDeleteInsurance = async (insuranceId: string) => {
    if (!confirm("Are you sure you want to delete this insurance company?"))
      return;

    try {
      const { error } = await supabase
        .from("insurance_companies")
        .delete()
        .eq("id", insuranceId);
      if (error) throw error;
      await fetchInsuranceCompanies();
    } catch (error) {
      console.error("Error deleting insurance company:", error);
      alert("Error deleting insurance company. Please try again.");
    }
  };

  const handleSaveCollector = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const name = formData.get("name") as string;
    const code = formData.get("code") as string;

    if (!name || !code) {
      alert("Name and Code are required fields.");
      return;
    }

    const collectorData = {
      name: name.trim(),
      code: code.trim(),
      email: (formData.get("email") as string)?.trim() || null,
      phone: (formData.get("phone") as string)?.trim() || null,
      address: (formData.get("address") as string)?.trim() || null,
      license_number:
        (formData.get("license_number") as string)?.trim() || null,
    };

    try {
      if (editingCollector) {
        const { error } = await supabase
          .from("collector_companies")
          .update(collectorData)
          .eq("id", editingCollector.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("collector_companies")
          .insert([collectorData]);
        if (error) throw error;
      }

      await fetchCollectorCompanies();
      setShowCollectorForm(false);
      setEditingCollector(null);
      alert(
        editingCollector
          ? "Collector company updated successfully!"
          : "Collector company created successfully!",
      );
    } catch (error: any) {
      console.error("Error saving collector company:", error);
      let errorMessage = "Error saving collector company. ";

      if (error?.code === "23505") {
        errorMessage += "A company with this code already exists.";
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += "Please try again.";
      }

      alert(errorMessage);
    }
  };

  const handleDeleteCollector = async (collectorId: string) => {
    if (!confirm("Are you sure you want to delete this collector company?"))
      return;

    try {
      const { error } = await supabase
        .from("collector_companies")
        .delete()
        .eq("id", collectorId);
      if (error) throw error;
      await fetchCollectorCompanies();
    } catch (error) {
      console.error("Error deleting collector company:", error);
      alert("Error deleting collector company. Please try again.");
    }
  };

  const handleSaveBranch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const branchData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      province: formData.get("province") as string,
      phone: (formData.get("phone") as string) || null,
      bank_id: formData.get("bank_id") as string,
    };

    try {
      if (editingBranch) {
        const { error } = await supabase
          .from("bank_branches")
          .update(branchData)
          .eq("id", editingBranch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bank_branches")
          .insert([branchData]);
        if (error) throw error;
      }

      await fetchBankBranches();
      setShowBranchForm(false);
      setEditingBranch(null);
    } catch (error) {
      console.error("Error saving branch:", error);
      alert("Error saving branch. Please try again.");
    }
  };

  const handleSaveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      interest_rate: parseFloat(formData.get("interest_rate") as string),
      min_amount: parseInt(formData.get("min_amount") as string),
      max_amount: parseInt(formData.get("max_amount") as string),
      min_tenor: parseInt(formData.get("min_tenor") as string),
      max_tenor: parseInt(formData.get("max_tenor") as string),
      bank_id: formData.get("bank_id") as string,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("bank_products")
          .update(productData)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bank_products")
          .insert([productData]);
        if (error) throw error;
      }

      await fetchBankProducts();
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product. Please try again.");
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;

    try {
      const { error } = await supabase
        .from("bank_branches")
        .delete()
        .eq("id", branchId);
      if (error) throw error;
      await fetchBankBranches();
    } catch (error) {
      console.error("Error deleting branch:", error);
      alert("Error deleting branch. Please try again.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("bank_products")
        .delete()
        .eq("id", productId);
      if (error) throw error;
      await fetchBankProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product. Please try again.");
    }
  };

  const [systemStats, setSystemStats] = useState<{
    totalUsers: number;
    totalApplications: number;
    totalBanks: number;
    totalAgents: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    recentApplications: any[];
  } | null>(null);

  const fetchSystemStats = async () => {
    try {
      setAdminLoading(true);

      // Fetch all statistics in parallel
      const [
        usersResult,
        applicationsResult,
        banksResult,
        agentsResult,
        recentAppsResult,
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact" }),
        supabase
          .from("loan_applications")
          .select("id, status", { count: "exact" }),
        supabase.from("banks").select("id", { count: "exact" }),
        supabase.from("agent_companies").select("id", { count: "exact" }),
        supabase
          .from("loan_applications")
          .select(
            `
            id, full_name, status, created_at, loan_amount,
            users!inner(full_name, email)
          `,
          )
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      // Count applications by status
      const applications = applicationsResult.data || [];
      const pendingCount = applications.filter(
        (app) => app.status === "Pending",
      ).length;
      const approvedCount = applications.filter(
        (app) => app.status === "Approved",
      ).length;
      const rejectedCount = applications.filter(
        (app) => app.status === "Rejected",
      ).length;

      setSystemStats({
        totalUsers: usersResult.count || 0,
        totalApplications: applicationsResult.count || 0,
        totalBanks: banksResult.count || 0,
        totalAgents: agentsResult.count || 0,
        pendingApplications: pendingCount,
        approvedApplications: approvedCount,
        rejectedApplications: rejectedCount,
        recentApplications: recentAppsResult.data || [],
      });
    } catch (error) {
      console.error("Error fetching system stats:", error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSystemOverview = async () => {
    setActiveAdminSection("reports");
    await fetchSystemStats();
  };

  const handleApplicationManagement = async () => {
    setActiveAdminSection("applications");
    setAdminLoading(true);
    try {
      await fetchAllApplications();
    } catch (error) {
      console.error("Error in handleApplicationManagement:", error);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchAllApplications = async () => {
    try {
      // First, try to get all applications without joins to see if there's data
      const { data: basicData, error: basicError } = await supabase
        .from("loan_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (basicError) {
        console.error("Error fetching basic applications:", basicError);
        setAllApplications([]);
        return;
      }

      console.log("Found applications:", basicData?.length || 0);

      // If we have basic data, try to get with joins
      if (basicData && basicData.length > 0) {
        const { data, error } = await supabase
          .from("loan_applications")
          .select(
            `
            *,
            users(full_name, email),
            agent_companies(name, code)
          `,
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching applications with joins:", error);
          // Fall back to basic data if joins fail
          setAllApplications(basicData);
        } else {
          setAllApplications(data || []);
        }
      } else {
        // No applications found
        setAllApplications([]);
      }
    } catch (error) {
      console.error("Error fetching all applications:", error);
      setAllApplications([]);
    }
  };

  const filterApplications = (
    applications: Tables<"loan_applications">[],
    term: string,
  ) => {
    if (!term.trim()) {
      return applications;
    }

    const searchTerm = term.toLowerCase();
    return applications.filter((app) => {
      // Search by applicant name
      if (app.full_name?.toLowerCase().includes(searchTerm)) return true;

      // Search by email
      if (app.email?.toLowerCase().includes(searchTerm)) return true;

      // Search by phone
      if (app.phone_number?.toLowerCase().includes(searchTerm)) return true;

      // Search by status
      if (app.status?.toLowerCase().includes(searchTerm)) return true;

      // Search by agent company name
      if (
        (app as any).agent_companies?.name?.toLowerCase().includes(searchTerm)
      )
        return true;

      // Search by NIK KTP
      if (app.nik_ktp?.toLowerCase().includes(searchTerm)) return true;

      // Search by work location
      if (app.work_location?.toLowerCase().includes(searchTerm)) return true;

      return false;
    });
  };

  // Update filtered applications when search term or all applications change
  React.useEffect(() => {
    const filtered = filterApplications(allApplications, searchTerm);
    setFilteredApplications(filtered);
  }, [allApplications, searchTerm]);

  const handleEditApplicationStatus = (
    application: Tables<"loan_applications">,
  ) => {
    console.log("Edit button clicked for application:", application.id);
    try {
      setEditingApplication(application);
      setShowApplicationEditDialog(true);
    } catch (error) {
      console.error("Error setting editing application:", error);
    }
  };

  const handleSaveApplicationStatus = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!editingApplication) return;

    const formData = new FormData(event.currentTarget);
    const newStatus = formData.get("status") as string;
    const comments = formData.get("comments") as string;

    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Add validation fields if status is being validated
      if (newStatus === "Validated" && user) {
        updateData.validated_by_lendana = user.id;
        updateData.validated_by_lendana_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("loan_applications")
        .update(updateData)
        .eq("id", editingApplication.id);

      if (error) throw error;

      // If there are comments and status is rejected, we might want to store them
      // For now, we'll just update the status

      await fetchAllApplications();
      setShowApplicationEditDialog(false);
      setEditingApplication(null);
      alert("Application status updated successfully!");
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Error updating application status. Please try again.");
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this application? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("loan_applications")
        .delete()
        .eq("id", applicationId);

      if (error) throw error;

      await fetchAllApplications();
      alert("Application deleted successfully!");
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Error deleting application. Please try again.");
    }
  };

  const getDashboardComponent = () => {
    if (!user) return null;

    switch (user.role) {
      case "user":
        return <UserDashboard userId={user.id} />;
      case "agent":
        return <AgentDashboard agentId={user.id} />;
      case "validator":
        return <ValidatorDashboard validatorId={user.id} />;
      case "bank_staff":
        return <BankStaffDashboard staffId={user.id} />;
      case "insurance":
        return <InsuranceDashboard staffId={user.id} />;
      case "collector":
        return <CollectorDashboard staffId={user.id} />;
      case "admin":
        if (activeAdminSection === "banks") {
          return (
            <div className="min-h-screen bg-white p-4">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveAdminSection(null)}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Dashboard</span>
                    </Button>
                    <h1 className="text-3xl font-bold text-[#5680E9]">
                      Bank Management
                    </h1>
                  </div>
                </div>

                {adminLoading ? (
                  <div className="text-center py-8">
                    <p>Loading bank data...</p>
                  </div>
                ) : (
                  <Tabs defaultValue="banks" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="banks">Banks</TabsTrigger>
                      <TabsTrigger value="branches">Branches</TabsTrigger>
                      <TabsTrigger value="products">Products</TabsTrigger>
                      <TabsTrigger value="staff">Staff</TabsTrigger>
                    </TabsList>

                    <TabsContent value="banks" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                          Banks ({banks.length})
                        </h2>
                        <Dialog
                          open={showBankForm}
                          onOpenChange={setShowBankForm}
                        >
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => {
                                setEditingBank(null);
                                setShowBankForm(true);
                              }}
                              className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] flex items-center space-x-2"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Bank</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {editingBank ? "Edit Bank" : "Add New Bank"}
                              </DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={handleSaveBank}
                              className="space-y-4"
                            >
                              <div>
                                <Label htmlFor="name">Bank Name</Label>
                                <Input
                                  id="name"
                                  name="name"
                                  defaultValue={editingBank?.name || ""}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="code">Bank Code</Label>
                                <Input
                                  id="code"
                                  name="code"
                                  defaultValue={editingBank?.code || ""}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="logo_url">
                                  Logo URL (Optional)
                                </Label>
                                <Input
                                  id="logo_url"
                                  name="logo_url"
                                  type="url"
                                  defaultValue={editingBank?.logo_url || ""}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setShowBankForm(false);
                                    setEditingBank(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  className="bg-[#5680E9] text-white hover:bg-[#4a6bc7]"
                                >
                                  {editingBank ? "Update" : "Create"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Card>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Logo</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {banks.map((bank) => (
                                <TableRow key={bank.id}>
                                  <TableCell className="font-medium">
                                    {bank.name}
                                  </TableCell>
                                  <TableCell>{bank.code}</TableCell>
                                  <TableCell>
                                    {bank.logo_url ? (
                                      <img
                                        src={bank.logo_url}
                                        alt={bank.name}
                                        className="h-8 w-8 object-contain"
                                      />
                                    ) : (
                                      <span className="text-gray-400">
                                        No logo
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(
                                      bank.created_at,
                                    ).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingBank(bank);
                                          setShowBankForm(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleDeleteBank(bank.id)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {banks.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              No banks found. Click &quot;Add Bank&quot; to
                              create your first bank.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="branches" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                          Bank Branches ({bankBranches.length})
                        </h2>
                        <Dialog
                          open={showBranchForm}
                          onOpenChange={setShowBranchForm}
                        >
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => {
                                setEditingBranch(null);
                                setShowBranchForm(true);
                              }}
                              className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] flex items-center space-x-2"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Branch</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                {editingBranch
                                  ? "Edit Branch"
                                  : "Add New Branch"}
                              </DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={handleSaveBranch}
                              className="space-y-4"
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="name">Branch Name</Label>
                                  <Input
                                    id="name"
                                    name="name"
                                    defaultValue={editingBranch?.name || ""}
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="bank_id">Bank</Label>
                                  <Select
                                    name="bank_id"
                                    defaultValue={editingBranch?.bank_id || ""}
                                    required
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a bank" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {banks.map((bank) => (
                                        <SelectItem
                                          key={bank.id}
                                          value={bank.id}
                                        >
                                          {bank.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="address">Address</Label>
                                <Input
                                  id="address"
                                  name="address"
                                  defaultValue={editingBranch?.address || ""}
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="city">City</Label>
                                  <Input
                                    id="city"
                                    name="city"
                                    defaultValue={editingBranch?.city || ""}
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="province">Province</Label>
                                  <Input
                                    id="province"
                                    name="province"
                                    defaultValue={editingBranch?.province || ""}
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="phone">Phone (Optional)</Label>
                                <Input
                                  id="phone"
                                  name="phone"
                                  defaultValue={editingBranch?.phone || ""}
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setShowBranchForm(false);
                                    setEditingBranch(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  className="bg-[#5680E9] text-white hover:bg-[#4a6bc7]"
                                >
                                  {editingBranch ? "Update" : "Create"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Card>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Branch Name</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Province</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bankBranches.map((branch) => (
                                <TableRow key={branch.id}>
                                  <TableCell className="font-medium">
                                    {branch.name}
                                  </TableCell>
                                  <TableCell>
                                    {(branch as any).banks?.name || "Unknown"}
                                  </TableCell>
                                  <TableCell>{branch.city}</TableCell>
                                  <TableCell>{branch.province}</TableCell>
                                  <TableCell>{branch.phone || "-"}</TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingBranch(branch);
                                          setShowBranchForm(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleDeleteBranch(branch.id)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {bankBranches.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              No branches found. Click &quot;Add Branch&quot; to
                              create your first branch.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="products" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                          Bank Products ({bankProducts.length})
                        </h2>
                        <Dialog
                          open={showProductForm}
                          onOpenChange={setShowProductForm}
                        >
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => {
                                setEditingProduct(null);
                                setShowProductForm(true);
                              }}
                              className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] flex items-center space-x-2"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Product</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                {editingProduct
                                  ? "Edit Product"
                                  : "Add New Product"}
                              </DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={handleSaveProduct}
                              className="space-y-4"
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="name">Product Name</Label>
                                  <Input
                                    id="name"
                                    name="name"
                                    defaultValue={editingProduct?.name || ""}
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="bank_id">Bank</Label>
                                  <Select
                                    name="bank_id"
                                    defaultValue={editingProduct?.bank_id || ""}
                                    required
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a bank" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {banks.map((bank) => (
                                        <SelectItem
                                          key={bank.id}
                                          value={bank.id}
                                        >
                                          {bank.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="type">Product Type</Label>
                                  <Select
                                    name="type"
                                    defaultValue={editingProduct?.type || ""}
                                    required
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="KUR">KUR</SelectItem>
                                      <SelectItem value="Personal Loan">
                                        Personal Loan
                                      </SelectItem>
                                      <SelectItem value="Business Loan">
                                        Business Loan
                                      </SelectItem>
                                      <SelectItem value="Mortgage">
                                        Mortgage
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="interest_rate">
                                    Interest Rate (%)
                                  </Label>
                                  <Input
                                    id="interest_rate"
                                    name="interest_rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    defaultValue={
                                      editingProduct?.interest_rate || ""
                                    }
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="min_amount">
                                    Min Amount (Rp)
                                  </Label>
                                  <Input
                                    id="min_amount"
                                    name="min_amount"
                                    type="number"
                                    min="0"
                                    defaultValue={
                                      editingProduct?.min_amount || ""
                                    }
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="max_amount">
                                    Max Amount (Rp)
                                  </Label>
                                  <Input
                                    id="max_amount"
                                    name="max_amount"
                                    type="number"
                                    min="0"
                                    defaultValue={
                                      editingProduct?.max_amount || ""
                                    }
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="min_tenor">
                                    Min Tenor (months)
                                  </Label>
                                  <Input
                                    id="min_tenor"
                                    name="min_tenor"
                                    type="number"
                                    min="1"
                                    defaultValue={
                                      editingProduct?.min_tenor || ""
                                    }
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="max_tenor">
                                    Max Tenor (months)
                                  </Label>
                                  <Input
                                    id="max_tenor"
                                    name="max_tenor"
                                    type="number"
                                    min="1"
                                    defaultValue={
                                      editingProduct?.max_tenor || ""
                                    }
                                    required
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setShowProductForm(false);
                                    setEditingProduct(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  className="bg-[#5680E9] text-white hover:bg-[#4a6bc7]"
                                >
                                  {editingProduct ? "Update" : "Create"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Card>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Interest Rate</TableHead>
                                <TableHead>Amount Range</TableHead>
                                <TableHead>Tenor Range</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bankProducts.map((product) => (
                                <TableRow key={product.id}>
                                  <TableCell className="font-medium">
                                    {product.name}
                                  </TableCell>
                                  <TableCell>
                                    {(product as any).banks?.name || "Unknown"}
                                  </TableCell>
                                  <TableCell>{product.type}</TableCell>
                                  <TableCell>
                                    {product.interest_rate}%
                                  </TableCell>
                                  <TableCell>
                                    Rp {product.min_amount.toLocaleString()} -
                                    Rp {product.max_amount.toLocaleString()}
                                  </TableCell>
                                  <TableCell>
                                    {product.min_tenor} - {product.max_tenor}{" "}
                                    months
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingProduct(product);
                                          setShowProductForm(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleDeleteProduct(product.id)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {bankProducts.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              No products found. Click &quot;Add Product&quot;
                              to create your first product.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="staff" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                          Bank Staff ({bankStaff.length})
                        </h2>
                        <div className="text-sm text-gray-600">
                          Note: Bank staff are created when users register with
                          the &quot;bank_staff&quot; role
                        </div>
                      </div>
                      <Card>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bankStaff.map((staff) => (
                                <TableRow key={staff.id}>
                                  <TableCell className="font-medium">
                                    {(staff as any).users?.full_name ||
                                      "Unknown"}
                                  </TableCell>
                                  <TableCell>
                                    {(staff as any).users?.email || "Unknown"}
                                  </TableCell>
                                  <TableCell>
                                    {(staff as any).banks?.name || "Unknown"}
                                  </TableCell>
                                  <TableCell>
                                    {(staff as any).bank_branches?.name ||
                                      "Unknown"}
                                  </TableCell>
                                  <TableCell>{staff.position}</TableCell>
                                  <TableCell>
                                    {new Date(
                                      staff.created_at,
                                    ).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {bankStaff.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              No bank staff found. Bank staff are automatically
                              created when users register with the
                              &quot;bank_staff&quot; role.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          );
        }

        if (activeAdminSection === "collector") {
          return (
            <div className="min-h-screen bg-white p-4">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveAdminSection(null)}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Dashboard</span>
                    </Button>
                    <h1 className="text-3xl font-bold text-[#5680E9]">
                      Collector Management
                    </h1>
                  </div>
                  <Dialog
                    open={showCollectorForm}
                    onOpenChange={setShowCollectorForm}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingCollector(null);
                          setShowCollectorForm(true);
                        }}
                        className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Collector Company</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingCollector
                            ? "Edit Collector Company"
                            : "Add New Collector Company"}
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleSaveCollector}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="name">Company Name</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingCollector?.name || ""}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="code">Company Code</Label>
                          <Input
                            id="code"
                            name="code"
                            defaultValue={editingCollector?.code || ""}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={editingCollector?.email || ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            defaultValue={editingCollector?.phone || ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            defaultValue={editingCollector?.address || ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="license_number">License Number</Label>
                          <Input
                            id="license_number"
                            name="license_number"
                            defaultValue={
                              editingCollector?.license_number || ""
                            }
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowCollectorForm(false);
                              setEditingCollector(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-[#5680E9] text-white hover:bg-[#4a6bc7]"
                          >
                            {editingCollector ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {adminLoading ? (
                  <div className="text-center py-8">
                    <p>Loading collector companies...</p>
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Collector Companies ({collectorCompanies.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>License</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {collectorCompanies.map((collector) => (
                            <TableRow key={collector.id}>
                              <TableCell className="font-medium">
                                {collector.name}
                              </TableCell>
                              <TableCell>{collector.code}</TableCell>
                              <TableCell>{collector.email || "-"}</TableCell>
                              <TableCell>{collector.phone || "-"}</TableCell>
                              <TableCell>
                                {collector.license_number || "-"}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  collector.created_at || "",
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCollector(collector);
                                      setShowCollectorForm(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDeleteCollector(collector.id)
                                    }
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {collectorCompanies.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No collector companies found. Click &quot;Add
                          Collector Company&quot; to create your first collector
                          company.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          );
        }

        if (activeAdminSection === "insurance") {
          return (
            <div className="min-h-screen bg-white p-4">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveAdminSection(null)}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Dashboard</span>
                    </Button>
                    <h1 className="text-3xl font-bold text-[#5680E9]">
                      Insurance Management
                    </h1>
                  </div>
                  <Dialog
                    open={showInsuranceForm}
                    onOpenChange={setShowInsuranceForm}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingInsurance(null);
                          setShowInsuranceForm(true);
                        }}
                        className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Insurance Company</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingInsurance
                            ? "Edit Insurance Company"
                            : "Add New Insurance Company"}
                        </DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={handleSaveInsurance}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="name">Company Name</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingInsurance?.name || ""}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="code">Company Code</Label>
                          <Input
                            id="code"
                            name="code"
                            defaultValue={editingInsurance?.code || ""}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={editingInsurance?.email || ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            defaultValue={editingInsurance?.phone || ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            defaultValue={editingInsurance?.address || ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="license_number">License Number</Label>
                          <Input
                            id="license_number"
                            name="license_number"
                            defaultValue={
                              editingInsurance?.license_number || ""
                            }
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowInsuranceForm(false);
                              setEditingInsurance(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-[#5680E9] text-white hover:bg-[#4a6bc7]"
                          >
                            {editingInsurance ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {adminLoading ? (
                  <div className="text-center py-8">
                    <p>Loading insurance companies...</p>
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Insurance Companies ({insuranceCompanies.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>License</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {insuranceCompanies.map((insurance) => (
                            <TableRow key={insurance.id}>
                              <TableCell className="font-medium">
                                {insurance.name}
                              </TableCell>
                              <TableCell>{insurance.code}</TableCell>
                              <TableCell>{insurance.email || "-"}</TableCell>
                              <TableCell>{insurance.phone || "-"}</TableCell>
                              <TableCell>
                                {insurance.license_number || "-"}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  insurance.created_at || "",
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingInsurance(insurance);
                                      setShowInsuranceForm(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDeleteInsurance(insurance.id)
                                    }
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {insuranceCompanies.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No insurance companies found. Click &quot;Add
                          Insurance Company&quot; to create your first insurance
                          company.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          );
        }

        if (activeAdminSection === "agents") {
          return (
            <div className="min-h-screen bg-white p-4">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveAdminSection(null)}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Dashboard</span>
                    </Button>
                    <h1 className="text-3xl font-bold text-[#5680E9]">
                      Agent Management
                    </h1>
                  </div>
                  <Dialog open={showAgentForm} onOpenChange={setShowAgentForm}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingAgent(null);
                          setShowAgentForm(true);
                        }}
                        className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Agent Company</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingAgent
                            ? "Edit Agent Company"
                            : "Add New Agent Company"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSaveAgent} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Company Name</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={editingAgent?.name || ""}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="code">Company Code</Label>
                          <Input
                            id="code"
                            name="code"
                            defaultValue={editingAgent?.code || ""}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={editingAgent?.email || ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            name="phone"
                            defaultValue={editingAgent?.phone || ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            defaultValue={editingAgent?.address || ""}
                          />
                        </div>
                        <div>
                          <Label htmlFor="license_number">License Number</Label>
                          <Input
                            id="license_number"
                            name="license_number"
                            defaultValue={editingAgent?.license_number || ""}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAgentForm(false);
                              setEditingAgent(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-[#5680E9] text-white hover:bg-[#4a6bc7]"
                          >
                            {editingAgent ? "Update" : "Create"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {adminLoading ? (
                  <div className="text-center py-8">
                    <p>Loading agent companies...</p>
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Agent Companies ({agentCompanies.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>License</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agentCompanies.map((agent) => (
                            <TableRow key={agent.id}>
                              <TableCell className="font-medium">
                                {agent.name}
                              </TableCell>
                              <TableCell>{agent.code}</TableCell>
                              <TableCell>{agent.email || "-"}</TableCell>
                              <TableCell>{agent.phone || "-"}</TableCell>
                              <TableCell>
                                {agent.license_number || "-"}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  agent.created_at,
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingAgent(agent);
                                      setShowAgentForm(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteAgent(agent.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {agentCompanies.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No agent companies found. Click &quot;Add Agent
                          Company&quot; to create your first agent company.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          );
        }

        if (activeAdminSection === "applications") {
          return (
            <div className="min-h-screen bg-white p-4">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveAdminSection(null)}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Dashboard</span>
                    </Button>
                    <h1 className="text-3xl font-bold text-[#5680E9]">
                      Application Management
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 max-w-md">
                      <Input
                        placeholder="Search applications (name, email, phone, status, agent, NIK, work location)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button
                      onClick={fetchAllApplications}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Refresh Data</span>
                    </Button>
                  </div>
                </div>

                {adminLoading ? (
                  <div className="text-center py-8">
                    <p>Loading applications...</p>
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        All Loan Applications ({filteredApplications.length} of{" "}
                        {allApplications.length})
                        {searchTerm && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            - Filtered by: "{searchTerm}"
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Applicant</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead>Loan Amount</TableHead>
                              <TableHead>Tenor</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Agent</TableHead>
                              <TableHead>Submitted</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredApplications.map((application) => (
                              <TableRow key={application.id}>
                                <TableCell className="font-medium">
                                  {application.full_name}
                                </TableCell>
                                <TableCell>
                                  {application.email ||
                                    (application as any).users?.email ||
                                    "-"}
                                </TableCell>
                                <TableCell>
                                  {application.phone_number || "-"}
                                </TableCell>
                                <TableCell>
                                  {application.loan_amount
                                    ? `Rp ${application.loan_amount.toLocaleString()}`
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {application.tenor_months
                                    ? `${application.tenor_months} months`
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      application.status === "Bank Approved"
                                        ? "bg-green-100 text-green-800"
                                        : application.status ===
                                              "Bank Rejected" ||
                                            application.status === "Rejected"
                                          ? "bg-red-100 text-red-800"
                                          : application.status ===
                                                "Submitted" ||
                                              application.status ===
                                                "Checked" ||
                                              application.status === "Validated"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {application.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {(application as any).agent_companies?.name ||
                                    "-"}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    application.created_at,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleEditApplicationStatus(application)
                                      }
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleDeleteApplication(application.id)
                                      }
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {filteredApplications.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            {searchTerm ? (
                              <div>
                                <p>
                                  No applications found matching "{searchTerm}".
                                </p>
                                <p className="text-sm mt-2">
                                  Try adjusting your search terms or clear the
                                  search to see all applications.
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p>No applications found.</p>
                                <p className="text-sm mt-2">
                                  Applications will appear here once users
                                  submit loan applications.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Edit Application Status Dialog */}
                <Dialog
                  open={showApplicationEditDialog}
                  onOpenChange={(open) => {
                    console.log("Dialog open state changed:", open);
                    setShowApplicationEditDialog(open);
                    if (!open) {
                      setEditingApplication(null);
                    }
                  }}
                >
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Application Status</DialogTitle>
                    </DialogHeader>
                    {editingApplication ? (
                      <form
                        onSubmit={handleSaveApplicationStatus}
                        className="space-y-4"
                      >
                        <div>
                          <Label>
                            Applicant: {editingApplication.full_name}
                          </Label>
                        </div>
                        <div>
                          <Label>
                            Current Status: {editingApplication.status}
                          </Label>
                        </div>
                        <div>
                          <Label htmlFor="status">New Status</Label>
                          <Select
                            name="status"
                            defaultValue={editingApplication.status}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Submitted">
                                Submitted
                              </SelectItem>
                              <SelectItem value="Checked">Checked</SelectItem>
                              <SelectItem value="Validated">
                                Validated
                              </SelectItem>
                              <SelectItem value="Bank Approved">
                                Bank Approved
                              </SelectItem>
                              <SelectItem value="Bank Rejected">
                                Bank Rejected
                              </SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="comments">Comments (Optional)</Label>
                          <textarea
                            id="comments"
                            name="comments"
                            placeholder="Add any comments about this status change..."
                            rows={3}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              console.log("Cancel button clicked");
                              setShowApplicationEditDialog(false);
                              setEditingApplication(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-[#5680E9] text-white hover:bg-[#4a6bc7]"
                          >
                            Update Status
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-4">
                        <p>Loading application data...</p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          );
        }

        if (activeAdminSection === "reports") {
          return (
            <div className="min-h-screen bg-white p-4">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveAdminSection(null)}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Dashboard</span>
                    </Button>
                    <h1 className="text-3xl font-bold text-[#5680E9]">
                      System Overview
                    </h1>
                  </div>
                  <Button
                    onClick={fetchSystemStats}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Refresh Data</span>
                  </Button>
                </div>

                {adminLoading ? (
                  <div className="text-center py-8">
                    <p>Loading system statistics...</p>
                  </div>
                ) : systemStats ? (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Total Users
                              </p>
                              <p className="text-2xl font-bold text-[#5680E9]">
                                {systemStats.totalUsers}
                              </p>
                            </div>
                            <Users className="h-8 w-8 text-[#5680E9]" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Total Applications
                              </p>
                              <p className="text-2xl font-bold text-[#5680E9]">
                                {systemStats.totalApplications}
                              </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-[#5680E9]" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Partner Banks
                              </p>
                              <p className="text-2xl font-bold text-[#5680E9]">
                                {systemStats.totalBanks}
                              </p>
                            </div>
                            <Building2 className="h-8 w-8 text-[#5680E9]" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Agent Companies
                              </p>
                              <p className="text-2xl font-bold text-[#5680E9]">
                                {systemStats.totalAgents}
                              </p>
                            </div>
                            <Users className="h-8 w-8 text-[#5680E9]" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Application Status Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Pending Applications
                              </p>
                              <p className="text-2xl font-bold text-yellow-600">
                                {systemStats.pendingApplications}
                              </p>
                            </div>
                            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Approved Applications
                              </p>
                              <p className="text-2xl font-bold text-green-600">
                                {systemStats.approvedApplications}
                              </p>
                            </div>
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                              <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Rejected Applications
                              </p>
                              <p className="text-2xl font-bold text-red-600">
                                {systemStats.rejectedApplications}
                              </p>
                            </div>
                            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                              <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Applications */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Applicant Name</TableHead>
                              <TableHead>Loan Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Submitted</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {systemStats.recentApplications.map((app) => (
                              <TableRow key={app.id}>
                                <TableCell className="font-medium">
                                  {app.full_name}
                                </TableCell>
                                <TableCell>
                                  {app.loan_amount
                                    ? `Rp ${app.loan_amount.toLocaleString()}`
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      app.status === "Approved"
                                        ? "bg-green-100 text-green-800"
                                        : app.status === "Rejected"
                                          ? "bg-red-100 text-red-800"
                                          : app.status === "Pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {app.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    app.created_at,
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {systemStats.recentApplications.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            No applications found.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Click &quot;Refresh Data&quot; to load system statistics.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="min-h-screen bg-white p-4">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#5680E9] mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage banks, agents, and system settings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <div
                  className={`bg-white border rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                    activeAdminSection === "banks"
                      ? "border-[#5680E9] bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <Building2 className="h-6 w-6 text-[#5680E9] mr-2" />
                    <h3 className="text-lg font-semibold text-[#5680E9]">
                      Bank Management
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Manage bank branches, products, and staff
                  </p>
                  <Button
                    onClick={handleBankManagement}
                    className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] transition-colors duration-200"
                  >
                    Manage Banks
                  </Button>
                </div>

                <div
                  className={`bg-white border rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                    activeAdminSection === "agents"
                      ? "border-[#5680E9] bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <Users className="h-6 w-6 text-[#5680E9] mr-2" />
                    <h3 className="text-lg font-semibold text-[#5680E9]">
                      Agent Management
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Manage agent companies and staff
                  </p>
                  <Button
                    onClick={handleAgentManagement}
                    className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] transition-colors duration-200"
                  >
                    Manage Agents
                  </Button>
                </div>

                <div
                  className={`bg-white border rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                    activeAdminSection === "insurance"
                      ? "border-[#5680E9] bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <Building2 className="h-6 w-6 text-[#5680E9] mr-2" />
                    <h3 className="text-lg font-semibold text-[#5680E9]">
                      Insurance Management
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Manage insurance companies
                  </p>
                  <Button
                    onClick={handleInsuranceManagement}
                    className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] transition-colors duration-200"
                  >
                    Manage Insurance
                  </Button>
                </div>

                <div
                  className={`bg-white border rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                    activeAdminSection === "applications"
                      ? "border-[#5680E9] bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <FileText className="h-6 w-6 text-[#5680E9] mr-2" />
                    <h3 className="text-lg font-semibold text-[#5680E9]">
                      Application Management
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    View and edit all loan applications
                  </p>
                  <Button
                    onClick={handleApplicationManagement}
                    className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] transition-colors duration-200"
                  >
                    Manage Applications
                  </Button>
                </div>

                <div
                  className={`bg-white border rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                    activeAdminSection === "collector"
                      ? "border-[#5680E9] bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <Building2 className="h-6 w-6 text-[#5680E9] mr-2" />
                    <h3 className="text-lg font-semibold text-[#5680E9]">
                      Collector Management
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Manage collector companies
                  </p>
                  <Button
                    onClick={handleCollectorManagement}
                    className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] transition-colors duration-200"
                  >
                    Manage Collectors
                  </Button>
                </div>

                <div
                  className={`bg-white border rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                    activeAdminSection === "reports"
                      ? "border-[#5680E9] bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <BarChart3 className="h-6 w-6 text-[#5680E9] mr-2" />
                    <h3 className="text-lg font-semibold text-[#5680E9]">
                      System Overview
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    View system statistics and reports
                  </p>
                  <Button
                    onClick={handleSystemOverview}
                    className="bg-[#5680E9] text-white hover:bg-[#4a6bc7] transition-colors duration-200"
                  >
                    View Reports
                  </Button>
                </div>
              </div>

              <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#5680E9] mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">
                      System initialized successfully
                    </span>
                    <span className="text-sm text-gray-500">Just now</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">
                      Admin dashboard accessed
                    </span>
                    <span className="text-sm text-gray-500">1 minute ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">
                      User authentication completed
                    </span>
                    <span className="text-sm text-gray-500">2 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-4">Unknown role: {user.role}</div>;
    }
  };

  if (loading && !authInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5680E9] to-[#8860D0] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold mb-2">Lendana PMI</h2>
          <p className="text-sm opacity-90">Initializing application...</p>
          {authError && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-300 rounded text-red-100 text-sm">
              {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onGetStarted={() => (window.location.href = "/auth")}
            />
          }
        />
        <Route path="/auth" element={<AuthForm onAuthSuccess={checkUser} />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        {/* Header with user info and logout */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-[#5680E9]">Lendana PMI</h1>
              <span className="text-sm text-gray-600">
                Welcome, {user.full_name || user.email}
              </span>
              <span className="px-2 py-1 bg-[#5680E9] text-white text-xs rounded-full capitalize">
                {user.role.replace("_", " ")}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
            </Button>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/home" element={<Home />} />

          <Route path="/dashboard" element={getDashboardComponent()} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
