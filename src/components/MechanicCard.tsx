import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, MapPin, Wrench } from "lucide-react";
import { Mechanic } from "@/types/mechanic";

interface MechanicCardProps {
  mechanic: Mechanic;
}

const MechanicCard = ({ mechanic }: MechanicCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-accent text-accent" : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-elegant transition-smooth border-0">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{mechanic.name}</h3>
            <p className="text-primary font-medium">{mechanic.shop_name}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {mechanic.distance_km ? `${mechanic.distance_km.toFixed(1)} km` : 'Distance unknown'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 mt-2">
          <div className="flex">{renderStars(mechanic.rating)}</div>
          <span className="text-sm text-muted-foreground ml-1">
            {mechanic.rating} ({mechanic.total_reviews} reviews)
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            {mechanic.address}
          </div>
          
          <div className="flex flex-wrap gap-1">
            {mechanic.specialties.map((specialty) => (
              <Badge key={specialty} variant="outline" className="text-xs">
                <Wrench className="w-3 h-3 mr-1" />
                {specialty}
              </Badge>
            ))}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Specialties:</p>
            <p className="text-sm text-muted-foreground">
              {mechanic.description || "Professional automotive services"}
            </p>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={() => window.open(`tel:${mechanic.phone}`, '_self')}
            >
              <Phone className="w-4 h-4 mr-1" />
              Call Now
            </Button>
            <Button variant="service" size="sm" className="flex-1">
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MechanicCard;