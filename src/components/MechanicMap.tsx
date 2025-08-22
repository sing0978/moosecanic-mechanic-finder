import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

const MechanicMap = () => {
  return (
    <Card className="h-64 bg-gradient-card border-0 shadow-card relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Interactive Map View</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connect GPS location services to see nearby mechanics on an interactive map
            </p>
          </div>
          <Button variant="hero" size="sm">
            <Navigation className="w-4 h-4 mr-2" />
            Enable Location
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MechanicMap;