import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mechanic } from "@/types/mechanic";
import { useToast } from "@/hooks/use-toast";
import { searchNearbyMechanics, PlacesMechanic } from "@/services/placesService";

interface UseMechanicsReturn {
  mechanics: PlacesMechanic[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useMechanics = (userLocation: { lat: number; lng: number } | null): UseMechanicsReturn => {
  const [mechanics, setMechanics] = useState<PlacesMechanic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userLocation) {
      fetchNearbyMechanics();
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
            fetchNearbyMechanics();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLocation]);

  const fetchNearbyMechanics = async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching mechanics for location:', userLocation);
      
      const mechanics = await searchNearbyMechanics(
        userLocation.lat,
        userLocation.lng,
        25000 // 25km radius in meters
      );

      console.log('Found mechanics:', mechanics);

      if (!mechanics || mechanics.length === 0) {
        setMechanics([]);
        toast({
          title: "No mechanics nearby",
          description: "We couldn't find any mechanics in your area. Try expanding your search radius.",
          variant: "default",
        });
        return;
      }

      setMechanics(mechanics);
      
      toast({
        title: "Mechanics found!",
        description: `Found ${mechanics.length} mechanics nearby.`,
      });

    } catch (err: any) {
      console.error('Error fetching mechanics:', err);
      setError(err.message || 'Failed to fetch mechanics');
      setMechanics([]);
      
      toast({
        title: "Error",
        description: "Failed to find nearby mechanics. Please try again.",
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
    refetch: fetchNearbyMechanics
  };
};