import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface PlaceSearchRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

interface PlaceResult {
  id: string;
  displayName: {
    text: string;
  };
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingCount?: number;
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

    // Search for car repair shops and mechanics using new Places API
    const searchBody = {
      includedTypes: ['car_repair'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude: latitude,
            longitude: longitude
          },
          radius: radius
        }
      }
    };

    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types'
      },
      body: JSON.stringify(searchBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Places API error:', data);
      throw new Error(`Google Places API error: ${data.error?.message || response.status}`);
    }

    // Transform Google Places results to our mechanic format
    const mechanics = data.places?.map((place: PlaceResult) => ({
      id: `google_${place.id}`,
      name: place.displayName?.text || 'Unknown Business',
      shop_name: place.displayName?.text || 'Unknown Business',
      address: place.formattedAddress || 'Address not available',
      phone: 'Call for details',
      latitude: place.location?.latitude || 0,
      longitude: place.location?.longitude || 0,
      rating: place.rating || 0,
      total_reviews: place.userRatingCount || 0,
      specialties: ['General Automotive Repair'],
      description: 'Professional automotive services',
      distance_km: calculateDistance(
        latitude,
        longitude,
        place.location?.latitude || 0,
        place.location?.longitude || 0
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