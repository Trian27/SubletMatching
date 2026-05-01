-- ============================================================
-- Run this in Supabase SQL Editor.
-- This file matches backend/routes/listings.js field names and auth model.
-- ============================================================

-- 1) listings table aligned with backend code
CREATE TABLE IF NOT EXISTS public.listings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL CHECK (price_monthly > 0),
  campus_location TEXT CHECK (campus_location IN ('Busch', 'College Ave', 'Livingston', 'Cook/Douglass')),
  beds INTEGER DEFAULT 0 CHECK (beds >= 0),
  property_type TEXT,
  distance NUMERIC,
  image_url TEXT,
  amenities JSONB NOT NULL DEFAULT '{}'::jsonb,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listings_host_id_idx ON public.listings (host_id);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON public.listings (created_at DESC);

-- 2) RLS: public read, owner-only write
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON public.listings;
DROP POLICY IF EXISTS "Authenticated users can insert" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;

-- Keep listing browse public.
CREATE POLICY "Public read access"
  ON public.listings
  FOR SELECT
  USING (true);

-- Inserts must belong to the signed-in user.
CREATE POLICY "Users can insert own listings"
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (host_id = auth.uid());

-- Updates only allowed on rows the user owns, and ownership can't be reassigned.
CREATE POLICY "Users can update own listings"
  ON public.listings
  FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

-- Deletes only allowed on rows the user owns.
CREATE POLICY "Users can delete own listings"
  ON public.listings
  FOR DELETE
  TO authenticated
  USING (host_id = auth.uid());

-- 3) favorites table (per-user favorites)
CREATE TABLE IF NOT EXISTS public.favorites (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id BIGINT NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS favorites_listing_id_idx ON public.favorites (listing_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can remove own favorites" ON public.favorites;

CREATE POLICY "Users can view own favorites"
  ON public.favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add own favorites"
  ON public.favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own favorites"
  ON public.favorites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
