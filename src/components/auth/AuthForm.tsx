import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  signIn,
  signUp,
  getAgentCompanies,
  getBanks,
  getBankBranches,
  getInsuranceCompanies,
  getCollectorCompanies,
} from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  onAuthSuccess?: () => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up Form State
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [agentCompanyId, setAgentCompanyId] = useState("");
  const [agentCompanies, setAgentCompanies] = useState<any[]>([]);
  const [bankId, setBankId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [banks, setBanks] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [insuranceCompanyId, setInsuranceCompanyId] = useState("");
  const [insuranceCompanies, setInsuranceCompanies] = useState<any[]>([]);
  const [collectorCompanyId, setCollectorCompanyId] = useState("");
  const [collectorCompanies, setCollectorCompanies] = useState<any[]>([]);

  // Load agent companies and banks on component mount
  React.useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [companies, banksData, insuranceData, collectorData] =
          await Promise.all([
            getAgentCompanies(),
            getBanks(),
            getInsuranceCompanies(),
            getCollectorCompanies(),
          ]);
        if (isMounted) {
          setAgentCompanies(companies || []);
          setBanks(banksData || []);
          setInsuranceCompanies(insuranceData || []);
          setCollectorCompanies(collectorData || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        if (isMounted) {
          setAgentCompanies([]);
          setBanks([]);
          setInsuranceCompanies([]);
          setCollectorCompanies([]);
        }
      }
    };

    // Load data with timeout fallback
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn("Data loading timeout, setting empty arrays");
        setAgentCompanies([]);
        setBanks([]);
        setInsuranceCompanies([]);
        setCollectorCompanies([]);
      }
    }, 5000); // 5 second timeout

    loadData().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Load branches when bank is selected
  React.useEffect(() => {
    if (bankId) {
      const loadBranches = async () => {
        try {
          const branchesData = await getBankBranches(bankId);
          setBranches(branchesData || []);
        } catch (error) {
          console.error("Error loading branches:", error);
          setBranches([]);
        }
      };
      loadBranches();
    } else {
      setBranches([]);
      setBranchId("");
    }
  }, [bankId]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await signIn(signInEmail, signInPassword);
      setSuccess("Successfully signed in!");
      if (onAuthSuccess) onAuthSuccess();
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!role) {
      setError("Please select a role");
      setIsLoading(false);
      return;
    }

    if (role === "agent" && !agentCompanyId) {
      setError("Please select an agent company");
      setIsLoading(false);
      return;
    }

    if (role === "bank_staff" && (!bankId || !branchId)) {
      setError("Please select a bank and branch");
      setIsLoading(false);
      return;
    }

    if (role === "insurance" && !insuranceCompanyId) {
      setError("Please select an insurance company");
      setIsLoading(false);
      return;
    }

    if (role === "collector" && !collectorCompanyId) {
      setError("Please select a collector company");
      setIsLoading(false);
      return;
    }

    try {
      await signUp(
        signUpEmail,
        signUpPassword,
        role,
        fullName,
        role === "insurance"
          ? insuranceCompanyId
          : role === "collector"
            ? collectorCompanyId
            : agentCompanyId,
        bankId,
        branchId,
      );
      setSuccess(
        "Account created successfully! Please check your email to verify your account.",
      );
      // Reset form
      setSignUpEmail("");
      setSignUpPassword("");
      setFullName("");
      setRole("");
      setAgentCompanyId("");
      setBankId("");
      setBranchId("");
      setInsuranceCompanyId("");
      setCollectorCompanyId("");
    } catch (error: any) {
      setError(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = (testEmail: string) => {
    setSignInEmail(testEmail);
    setSignInPassword("123456");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5680E9] to-[#8860D0] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-[#5680E9]">
            Lendana PMI Loan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#5680E9] hover:bg-[#5680E9]/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  Test Accounts:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fillTestCredentials("user10@lendana.id")}
                  >
                    User
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fillTestCredentials("bijak10@lendana.id")}
                  >
                    Agent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fillTestCredentials("admin10@lendana.id")}
                  >
                    Validator
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fillTestCredentials("bni_melawaai10@lendana.id")
                    }
                  >
                    Bank Staff
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={role}
                    onValueChange={(value) => {
                      setRole(value);
                      if (value !== "agent") {
                        setAgentCompanyId("");
                      }
                      if (value !== "bank_staff") {
                        setBankId("");
                        setBranchId("");
                      }
                      if (value !== "insurance") {
                        setInsuranceCompanyId("");
                      }
                      if (value !== "collector") {
                        setCollectorCompanyId("");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User (PMI)</SelectItem>
                      <SelectItem value="agent">Agent (P3MI)</SelectItem>
                      <SelectItem value="validator">
                        Validator (Lendana)
                      </SelectItem>
                      <SelectItem value="bank_staff">Bank Staff</SelectItem>
                      <SelectItem value="insurance">Insurance Staff</SelectItem>
                      <SelectItem value="collector">Collector Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role === "agent" && (
                  <div>
                    <Label htmlFor="agent-company">Agent Company *</Label>
                    <Select
                      value={agentCompanyId}
                      onValueChange={setAgentCompanyId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent company" />
                      </SelectTrigger>
                      <SelectContent>
                        {agentCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {role === "bank_staff" && (
                  <>
                    <div>
                      <Label htmlFor="bank">Bank</Label>
                      <Select
                        value={bankId}
                        onValueChange={(value) => {
                          setBankId(value);
                          setBranchId(""); // Reset branch when bank changes
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {banks.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.name} ({bank.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {bankId && (
                      <div>
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={branchId} onValueChange={setBranchId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name} - {branch.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}

                {role === "insurance" && (
                  <div>
                    <Label htmlFor="insurance-company">
                      Insurance Company *
                    </Label>
                    <Select
                      value={insuranceCompanyId}
                      onValueChange={setInsuranceCompanyId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select insurance company" />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {role === "collector" && (
                  <div>
                    <Label htmlFor="collector-company">
                      Collector Company *
                    </Label>
                    <Select
                      value={collectorCompanyId}
                      onValueChange={setCollectorCompanyId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collector company" />
                      </SelectTrigger>
                      <SelectContent>
                        {collectorCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#5680E9] hover:bg-[#5680E9]/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
