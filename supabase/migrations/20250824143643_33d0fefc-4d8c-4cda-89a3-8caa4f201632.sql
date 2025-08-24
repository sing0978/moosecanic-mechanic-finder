-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float 
LANGUAGE plpgsql 
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$;

-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION public.get_nearby_mechanics(user_lat float, user_lng float, radius_km float DEFAULT 50)
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
    AND calculate_distance(user_lat, user_lng, m.latitude::float, m.longitude::float) <= radius_km
  ORDER BY distance_km ASC;
END;
$$;