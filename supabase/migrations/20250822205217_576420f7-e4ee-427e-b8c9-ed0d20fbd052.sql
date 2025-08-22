-- Create mechanics table with location data
CREATE TABLE public.mechanics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  image_url TEXT,
  description TEXT,
  specialties TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mechanic_id UUID NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (users can view all mechanics)
CREATE POLICY "Mechanics are publicly viewable" 
ON public.mechanics 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Services are publicly viewable" 
ON public.services 
FOR SELECT 
USING (true);

-- Create function to calculate distance between two points
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to find nearby mechanics
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
) AS $$
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
$$ LANGUAGE plpgsql;

-- Insert sample mechanics data with real coordinates
INSERT INTO public.mechanics (name, shop_name, address, phone, latitude, longitude, rating, total_reviews, description, specialties, is_verified, is_active) VALUES
('John Smith', 'Downtown Auto Repair', '123 Main St, New York, NY', '+1-555-0101', 40.7580, -73.9855, 4.8, 127, 'Expert automotive service with 15+ years experience', ARRAY['Engine Repair', 'Brake Change', 'Oil Change'], true, true),
('Maria Garcia', 'QuickFix Garage', '456 Oak Ave, New York, NY', '+1-555-0102', 40.7505, -73.9934, 4.6, 89, 'Fast and reliable auto services', ARRAY['Tire Change', 'Battery Replacement', 'AC Service'], true, true),
('David Wilson', 'Pro Mechanic Shop', '789 Broadway, New York, NY', '+1-555-0103', 40.7589, -73.9851, 4.9, 156, 'Professional automotive solutions', ARRAY['Transmission Repair', 'General Checkup', 'Engine Repair'], true, true),
('Sarah Johnson', 'City Auto Care', '321 Park Ave, New York, NY', '+1-555-0104', 40.7614, -73.9776, 4.7, 94, 'Complete automotive care services', ARRAY['Brake Change', 'Oil Change', 'Tire Change'], true, true),
('Mike Thompson', 'Express Auto Service', '654 5th Ave, New York, NY', '+1-555-0105', 40.7505, -73.9850, 4.5, 67, 'Quick and affordable auto repairs', ARRAY['Battery Replacement', 'AC Service', 'General Checkup'], true, true);

-- Insert sample services
INSERT INTO public.services (mechanic_id, category, name, price, description) 
SELECT 
  m.id,
  unnest(ARRAY['Oil Change', 'Brake Change', 'Tire Change', 'General Checkup']) as category,
  unnest(ARRAY['Full Synthetic Oil Change', 'Brake Pad Replacement', 'Tire Installation', 'Complete Vehicle Inspection']) as name,
  unnest(ARRAY[59.99, 149.99, 89.99, 79.99]) as price,
  unnest(ARRAY['Premium oil change service', 'Professional brake service', 'Expert tire installation', 'Comprehensive vehicle checkup']) as description
FROM public.mechanics m
LIMIT 5;