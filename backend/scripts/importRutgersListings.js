import { warmRutgersListingCache } from '../rutgersMarketplaceImporter.js'

try {
  const result = await warmRutgersListingCache({ force: true })
  console.log(
    `Rutgers marketplace import complete: ${result.importedCount ?? result.lastCount} listings`
  )
  if (result.fetchedAt || result.lastSyncedAt) {
    console.log(`Synced at: ${result.fetchedAt || result.lastSyncedAt}`)
  }
} catch (error) {
  console.error('Rutgers marketplace import failed:', error.message)
  process.exitCode = 1
}
