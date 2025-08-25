import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface PlaceSearchRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { latitude, longitude, radius = 25000 } = await req.json() as PlaceSearchRequest;
    
    const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured');
    }

    // Search for car repair shops and mechanics
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    searchUrl.searchParams.set('location', `${latitude},${longitude}`);
    searchUrl.searchParams.set('radius', radius.toString());
    searchUrl.searchParams.set('type', 'car_repair');
    searchUrl.searchParams.set('key', GOOGLE_PLACES_API_KEY);

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data);
      throw new Error(`Google Places API error: ${data.status}`);
    }

    // Transform Google Places results to our mechanic format
    const mechanics = data.results?.map((place: PlaceResult) => ({
      id: `google_${place.place_id}`,
      name: place.name,
      shop_name: place.name,
      address: place.vicinity || 'Address not available',
      phone: 'Call for details',
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating || 0,
      total_reviews: place.user_ratings_total || 0,
      specialties: ['General Automotive Repair'],
      description: 'Professional automotive services',
      distance_km: calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      ),
      source: 'google_places'
    })) || [];

    return new Response(
      JSON.stringify({ mechanics }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );

  } catch (error) {
    console.error('Error in search-nearby-mechanics:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        mechanics: []
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}