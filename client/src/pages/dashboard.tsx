import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import StatsCards from "@/components/stats-cards";
import ParkingGrid from "@/components/parking-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Bell, Search, LogOut, Menu, Settings, BarChart3, History } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">ParkSpace Pro</h1>
          </div>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            <a href="#" className="bg-primary text-white group flex items-center px-3 py-2 text-sm font-medium rounded-lg">
              <BarChart3 className="mr-3 h-4 w-4" />
              Dashboard
            </a>
            <a href="#" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors">
              <Car className="mr-3 h-4 w-4" />
              Parking Spaces
            </a>
            <a href="#" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors">
              <History className="mr-3 h-4 w-4" />
              History
            </a>
            <a href="#" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors">
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </a>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.email || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
            <Button
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">Monitor and manage parking spaces</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input 
                  type="text" 
                  placeholder="Search spaces..." 
                  className="w-64 pl-10 pr-4 py-2"
                />
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-slate-500" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <StatsCards />

          {/* Parking Lot Visualization */}
          <ParkingGrid />

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Car className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Space A5 became available</p>
                      <p className="text-xs text-slate-500">2 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Car className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Space B3 was occupied</p>
                      <p className="text-xs text-slate-500">5 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Settings className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Space A6 under maintenance</p>
                      <p className="text-xs text-slate-500">12 minutes ago</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View all activity
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Car className="h-6 w-6 mb-2" />
                    <span className="text-sm">Add Space</span>
                  </Button>

                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span className="text-sm">Generate Report</span>
                  </Button>

                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Settings className="h-6 w-6 mb-2" />
                    <span className="text-sm">Configure</span>
                  </Button>

                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <History className="h-6 w-6 mb-2" />
                    <span className="text-sm">Export Data</span>
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-primary to-blue-700 rounded-lg text-white">
                  <h4 className="font-semibold mb-2">Pro Tip</h4>
                  <p className="text-sm text-blue-100">
                    Click any parking space to instantly toggle its status. Changes are saved automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
