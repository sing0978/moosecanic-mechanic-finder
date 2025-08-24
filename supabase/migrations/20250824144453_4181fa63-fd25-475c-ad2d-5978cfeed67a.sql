-- Add real-time availability flag to mechanics
ALTER TABLE public.mechanics
ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT true;

-- Ensure realtime works for mechanics table
ALTER TABLE public.mechanics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mechanics;

-- Update nearby mechanics function to only return currently available ones
CREATE OR REPLACE FUNCTION public.get_nearby_mechanics(user_lat float, user_lng float, radius_km float DEFAULT 25)
RETURNS TABLE (
  id UUID,
  name TEXT,
  shop_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  rating DECIMAL,
  total_reviews INTEGER,
  image_url TEXT,
  description TEXT,
  specialties TEXT[],
  distance_km FLOAT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.shop_name,
    m.address,
    m.phone,
    m.email,
    m.latitude,
    m.longitude,
    m.rating,
    m.total_reviews,
    m.image_url,
    m.description,
    m.specialties,
    calculate_distance(user_lat, user_lng, m.latitude::float, m.longitude::float) as distance_km
  FROM public.mechanics m
  WHERE 
    m.is_active = true 
    AND m.is_available = true
    AND calculate_distance(user_lat, user_lng, m.latitude::float, m.longitude::float) <= radius_km
  ORDER BY distance_km ASC;
END;
$$;