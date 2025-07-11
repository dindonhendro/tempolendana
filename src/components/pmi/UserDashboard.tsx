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
} from "lucide-react";
import { supabase, getCurrentUserId } from "@/lib/supabase";
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

  useEffect(() => {
    fetchApplications();
  }, []);

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
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Applications
                      </p>
                      <p className="text-2xl font-bold text-[#5680E9]">
                        {applications.length}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-[#5680E9]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {
                          applications.filter((app) =>
                            ["Submitted", "Checked", "Validated"].includes(
                              app.status,
                            ),
                          ).length
                        }
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Approved
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {
                          applications.filter(
                            (app) => app.status === "Bank Approved",
                          ).length
                        }
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Rejected
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {
                          applications.filter((app) =>
                            ["Bank Rejected", "Rejected"].includes(app.status),
                          ).length
                        }
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

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
