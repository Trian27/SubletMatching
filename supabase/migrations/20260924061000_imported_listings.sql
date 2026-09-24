-- Imported listings (Rutgers Off-Campus Marketplace) stored in Supabase.
-- Imported rows have no host profile, so host_id becomes nullable, but only
-- for rows flagged is_imported. Only the backend service role writes them
-- (RLS insert policy still requires host_id = auth.uid() for normal users).

alter table public.listings add column if not exists source text not null default 'user';
alter table public.listings add column if not exists source_name text;
alter table public.listings add column if not exists source_listing_id text;
alter table public.listings add column if not exists source_url text;
alter table public.listings add column if not exists is_imported boolean not null default false;
alter table public.listings add column if not exists imported_at timestamptz;

alter table public.listings alter column host_id drop not null;

alter table public.listings drop constraint if exists listings_host_required_unless_imported;
alter table public.listings
  add constraint listings_host_required_unless_imported
  check (is_imported or host_id is not null);

-- Imported listings can be "Ask" priced (0). User listings stay > 0 via the API.
alter table public.listings drop constraint if exists listings_price_monthly_check;
alter table public.listings
  add constraint listings_price_monthly_check
  check (price_monthly > 0 or (is_imported and price_monthly >= 0));

-- Full (non-partial) unique index so PostgREST upserts can target it with
-- on_conflict=source,source_listing_id. NULL source_listing_id (user listings)
-- never conflict because NULLs are distinct.
create unique index if not exists listings_source_listing_unique_idx
  on public.listings (source, source_listing_id);

create index if not exists listings_is_imported_idx on public.listings (is_imported);
