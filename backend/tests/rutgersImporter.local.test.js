// Local SQLite mode: import is idempotent (no duplicates on re-import).
process.env.LISTINGS_STORAGE = 'local'
delete process.env.SUPABASE_URL
delete process.env.SUPABASE_ANON_KEY

import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { stubRutgersFetch } from './fixtures/rutgersMarketplace.js'

const restoreFetch = stubRutgersFetch()

const { syncRutgersMarketplaceListings, getRutgersImportMetadata, RUTGERS_SOURCE } = await import(
  '../rutgersMarketplaceImporter.js'
)
const { listLocalListings, setAppState } = await import('../localDatabase.js')

after(() => {
  restoreFetch()
  // These tests share the dev SQLite file (backend/data, gitignored). Clear the
  // sync timestamp so the next `npm run dev` re-imports real listings instead
  // of keeping the 2 fixture rows for 12 hours.
  setAppState(`import:${RUTGERS_SOURCE}:last_synced_at`, '')
})

const importedCount = () =>
  listLocalListings().filter((listing) => listing.isImported && listing.source === RUTGERS_SOURCE).length

test('imports fixture listings into local storage', async () => {
  const result = await syncRutgersMarketplaceListings({ force: true })
  assert.equal(result.mode, 'local-sqlite')
  assert.equal(result.importedCount, 2)
  assert.equal(importedCount(), 2)
})

test('re-import does not create duplicates', async () => {
  await syncRutgersMarketplaceListings({ force: true })
  await syncRutgersMarketplaceListings({ force: true })
  assert.equal(importedCount(), 2)
})

test('import metadata reports the count', async () => {
  const metadata = await getRutgersImportMetadata()
  assert.equal(metadata.importedCount, 2)
  assert.ok(metadata.lastSyncedAt)
})
