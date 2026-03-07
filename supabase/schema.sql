-- Run this in Supabase SQL Editor

CREATE TABLE cellar_wines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT,
  name TEXT NOT NULL,
  producer TEXT,
  vintage INTEGER,
  region TEXT,
  country TEXT,
  varietal TEXT,
  quantity INTEGER DEFAULT 1 NOT NULL,
  price_paid DECIMAL(10,2),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tasting_notes TEXT,
  drink_from INTEGER,
  drink_peak_from INTEGER,
  drink_peak_to INTEGER,
  drink_to INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE cellar_wines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_cellar_select" ON cellar_wines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_cellar_insert" ON cellar_wines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_cellar_update" ON cellar_wines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_cellar_delete" ON cellar_wines FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE dining_wines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT,
  name TEXT NOT NULL,
  producer TEXT,
  vintage INTEGER,
  region TEXT,
  country TEXT,
  varietal TEXT,
  price DECIMAL(10,2),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tasting_notes TEXT,
  restaurant_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  visited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE dining_wines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_dining_select" ON dining_wines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_dining_insert" ON dining_wines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_dining_update" ON dining_wines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_dining_delete" ON dining_wines FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cellar_wines_updated_at
  BEFORE UPDATE ON cellar_wines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage bucket (run separately if SQL doesn't work)
INSERT INTO storage.buckets (id, name, public) VALUES ('wine-photos', 'wine-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "auth_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'wine-photos');
CREATE POLICY "public_read" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'wine-photos');
CREATE POLICY "auth_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'wine-photos');
