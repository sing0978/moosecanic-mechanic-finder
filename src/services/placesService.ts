import { supabase } from "@/integrations/supabase/client";
import { Mechanic } from "@/types/mechanic";

export interface PlacesMechanic extends Omit<Mechanic, 'id'> {
  id: string;
  source: 'google_places' | 'database';
}

export const searchNearbyMechanics = async (
  latitude: number,
  longitude: number,
  radius: number = 25000,
  categorySlug?: string
): Promise<PlacesMechanic[]> => {
  try {
    // Call the edge function to get Google Places results
    const { data: placesData, error: placesError } = await supabase.functions.invoke(
      'search-nearby-mechanics',
      {
        body: { latitude, longitude, radius }
      }
    );

    if (placesError) {
      console.error('Places API error:', placesError);
      throw placesError;
    }

    const googleMechanics = placesData?.mechanics || [];

    // Also get database mechanics using the new function with category filtering
    const { data: dbMechanics, error: dbError } = await supabase.rpc(
      'get_nearby_mechanics_public',
      {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radius / 1000,
        category_slug: categorySlug || null
      }
    );

    if (dbError) {
      console.error('Database mechanics error:', dbError);
    }

    // Transform database mechanics to include source
    const databaseMechanics = (dbMechanics || []).map((mechanic: any) => ({
      ...mechanic,
      source: 'database' as const
    }));

    // Filter Google Places results by category if specified
    let filteredGoogleMechanics = googleMechanics;
    if (categorySlug && categorySlug !== 'all') {
      filteredGoogleMechanics = googleMechanics.filter((mechanic: any) => {
        return mechanic.service_categories?.some((cat: any) => cat.slug === categorySlug);
      });
    }

    // Combine and sort by distance
    const allMechanics = [...filteredGoogleMechanics, ...databaseMechanics];
    
    return allMechanics.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));

  } catch (error) {
    console.error('Error searching nearby mechanics:', error);
    throw error;
  }
};

// Fetch service categories
export const getServiceCategories = async () => {
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }

  return data;
};