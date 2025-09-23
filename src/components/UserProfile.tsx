import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Trash2, 
  AlertTriangle,
  Edit,
  Save,
  X
} from "lucide-react";
import { getCurrentUser, deleteUserAccount, signOut } from "@/lib/supabase";
import { User as UserType } from "@/types/supabase";

interface UserProfileProps {
  onProfileDeleted?: () => void;
}

export default function UserProfile({ onProfileDeleted }: UserProfileProps = {}) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [confirmDataDeletion, setConfirmDataDeletion] = useState(false);
  const [confirmAccountDeletion, setConfirmAccountDeletion] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setEditedName(currentUser.full_name || "");
      }
    } catch (error: any) {
      console.error("Error loading user profile:", error);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setError("");
      setSuccess("");
      
      // Here you would typically update the user profile in the database
      // For now, we'll just update the local state
      setUser({ ...user, full_name: editedName });
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    }
  };

  const handleDeleteAllData = async () => {
    if (!user) return;

    if (deleteConfirmation !== "DELETE ALL MY DATA") {
      setError("Please type 'DELETE ALL MY DATA' to confirm");
      return;
    }

    if (!confirmDataDeletion || !confirmAccountDeletion) {
      setError("Please confirm both checkboxes to proceed");
      return;
    }

    try {
      setIsDeleting(true);
      setError("");
      
      console.log("Starting user account deletion process...");
      
      // Delete user account and all related data
      await deleteUserAccount(user.id);
      
      console.log("User account deleted successfully");
      
      // Sign out the user
      await signOut();
      
      // Call the callback if provided
      if (onProfileDeleted) {
        onProfileDeleted();
      } else {
        // Redirect to home page or login
        window.location.href = "/";
      }
      
    } catch (error: any) {
      console.error("Error deleting user data:", error);
      setError(`Failed to delete user data: ${error.message}`);
      setIsDeleting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      validator: "bg-blue-100 text-blue-800",
      agent: "bg-green-100 text-green-800",
      checker_agent: "bg-purple-100 text-purple-800",
      bank_staff: "bg-yellow-100 text-yellow-800",
      insurance: "bg-indigo-100 text-indigo-800",
      collector: "bg-orange-100 text-orange-800",
      user: "bg-gray-100 text-gray-800",
      wirausaha: "bg-teal-100 text-teal-800",
      perusahaan: "bg-pink-100 text-pink-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const formatRole = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: "Administrator",
      validator: "Validator Lendana",
      agent: "Agent P3MI",
      checker_agent: "Checker Agent P3MI",
      bank_staff: "Bank Staff",
      insurance: "Insurance Staff",
      collector: "Collector Staff",
      user: "User PMI",
      wirausaha: "Wirausaha PMI",
      perusahaan: "Perusahaan P3MI",
    };
    return roleNames[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5680E9] to-[#8860D0] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5680E9]"></div>
              <span className="ml-2">Loading profile...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#5680E9] to-[#8860D0] flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-gray-600">Unable to load user profile. Please try logging in again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5680E9] to-[#8860D0] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-[#5680E9] rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-[#5680E9]">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="text-xl font-semibold"
                          placeholder="Enter your name"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveProfile}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setEditedName(user.full_name || "");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{user.full_name || "No Name"}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {formatRole(user.role)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Details */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address
                </Label>
                <Input value={user.email} disabled className="bg-gray-50" />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  User ID
                </Label>
                <Input value={user.id} disabled className="bg-gray-50 font-mono text-sm" />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Account Created
                </Label>
                <Input 
                  value={new Date(user.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} 
                  disabled 
                  className="bg-gray-50" 
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Updated
                </Label>
                <Input 
                  value={new Date(user.updated_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} 
                  disabled 
                  className="bg-gray-50" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">Delete All User Data</h3>
              <p className="text-red-700 text-sm mb-4">
                This action will permanently delete your account and all associated data including:
              </p>
              <ul className="text-red-700 text-sm space-y-1 mb-4 ml-4">
                <li>• Your user profile and account information</li>
                <li>• All loan applications and related documents</li>
                <li>• Bank reviews and branch applications</li>
                <li>• Insurance and collector assignments</li>
                <li>• All uploaded files and photos</li>
                <li>• Staff records (if applicable)</li>
              </ul>
              <p className="text-red-800 font-semibold text-sm mb-4">
                ⚠️ This action cannot be undone and you will be immediately logged out.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete All My Data"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">
                      Confirm Data Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>
                        You are about to permanently delete all your data. This action cannot be undone.
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                            Type "DELETE ALL MY DATA" to confirm:
                          </Label>
                          <Input
                            id="delete-confirmation"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="DELETE ALL MY DATA"
                            className="mt-1"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="confirm-data-deletion"
                              checked={confirmDataDeletion}
                              onCheckedChange={(checked) => setConfirmDataDeletion(checked as boolean)}
                              className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor="confirm-data-deletion"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                I understand that all my data will be permanently deleted
                              </label>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="confirm-account-deletion"
                              checked={confirmAccountDeletion}
                              onCheckedChange={(checked) => setConfirmAccountDeletion(checked as boolean)}
                              className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor="confirm-account-deletion"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                I understand that my account will be permanently closed
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel 
                      onClick={() => {
                        setDeleteConfirmation("");
                        setConfirmDataDeletion(false);
                        setConfirmAccountDeletion(false);
                        setError("");
                      }}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllData}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={
                        isDeleting || 
                        deleteConfirmation !== "DELETE ALL MY DATA" ||
                        !confirmDataDeletion ||
                        !confirmAccountDeletion
                      }
                    >
                      {isDeleting ? "Deleting..." : "Delete All Data"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center text-green-700">
                <User className="h-4 w-4 mr-2" />
                {success}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}