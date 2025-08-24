import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mechanic } from "@/types/mechanic";
import { useToast } from "@/hooks/use-toast";

export const useMechanics = (userLocation: { lat: number; lng: number } | null) => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userLocation) {
      fetchNearbyMechanics(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  const fetchNearbyMechanics = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .rpc('get_nearby_mechanics', {
          user_lat: lat,
          user_lng: lng,
          radius_km: 50
        });

      if (error) {
        throw error;
      }

      // Transform the data to match our Mechanic interface
      const transformedMechanics: Mechanic[] = (data || []).map((mechanic: any) => ({
        id: mechanic.id,
        name: mechanic.name,
        shop_name: mechanic.shop_name,
        address: mechanic.address,
        phone: mechanic.phone,
        email: mechanic.email,
        latitude: parseFloat(mechanic.latitude),
        longitude: parseFloat(mechanic.longitude),
        rating: parseFloat(mechanic.rating),
        total_reviews: mechanic.total_reviews,
        image_url: mechanic.image_url,
        description: mechanic.description,
        specialties: mechanic.specialties || [],
        distance_km: mechanic.distance_km
      }));

      setMechanics(transformedMechanics);
      
      toast({
        title: "Mechanics found!",
        description: `Found ${transformedMechanics.length} mechanics near you`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mechanics';
      setError(errorMessage);
      toast({
        title: "Error fetching mechanics",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { mechanics, loading, error, refetch: () => userLocation && fetchNearbyMechanics(userLocation.lat, userLocation.lng) };
};