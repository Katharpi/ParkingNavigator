import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Car, RefreshCw, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParkingSpace {
  id: number;
  spaceNumber: string;
  section: string;
  status: 'available' | 'occupied' | 'maintenance';
  lastUpdated: string;
  occupiedBy?: string;
  createdAt: string;
}

export default function ParkingGrid() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: spaces, isLoading, error } = useQuery<ParkingSpace[]>({
    queryKey: ["/api/parking/spaces"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateSpaceMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/parking/spaces/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parking/spaces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parking/stats"] });
      toast({
        title: "Success",
        description: "Parking space status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update parking space status",
        variant: "destructive",
      });
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parking/spaces"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parking/stats"] });
      toast({
        title: "Success",
        description: "Parking data refreshed successfully",
      });
    },
  });

  const handleSpaceClick = (space: ParkingSpace) => {
    if (space.status === 'maintenance') return; // Can't toggle maintenance spaces

    const newStatus = space.status === 'available' ? 'occupied' : 'available';
    updateSpaceMutation.mutate({ id: space.id, status: newStatus });
  };

  const getSpaceColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'occupied':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'maintenance':
        return 'bg-yellow-500 text-white cursor-not-allowed';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const groupedSpaces = spaces?.reduce((acc, space) => {
    if (!acc[space.section]) {
      acc[space.section] = [];
    }
    acc[space.section].push(space);
    return acc;
  }, {} as Record<string, ParkingSpace[]>) || {};

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Parking Lot Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Parking Lot Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Failed to load parking spaces</p>
            <Button onClick={() => refreshMutation.mutate()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Parking Lot Layout
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Click on any space to toggle its status
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-slate-600">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-slate-600">Occupied</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-slate-600">Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {Object.entries(groupedSpaces).map(([section, sectionSpaces]) => (
          <div key={section} className="mb-8">
            <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Section {section}
            </h3>
            <div className={cn(
              "grid gap-3",
              section === 'A' ? "grid-cols-8" : 
              section === 'B' ? "grid-cols-10" : 
              "grid-cols-12"
            )}>
              {sectionSpaces
                .sort((a, b) => {
                  const aNum = parseInt(a.spaceNumber.substring(1));
                  const bNum = parseInt(b.spaceNumber.substring(1));
                  return aNum - bNum;
                })
                .map((space) => (
                <button
                  key={space.id}
                  onClick={() => handleSpaceClick(space)}
                  disabled={space.status === 'maintenance' || updateSpaceMutation.isPending}
                  className={cn(
                    "parking-space rounded-lg p-4 flex flex-col items-center justify-center h-20 w-16 relative group transition-all duration-200 transform",
                    getSpaceColor(space.status),
                    space.status !== 'maintenance' && "hover:scale-105 cursor-pointer",
                    updateSpaceMutation.isPending && "opacity-50"
                  )}
                >
                  <Car className="h-5 w-5 mb-1" />
                  <span className="text-xs font-semibold">{space.spaceNumber}</span>
                  {space.status !== 'maintenance' && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Parking lot controls */}
        <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="bg-primary hover:bg-blue-700"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", refreshMutation.isPending && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>
          <div className="text-sm text-slate-500">
            Last updated: {spaces && spaces.length > 0 ? 'Just now' : 'Never'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
