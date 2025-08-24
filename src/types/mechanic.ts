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
}

export interface Service {
  id: string;
  mechanic_id: string;
  category: string;
  name: string;
  price: number;
  description?: string;
}