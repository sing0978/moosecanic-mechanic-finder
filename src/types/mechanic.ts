export interface ServiceCategory {
  id: string | null;
  name: string;
  slug: string;
  icon_name: string;
  description?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  shop_name: string;
  address: string;
  phone: string;
  email?: string;
  latitude: number;
  longitude: number;
  rating: number;
  total_reviews: number;
  image_url?: string;
  description?: string;
  specialties: string[];
  distance_km?: number;
  website_url?: string;
  price_range?: '$' | '$$' | '$$$';
  google_place_id?: string;
  business_status?: string;
  formatted_phone_number?: string;
  service_categories?: ServiceCategory[];
}

export interface Service {
  id: string;
  mechanic_id: string;
  category: string;
  name: string;
  price: number;
  description?: string;
}