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

  // Set up real-time subscription for mechanics availability changes
  useEffect(() => {
    const channel = supabase
      .channel('mechanics-availability')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mechanics'
        },
        (payload) => {
          console.log('Mechanic availability changed:', payload);
          // Refetch nearby mechanics when availability changes
          if (userLocation) {
            fetchNearbyMechanics(userLocation.lat, userLocation.lng);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLocation]);

  const fetchNearbyMechanics = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch real-time data of only available mechanics near current GPS location
      const { data, error } = await supabase
        .rpc('get_nearby_mechanics', {
          user_lat: lat,
          user_lng: lng,
          radius_km: 25 // Reduced radius for more accurate nearby results
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
      
      const message = transformedMechanics.length > 0 
        ? `Found ${transformedMechanics.length} available mechanics within 25km`
        : "No mechanics currently available in your area. Try expanding your search radius.";
      
      toast({
        title: transformedMechanics.length > 0 ? "Live mechanics found!" : "No mechanics nearby",
        description: message,
        variant: transformedMechanics.length > 0 ? "default" : "destructive"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch live mechanic data';
      setError(errorMessage);
      toast({
        title: "Error fetching live data",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { 
    mechanics, 
    loading, 
    error, 
    refetch: () => userLocation && fetchNearbyMechanics(userLocation.lat, userLocation.lng) 
  };
};