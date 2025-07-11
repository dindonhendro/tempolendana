import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { LoanApplication } from "@/types/supabase";

interface TimelineStep {
  title: string;
  status: "completed" | "current" | "pending" | "rejected";
  date?: string;
  description: string;
}

interface LoanApplicationTimelineProps {
  application?: LoanApplication;
}

const getTimelineSteps = (application?: LoanApplication): TimelineStep[] => {
  if (!application) {
    return [
      {
        title: "Application Submitted",
        status: "pending",
        description: "Submit your loan application",
      },
      {
        title: "Agent Review",
        status: "pending",
        description: "Application reviewed by agent",
      },
      {
        title: "Validator Review",
        status: "pending",
        description: "Application validated by Lendana team",
      },
      {
        title: "Bank Approval",
        status: "pending",
        description: "Final approval by bank staff",
      },
    ];
  }

  const steps: TimelineStep[] = [
    {
      title: "Application Submitted",
      status: "completed",
      date: new Date(application.created_at).toLocaleDateString(),
      description: "Your loan application has been submitted successfully",
    },
  ];

  // Agent Review Step
  if (application.status === "Submitted") {
    steps.push({
      title: "Agent Review",
      status: "current",
      description: "Your application is being reviewed by our agent",
    });
    steps.push({
      title: "Validator Review",
      status: "pending",
      description: "Application will be validated by Lendana team",
    });
    steps.push({
      title: "Bank Approval",
      status: "pending",
      description: "Final approval by bank staff",
    });
  } else if (application.status === "Checked") {
    steps.push({
      title: "Agent Review",
      status: "completed",
      description: "Application approved by agent",
    });
    steps.push({
      title: "Validator Review",
      status: "current",
      description: "Your application is being validated by Lendana team",
    });
    steps.push({
      title: "Bank Approval",
      status: "pending",
      description: "Final approval by bank staff",
    });
  } else if (application.status === "Validated") {
    steps.push({
      title: "Agent Review",
      status: "completed",
      description: "Application approved by agent",
    });
    steps.push({
      title: "Validator Review",
      status: "completed",
      date: application.validated_by_lendana_at
        ? new Date(application.validated_by_lendana_at).toLocaleDateString()
        : undefined,
      description: "Application validated by Lendana team",
    });
    steps.push({
      title: "Bank Approval",
      status: "current",
      description: "Your application is being reviewed by bank staff",
    });
  } else if (application.status === "Bank Approved") {
    steps.push({
      title: "Agent Review",
      status: "completed",
      description: "Application approved by agent",
    });
    steps.push({
      title: "Validator Review",
      status: "completed",
      date: application.validated_by_lendana_at
        ? new Date(application.validated_by_lendana_at).toLocaleDateString()
        : undefined,
      description: "Application validated by Lendana team",
    });
    steps.push({
      title: "Bank Approval",
      status: "completed",
      date: application.bank_approved_at
        ? new Date(application.bank_approved_at).toLocaleDateString()
        : undefined,
      description: "Congratulations! Your loan has been approved",
    });
  } else if (
    application.status === "Bank Rejected" ||
    application.status === "Rejected"
  ) {
    // Find where rejection occurred and mark as rejected
    steps.push({
      title: "Agent Review",
      status: application.status === "Rejected" ? "rejected" : "completed",
      description:
        application.status === "Rejected"
          ? "Application rejected by agent"
          : "Application approved by agent",
    });

    if (application.status === "Bank Rejected") {
      steps.push({
        title: "Validator Review",
        status: "completed",
        date: application.validated_by_lendana_at
          ? new Date(application.validated_by_lendana_at).toLocaleDateString()
          : undefined,
        description: "Application validated by Lendana team",
      });
      steps.push({
        title: "Bank Approval",
        status: "rejected",
        description: "Application rejected by bank staff",
      });
    } else {
      steps.push({
        title: "Validator Review",
        status: "pending",
        description: "Application validation pending",
      });
      steps.push({
        title: "Bank Approval",
        status: "pending",
        description: "Bank approval pending",
      });
    }
  }

  return steps;
};

const getStatusIcon = (status: TimelineStep["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    case "current":
      return <Clock className="h-6 w-6 text-blue-500" />;
    case "rejected":
      return <XCircle className="h-6 w-6 text-red-500" />;
    default:
      return <AlertCircle className="h-6 w-6 text-gray-400" />;
  }
};

const getStatusColor = (status: TimelineStep["status"]) => {
  switch (status) {
    case "completed":
      return "border-green-500 bg-green-50";
    case "current":
      return "border-blue-500 bg-blue-50";
    case "rejected":
      return "border-red-500 bg-red-50";
    default:
      return "border-gray-300 bg-gray-50";
  }
};

export default function LoanApplicationTimeline({
  application,
}: LoanApplicationTimelineProps) {
  const steps = getTimelineSteps(application);

  return (
    <div className="min-h-screen bg-white p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#5680E9]">
            Loan Application Status
          </CardTitle>
          {application && (
            <div className="text-center text-gray-600">
              <p>Application ID: {application.id}</p>
              <p>Applicant: {application.full_name}</p>
              <p>
                Current Status:{" "}
                <span className="font-semibold">{application.status}</span>
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1">
                  <Card className={`${getStatusColor(step.status)} border-l-4`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {step.description}
                          </p>
                        </div>
                        {step.date && (
                          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                            {step.date}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          {application && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Application Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Loan Amount:</span> Rp{" "}
                  {application.loan_amount?.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Tenor:</span>{" "}
                  {application.tenor_months} months
                </div>
                <div>
                  <span className="font-medium">Submission Type:</span>{" "}
                  {application.submission_type}
                </div>
                <div>
                  <span className="font-medium">Submitted:</span>{" "}
                  {new Date(application.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
