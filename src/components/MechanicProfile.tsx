import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mechanic } from "@/types/mechanic";
import { Star, MapPin, Phone, Globe, Clock, DollarSign, Wrench } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface MechanicProfileProps {
  mechanic: Mechanic | null;
  isOpen: boolean;
  onClose: () => void;
}

const MechanicProfile = ({ mechanic, isOpen, onClose }: MechanicProfileProps) => {
  if (!mechanic) return null;

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Wrench;
    return IconComponent;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getPriceDisplay = (priceRange?: string) => {
    if (!priceRange) return "Contact for pricing";
    
    const priceLabels = {
      '$': 'Budget-friendly',
      '$$': 'Moderate pricing', 
      '$$$': 'Premium service'
    };
    
    return `${priceRange} - ${priceLabels[priceRange as keyof typeof priceLabels]}`;
  };

  const handleCall = () => {
    if (mechanic.formatted_phone_number || mechanic.phone) {
      const phoneNumber = mechanic.formatted_phone_number || mechanic.phone;
      window.open(`tel:${phoneNumber}`, '_self');
    }
  };

  const handleWebsite = () => {
    if (mechanic.website_url) {
      window.open(mechanic.website_url, '_blank');
    }
  };

  const handleDirections = () => {
    const address = encodeURIComponent(mechanic.address);
    window.open(`https://maps.google.com/maps?daddr=${address}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{mechanic.shop_name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Rating and Reviews */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(mechanic.rating)}</div>
              <span className="font-medium">{mechanic.rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">
              ({mechanic.total_reviews} review{mechanic.total_reviews !== 1 ? 's' : ''})
            </span>
            {mechanic.distance_km && (
              <Badge variant="secondary">
                {mechanic.distance_km.toFixed(1)} km away
              </Badge>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{mechanic.address}</span>
            </div>
            
            {(mechanic.formatted_phone_number || mechanic.phone) && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{mechanic.formatted_phone_number || mechanic.phone}</span>
              </div>
            )}
            
            {mechanic.website_url && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <a 
                  href={mechanic.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span>{getPriceDisplay(mechanic.price_range)}</span>
          </div>

          <Separator />

          {/* Service Categories */}
          {mechanic.service_categories && mechanic.service_categories.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Services Offered
              </h4>
              <div className="flex flex-wrap gap-2">
                {mechanic.service_categories.map((category) => {
                  const IconComponent = getIcon(category.icon_name);
                  return (
                    <Badge key={category.slug} variant="outline" className="h-8">
                      <IconComponent className="h-3 w-3 mr-1" />
                      {category.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {mechanic.description && (
            <div>
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-muted-foreground">{mechanic.description}</p>
            </div>
          )}

          {/* Business Status */}
          {mechanic.business_status && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <Badge 
                variant={mechanic.business_status === 'OPERATIONAL' ? 'default' : 'secondary'}
              >
                {mechanic.business_status === 'OPERATIONAL' ? 'Open' : mechanic.business_status}
              </Badge>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {(mechanic.formatted_phone_number || mechanic.phone) && (
              <Button onClick={handleCall} className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            )}
            
            <Button onClick={handleDirections} variant="outline" className="flex-1">
              <MapPin className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
            
            {mechanic.website_url && (
              <Button onClick={handleWebsite} variant="outline" className="flex-1">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MechanicProfile;