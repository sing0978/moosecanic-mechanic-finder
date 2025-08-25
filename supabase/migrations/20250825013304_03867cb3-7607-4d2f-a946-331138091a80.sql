-- Fix: Prevent public exposure of phone/email from mechanics table
-- 1) Remove public SELECT policy on mechanics (prevents direct reads of sensitive columns)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'mechanics' AND policyname = 'Mechanics are publicly viewable'
  ) THEN
    EXECUTE 'DROP POLICY "Mechanics are publicly viewable" ON public.mechanics';
  END IF;
END$$;

-- 2) Create a public-safe RPC that excludes sensitive columns
CREATE OR REPLACE FUNCTION public.get_nearby_mechanics_public(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 25
)
RETURNS TABLE(
  id uuid,
  name text,
  shop_name text,
  address text,
  latitude numeric,
  longitude numeric,
  rating numeric,
  total_reviews integer,
  image_url text,
  description text,
  specialties text[],
  distance_km double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.shop_name,
    m.address,
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3) Ensure realtime remains enabled for mechanics (no change to availability updates)
ALTER TABLE public.mechanics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mechanics;