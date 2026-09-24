// The live Supabase project drifted from setup.sql: listings already has a
// source column limited to user_posted/admin_imported/externally_ingested,
// and some old rows have no host. The imported-listings migration must still
// apply there and let the importer write its rows.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTestDatabase } from './pgHelpers.js'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const MIGRATION = fs.readFileSync(
  path.join(repoRoot, 'supabase/migrations/20260924061000_imported_listings.sql'),
  'utf8'
)
let db

before(async () => {
  db = await createTestDatabase()
  await db.exec(`
    alter table public.listings alter column host_id drop not null;
    alter table public.listings add column source text default 'user_posted';
    alter table public.listings
      add constraint listings_source_check
      check (source = any (array['user_posted', 'admin_imported', 'externally_ingested']));
    insert into public.listings (title, price_monthly, source, host_id)
      values ('Old demo listing', 925, 'admin_imported', null),
             ('Old user listing', 800, 'user_posted', null);
  `)
  await db.exec(MIGRATION)
})
after(async () => {
  await db.close()
})

test('migration applies on the drifted schema and keeps existing rows', async () => {
  const { rows } = await db.query(`select title, source, is_imported from public.listings order by title`)
  assert.deepEqual(rows, [
    { title: 'Old demo listing', source: 'admin_imported', is_imported: false },
    { title: 'Old user listing', source: 'user_posted', is_imported: false },
  ])
})

test('importer rows with source rutgers_off_campus are accepted', async () => {
  await db.query(
    `insert into public.listings (title, price_monthly, source, source_listing_id, is_imported, imported_at, host_id)
     values ('10 Guilden Street', 4941, 'rutgers_off_campus', '70138', true, now(), null)
     on conflict (source, source_listing_id) do update set title = excluded.title`
  )
  const { rows } = await db.query(`select count(*)::int as n from public.listings where is_imported`)
  assert.equal(rows[0].n, 1)
})

test('existing source values still work and unknown ones are still rejected', async () => {
  const { rows } = await db.query(`insert into auth.users (email) values ('host@rutgers.edu') returning id`)
  await db.query(
    `insert into public.listings (title, price_monthly, source, host_id) values ('New user post', 900, 'user_posted', $1)`,
    [rows[0].id]
  )
  await assert.rejects(
    db.query(`insert into public.listings (title, price_monthly, source, host_id) values ('Bad', 900, 'spam', $1)`, [
      rows[0].id,
    ])
  )
})

test('new non-imported listings without a host are still rejected', async () => {
  await assert.rejects(
    db.query(`insert into public.listings (title, price_monthly, source, host_id) values ('No host', 900, 'user_posted', null)`)
  )
})
