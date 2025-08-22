import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MechanicMap = () => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const handleEnableLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLoading(false);
        toast({
          title: "Location enabled!",
          description: `Found your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
      },
      (error) => {
        setLoading(false);
        let message = "Unable to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <Card className="h-64 bg-gradient-card border-0 shadow-card relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {location ? "Location Found!" : "Interactive Map View"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {location 
                ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`
                : "Connect GPS location services to see nearby mechanics on an interactive map"
              }
            </p>
          </div>
          <Button 
            variant="hero" 
            size="sm" 
            onClick={handleEnableLocation}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            {loading ? "Getting Location..." : location ? "Update Location" : "Enable Location"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MechanicMap;