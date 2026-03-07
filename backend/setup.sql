-- ============================================================
-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================================

-- 1. Create the listings table
CREATE TABLE listings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  campus TEXT,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 1,
  available_from DATE,
  available_to DATE,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed with Rutgers-area listings
INSERT INTO listings (title, description, price, city, address, campus, bedrooms, bathrooms, available_from, available_to, user_id) VALUES
  ('Sunny Studio on College Ave',
   'Cozy studio right on College Ave, steps from the Rutgers Student Center.',
   950, 'New Brunswick', '123 College Ave', 'College Ave', 0, 1, '2026-06-01', '2026-08-31', 'user_1'),

  ('Spacious 2BR on Easton Ave',
   'Large 2-bedroom right on Easton Ave, walk to College Ave campus.',
   1800, 'New Brunswick', '250 Easton Ave, Apt 3A', 'College Ave', 2, 1, '2026-05-15', '2026-08-31', 'user_2'),

  ('Affordable Room near Livi',
   'Private room in a 4BR house on Suttons Lane, 5 min to Livingston campus.',
   650, 'Piscataway', '87 Suttons Ln', 'Livingston', 1, 1, '2026-06-01', '2026-08-15', 'user_3'),

  ('Modern 1BR at The Yard',
   'Recently built apartment at The Yard with gym and parking included.',
   1500, 'New Brunswick', '101 Somerset St, Unit 4C', 'College Ave', 1, 1, '2026-05-20', '2026-08-31', 'user_1'),

  ('3BR House on Hamilton St',
   'Full house steps from Cook/Douglass campus, big backyard.',
   2800, 'New Brunswick', '45 Hamilton St', 'Cook/Douglass', 3, 2, '2026-06-01', '2026-08-20', 'user_4'),

  ('1BR near Busch Campus',
   'Quiet apartment on Bartholomew Rd, walk to SERC and ARC.',
   1100, 'Piscataway', '22 Bartholomew Rd', 'Busch', 1, 1, '2026-06-01', '2026-08-31', 'user_5'),

  ('Room in Easton Ave House',
   'Furnished room in shared house, 2 min walk to Grease Trucks.',
   750, 'New Brunswick', '180 Easton Ave', 'College Ave', 1, 1, '2026-05-25', '2026-08-15', 'user_6'),

  ('2BR on George St',
   'Renovated 2-bedroom near downtown New Brunswick, close to train station.',
   2000, 'New Brunswick', '55 George St, Apt 2B', 'College Ave', 2, 1, '2026-06-01', '2026-08-31', 'user_7'),

  ('Private Room off Livingston Ave',
   'Room in a quiet 3BR house, 10 min bus to Busch campus.',
   700, 'New Brunswick', '310 Livingston Ave', 'Livingston', 1, 1, '2026-06-15', '2026-08-31', 'user_8'),

  ('Studio near Douglass Library',
   'Small studio on Nichol Ave, perfect for summer sublet near Cook campus.',
   850, 'New Brunswick', '60 Nichol Ave', 'Cook/Douglass', 0, 1, '2026-06-01', '2026-08-15', 'user_9');

-- 3. Allow public read access (anonymous users can browse listings)
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON listings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert"
  ON listings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (true);
