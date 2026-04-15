-- ============================================================
-- Run this in Supabase SQL Editor.
-- Migration-safe schema upgrade for the Rutgers Sublet Platform.
-- This version assumes an existing UUID-based schema.
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. Profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  rutgers_affiliation TEXT,
  preferred_contact_method TEXT NOT NULL DEFAULT 'email',
  phone TEXT,
  is_renter BOOLEAN NOT NULL DEFAULT true,
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Listings upgrade
-- ============================================================
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS baths NUMERIC,
  ADD COLUMN IF NOT EXISTS roommate_type TEXT,
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS available_from DATE,
  ADD COLUMN IF NOT EXISTS available_to DATE,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'user_posted';

-- Copy legacy bathrooms values into baths when present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'listings'
      AND column_name = 'bathrooms'
  ) THEN
    EXECUTE '
      UPDATE public.listings
      SET baths = bathrooms
      WHERE baths IS NULL
    ';
  END IF;
END $$;

UPDATE public.listings
SET baths = 0
WHERE baths IS NULL;

ALTER TABLE public.listings
  ALTER COLUMN baths SET DEFAULT 0,
  ALTER COLUMN baths SET NOT NULL;

UPDATE public.listings
SET source = 'user_posted'
WHERE source IS NULL
   OR source NOT IN ('user_posted', 'admin_imported', 'externally_ingested');

-- Normalize old campus values before applying the Rutgers campus constraint.
UPDATE public.listings
SET campus_location = CASE
  WHEN campus_location IS NULL OR btrim(campus_location) = '' THEN NULL
  WHEN lower(btrim(campus_location)) IN ('busch', 'busch campus') THEN 'Busch'
  WHEN lower(btrim(campus_location)) IN ('college ave', 'college avenue', 'ca') THEN 'College Ave'
  WHEN lower(btrim(campus_location)) IN ('livingston', 'livingston campus', 'livi') THEN 'Livingston'
  WHEN lower(btrim(campus_location)) IN ('cook/douglass', 'cook douglass', 'cook', 'douglass', 'cd') THEN 'Cook/Douglass'
  ELSE NULL
END
WHERE campus_location IS NOT NULL
  AND campus_location NOT IN ('Busch', 'College Ave', 'Livingston', 'Cook/Douglass');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'listings_source_check'
  ) THEN
    ALTER TABLE public.listings
      ADD CONSTRAINT listings_source_check
      CHECK (source IN ('user_posted', 'admin_imported', 'externally_ingested'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'listings_campus_location_check'
  ) THEN
    ALTER TABLE public.listings
      ADD CONSTRAINT listings_campus_location_check
      CHECK (
        campus_location IS NULL OR
        campus_location IN ('Busch', 'College Ave', 'Livingston', 'Cook/Douglass')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'listings_baths_check'
  ) THEN
    ALTER TABLE public.listings
      ADD CONSTRAINT listings_baths_check
      CHECK (baths >= 0);
  END IF;
END $$;

-- ============================================================
-- 3. Favorites uniqueness
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'favorites_user_listing_unique'
  ) THEN
    ALTER TABLE public.favorites
      ADD CONSTRAINT favorites_user_listing_unique UNIQUE (user_id, listing_id);
  END IF;
END $$;

-- ============================================================
-- 4. Inquiries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  preferred_contact_method TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inquiries_status_check'
  ) THEN
    ALTER TABLE public.inquiries
      ADD CONSTRAINT inquiries_status_check
      CHECK (status IN ('new', 'responded', 'closed'));
  END IF;
END $$;

-- ============================================================
-- 5. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS listings_host_id_idx
  ON public.listings (host_id);

CREATE INDEX IF NOT EXISTS listings_created_at_idx
  ON public.listings (created_at DESC);

CREATE INDEX IF NOT EXISTS listings_search_idx
  ON public.listings (campus_location, property_type, beds);

CREATE INDEX IF NOT EXISTS inquiries_host_id_idx
  ON public.inquiries (host_id, created_at DESC);

CREATE INDEX IF NOT EXISTS inquiries_renter_id_idx
  ON public.inquiries (renter_id, created_at DESC);

-- ============================================================
-- 6. RLS
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Drop old policy names from the existing schema.
DROP POLICY IF EXISTS "Users can add own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.listings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;

-- Drop canonical names too so the script is safe to rerun.
DROP POLICY IF EXISTS "Profiles self read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles self write" ON public.profiles;
DROP POLICY IF EXISTS "Public read access" ON public.listings;
DROP POLICY IF EXISTS "Users can insert own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can read own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can create own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Hosts and renters can read related inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Hosts can update related inquiries" ON public.inquiries;

CREATE POLICY "Profiles self read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Profiles self write"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Public read access"
  ON public.listings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own listings"
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Users can update own listings"
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Users can delete own listings"
  ON public.listings
  FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

CREATE POLICY "Users can read own favorites"
  ON public.favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own favorites"
  ON public.favorites
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can create own inquiries"
  ON public.inquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (renter_id = auth.uid());

CREATE POLICY "Hosts and renters can read related inquiries"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (host_id = auth.uid() OR renter_id = auth.uid());

CREATE POLICY "Hosts can update related inquiries"
  ON public.inquiries
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

COMMIT;
