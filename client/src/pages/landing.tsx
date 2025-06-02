import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Car, Shield, BarChart3, Users, LogIn, UserPlus } from "lucide-react";

export default function Landing() {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    username: "", 
    password: "", 
    email: "", 
    firstName: "", 
    lastName: "" 
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: typeof loginData) => {
      await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof registerData) => {
      await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-green-600">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="mx-auto h-20 w-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Car className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">ParkSpace Pro</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Intelligent parking management system for modern facilities. 
            Track, manage, and optimize your parking spaces in real-time.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Analytics</h3>
              <p className="text-green-100">
                Monitor occupancy rates, usage patterns, and optimize space allocation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Secure Access</h3>
              <p className="text-green-100">
                Username and password authentication with secure sessions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Team Management</h3>
              <p className="text-green-100">
                Collaborate with your team and manage multiple parking facilities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Auth Section */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Dashboard</h2>
                <p className="text-slate-600">
                  Sign in or create an account to manage parking spaces
                </p>
              </div>
              
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                  
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Demo Account:</strong><br />
                      Username: admin<br />
                      Password: admin123
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        placeholder="Choose username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Choose password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="First name"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-green-100">
            Trusted by parking facilities worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
