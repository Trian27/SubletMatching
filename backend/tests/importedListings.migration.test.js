// Run the imported-listings migration against an in-memory Postgres and
// check upsert/prune behavior plus that normal user listings are unaffected.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createTestDatabase } from './pgHelpers.js'

const MIGRATION = 'supabase/migrations/20260924061000_imported_listings.sql'
let db
let hostId

before(async () => {
  db = await createTestDatabase([MIGRATION])
  const { rows } = await db.query(`insert into auth.users (email) values ('host@rutgers.edu') returning id`)
  hostId = rows[0].id
})
after(async () => {
  await db.close()
})

const upsert = (listingId, title, price, importedAt) =>
  db.query(
    `insert into public.listings (title, price_monthly, source, source_listing_id, is_imported, imported_at, host_id)
     values ($1, $2, 'rutgers_off_campus', $3, true, $4, null)
     on conflict (source, source_listing_id) do update
       set title = excluded.title, price_monthly = excluded.price_monthly, imported_at = excluded.imported_at`,
    [title, price, listingId, importedAt]
  )

const countImported = async () =>
  (await db.query(`select count(*)::int as n from public.listings where is_imported`)).rows[0].n

test('migration is safe to run twice', async () => {
  const again = await createTestDatabase([MIGRATION, MIGRATION])
  await again.close()
})

test('re-importing the same listing updates it instead of duplicating', async () => {
  await upsert('70138', 'Old title', 4800, '2026-09-24T00:00:00Z')
  await upsert('70138', 'New title', 5000, '2026-09-24T12:00:00Z')
  assert.equal(await countImported(), 1)
  const { rows } = await db.query(`select title, price_monthly from public.listings where source_listing_id = '70138'`)
  assert.deepEqual(rows[0], { title: 'New title', price_monthly: 5000 })
})

test('"Ask" priced imports (0) are allowed', async () => {
  await upsert('60760', '130 Easton', 0, '2026-09-24T12:00:00Z')
  assert.equal(await countImported(), 2)
})

test('prune removes listings missing from the latest sync, keeps the rest', async () => {
  await upsert('70138', 'New title', 5000, '2026-09-25T00:00:00Z')
  await db.query(
    `delete from public.listings where source = 'rutgers_off_campus' and is_imported and imported_at < '2026-09-25T00:00:00Z'`
  )
  const { rows } = await db.query(`select source_listing_id from public.listings where is_imported`)
  assert.deepEqual(rows.map((row) => row.source_listing_id), ['70138'])
})

test('user listings still require a host and a positive price', async () => {
  await assert.rejects(
    db.query(`insert into public.listings (title, price_monthly) values ('No host', 900)`),
    /listings_host_required_unless_imported/
  )
  await assert.rejects(
    db.query(`insert into public.listings (title, price_monthly, host_id) values ('Free', 0, $1)`, [hostId]),
    /listings_price_monthly_check/
  )
})

test('user listings insert as before and are never pruned', async () => {
  await db.query(`insert into public.listings (title, price_monthly, host_id) values ('My sublet', 900, $1)`, [hostId])
  await db.query(
    `delete from public.listings where source = 'rutgers_off_campus' and is_imported and imported_at < now()`
  )
  const { rows } = await db.query(`select source, is_imported from public.listings where title = 'My sublet'`)
  assert.deepEqual(rows[0], { source: 'user', is_imported: false })
})

test('multiple user listings with no source id do not conflict', async () => {
  await db.query(`insert into public.listings (title, price_monthly, host_id) values ('Sublet A', 700, $1)`, [hostId])
  await db.query(`insert into public.listings (title, price_monthly, host_id) values ('Sublet B', 750, $1)`, [hostId])
  const { rows } = await db.query(`select count(*)::int as n from public.listings where source = 'user'`)
  assert.equal(rows[0].n, 3)
})
