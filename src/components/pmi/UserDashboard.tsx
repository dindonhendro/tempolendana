import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  User,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  supabase,
  getCurrentUserId,
  getCurrentUser,
  deleteUserAccount,
} from "@/lib/supabase";
import { Tables } from "@/types/supabase";
import LoanApplicationForm from "./LoanApplicationForm";
import LoanApplicationTimeline from "./LoanApplicationTimeline";

type LoanApplication = Tables<"loan_applications">;

interface UserDashboardProps {
  userId?: string;
}

export default function UserDashboard({ userId }: UserDashboardProps = {}) {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedApplication, setSelectedApplication] =
    useState<LoanApplication | null>(null);
  const [editingApplication, setEditingApplication] =
    useState<LoanApplication | null>(null);
  const [preSelectedAgentId, setPreSelectedAgentId] = useState<string | null>(
    null,
  );
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    fetchApplications();
    checkSpecialUser();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const checkSpecialUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.email === "hersu@lendana.id") {
        // Find the agent company for hersu
        const { data: agentCompanies, error } = await supabase
          .from("agent_companies")
          .select("id")
          .eq("code", "hersu")
          .single();

        if (!error && agentCompanies) {
          setPreSelectedAgentId(agentCompanies.id);
        }
      }
    } catch (error) {
      console.error("Error checking special user:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const currentUserId = userId || (await getCurrentUserId());
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("loan_applications")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        setApplications(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
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

      if (error) {
        console.error("Error deleting application:", error);
        alert("Failed to delete application. Please try again.");
        return;
      }

      alert("Application deleted successfully!");
      fetchApplications(); // Refresh the list
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the application.");
    }
  };

  const handleEditApplication = (application: LoanApplication) => {
    setEditingApplication(application);
    setActiveTab("edit-application");
  };

  const canEditOrDelete = (status: string) => {
    // Only allow edit/delete for applications that haven't been processed by banks
    return ["Submitted", "Checked", "Validated"].includes(status);
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    try {
      setDeletingAccount(true);
      await deleteUserAccount(currentUser.id);

      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      alert(`Failed to delete account: ${error.message}`);
    } finally {
      setDeletingAccount(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Bank Approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Bank Rejected":
      case "Rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "Submitted":
      case "Checked":
      case "Validated":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Bank Approved":
        return "text-green-600 bg-green-100";
      case "Bank Rejected":
      case "Rejected":
        return "text-red-600 bg-red-100";
      case "Submitted":
      case "Checked":
      case "Validated":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (activeTab === "new-application") {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => setActiveTab("overview")}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <LoanApplicationForm
          onSubmit={() => {
            setActiveTab("overview");
            fetchApplications();
          }}
          preSelectedAgentId={preSelectedAgentId || undefined}
        />
      </div>
    );
  }

  if (activeTab === "edit-application" && editingApplication) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => {
              setActiveTab("overview");
              setEditingApplication(null);
            }}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <LoanApplicationForm
          editData={editingApplication}
          onSubmit={() => {
            setActiveTab("overview");
            setEditingApplication(null);
            fetchApplications();
          }}
          preSelectedAgentId={preSelectedAgentId || undefined}
        />
      </div>
    );
  }

  if (activeTab === "timeline" && selectedApplication) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <Button
            variant="outline"
            onClick={() => {
              setActiveTab("overview");
              setSelectedApplication(null);
            }}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <LoanApplicationTimeline application={selectedApplication} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#5680E9] mb-2">
            PMI Loan Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your loan applications and track their status
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setActiveTab("new-application")}
                    className="h-20 bg-[#5680E9] hover:bg-[#5680E9]/90 flex flex-col items-center justify-center space-y-2"
                  >
                    <Plus className="h-6 w-6" />
                    <span>Submit New Application</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("applications")}
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <FileText className="h-6 w-6" />
                    <span>View All Applications</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>User Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentUser ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Full Name
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {currentUser.full_name || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Email
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {currentUser.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Role
                        </label>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {currentUser.role.replace("_", " ")}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Member Since
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(
                            currentUser.created_at,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Danger Zone</span>
                      </h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700 mb-4">
                          Deleting your account will permanently remove all your
                          data, including loan applications and cannot be
                          undone.
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              disabled={deletingAccount}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deletingAccount
                                ? "Deleting..."
                                : "Delete Account"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove all
                                your data from our servers, including:
                                <br />
                                <br />
                                • All loan applications • Personal information •
                                Account history
                                <br />
                                <br />
                                You will be immediately signed out and will not
                                be able to recover this data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Yes, delete my account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>Loading profile information...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Loan Applications</CardTitle>
                  <Button
                    onClick={() => setActiveTab("new-application")}
                    className="bg-[#5680E9] hover:bg-[#5680E9]/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Application
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p>Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No applications found</p>
                    <Button
                      onClick={() => setActiveTab("new-application")}
                      className="bg-[#5680E9] hover:bg-[#5680E9]/90"
                    >
                      Submit Your First Application
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <Card
                        key={application.id}
                        className="border-l-4 border-l-[#5680E9]"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusIcon(application.status)}
                                <h3 className="font-semibold">
                                  {application.full_name}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}
                                >
                                  {application.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">
                                    Loan Amount:
                                  </span>{" "}
                                  Rp {application.loan_amount?.toLocaleString()}
                                </div>
                                <div>
                                  <span className="font-medium">Tenor:</span>{" "}
                                  {application.tenor_months} months
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Submitted:
                                  </span>{" "}
                                  {new Date(
                                    application.created_at,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setActiveTab("timeline");
                                }}
                              >
                                View Timeline
                              </Button>
                              {canEditOrDelete(application.status) && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleEditApplication(application)
                                    }
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteApplication(application.id)
                                    }
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
