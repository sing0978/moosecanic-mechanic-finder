-- Add new columns to mechanics table for enhanced features
ALTER TABLE public.mechanics 
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS price_range text CHECK (price_range IN ('$', '$$', '$$$')),
ADD COLUMN IF NOT EXISTS google_place_id text UNIQUE,
ADD COLUMN IF NOT EXISTS business_status text,
ADD COLUMN IF NOT EXISTS formatted_phone_number text,
ADD COLUMN IF NOT EXISTS opening_hours jsonb,
ADD COLUMN IF NOT EXISTS photos text[],
ADD COLUMN IF NOT EXISTS reviews jsonb[];

-- Update services table to be more comprehensive
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS estimated_duration_minutes integer,
ADD COLUMN IF NOT EXISTS is_popular boolean DEFAULT false;

-- Create service categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon_name text,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert predefined service categories
INSERT INTO public.service_categories (name, slug, icon_name, description, sort_order) VALUES
('Brake Repair', 'brake-repair', 'disc', 'Complete brake system diagnosis and repair services', 1),
('Oil Change', 'oil-change', 'droplets', 'Regular oil changes and fluid maintenance', 2),
('Transmission', 'transmission', 'settings', 'Transmission repair and maintenance services', 3),
('Engine Diagnostics', 'engine-diagnostics', 'search', 'Computer diagnostics and engine troubleshooting', 4),
('Tire Services', 'tire-services', 'circle', 'Tire installation, rotation, and repair services', 5),
('Battery Replacement', 'battery-replacement', 'zap', 'Battery testing, replacement, and electrical services', 6),
('General Automotive Repair', 'general-repair', 'wrench', 'Comprehensive automotive repair and maintenance', 7)
ON CONFLICT (slug) DO NOTHING;

-- Create junction table for mechanic-category relationships
CREATE TABLE IF NOT EXISTS public.mechanic_service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id uuid NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(mechanic_id, category_id)
);

-- Enable RLS on new tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_service_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for service_categories
CREATE POLICY "Service categories are publicly viewable" 
ON public.service_categories 
FOR SELECT 
USING (is_active = true);

-- Create policies for mechanic_service_categories
CREATE POLICY "Mechanic service categories are publicly viewable" 
ON public.mechanic_service_categories 
FOR SELECT 
USING (true);

-- Update the get_nearby_mechanics_public function to include new fields
CREATE OR REPLACE FUNCTION public.get_nearby_mechanics_public(user_lat double precision, user_lng double precision, radius_km double precision DEFAULT 25, category_slug text DEFAULT NULL)
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
  distance_km double precision,
  website_url text,
  price_range text,
  google_place_id text,
  business_status text,
  service_categories jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    calculate_distance(user_lat, user_lng, m.latitude::float, m.longitude::float) as distance_km,
    m.website_url,
    m.price_range,
    m.google_place_id,
    m.business_status,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', sc.id,
            'name', sc.name,
            'slug', sc.slug,
            'icon_name', sc.icon_name
          )
        )
        FROM public.mechanic_service_categories msc
        JOIN public.service_categories sc ON msc.category_id = sc.id
        WHERE msc.mechanic_id = m.id AND sc.is_active = true
      ),
      '[]'::jsonb
    ) as service_categories
  FROM public.mechanics m
  WHERE 
    m.is_active = true 
    AND m.is_available = true
    AND calculate_distance(user_lat, user_lng, m.latitude::float, m.longitude::float) <= radius_km
    AND (
      category_slug IS NULL 
      OR EXISTS (
        SELECT 1 
        FROM public.mechanic_service_categories msc
        JOIN public.service_categories sc ON msc.category_id = sc.id
        WHERE msc.mechanic_id = m.id AND sc.slug = category_slug AND sc.is_active = true
      )
    )
  ORDER BY distance_km ASC;
END;
$$;