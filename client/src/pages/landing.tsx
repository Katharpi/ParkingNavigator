import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Shield, BarChart3, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="mx-auto h-20 w-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Car className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">ParkSpace Pro</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
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
              <p className="text-blue-100">
                Monitor occupancy rates, usage patterns, and optimize space allocation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Secure Access</h3>
              <p className="text-blue-100">
                Enterprise-grade security with role-based access control
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Team Management</h3>
              <p className="text-blue-100">
                Collaborate with your team and manage multiple parking facilities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white shadow-2xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Get Started</h2>
                <p className="text-slate-600">
                  Sign in with your Replit account to access the parking management dashboard
                </p>
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full bg-primary hover:bg-blue-700 text-white py-3 text-lg font-medium"
              >
                <Car className="mr-2 h-5 w-5" />
                Sign in with Replit
              </Button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Secure authentication powered by Replit Auth
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-blue-100">
            Trusted by parking facilities worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
