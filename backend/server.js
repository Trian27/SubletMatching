import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import listingsRouter from './routes/listings.js'
import messagingRouter from './routes/messaging.js'
import { isSupabaseConfigured } from './supabaseClient.js'
import { warmRutgersListingCache, RUTGERS_SOURCE } from './rutgersMarketplaceImporter.js'
import { getImportMetadata } from './localDatabase.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Request logger — prints every request to the terminal
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`)
  })
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: isSupabaseConfigured ? 'supabase' : 'local-sqlite',
    import: isSupabaseConfigured ? {
      source: RUTGERS_SOURCE,
      status: 'disabled in Supabase mode',
    } : {
      source: RUTGERS_SOURCE,
      ...getImportMetadata(RUTGERS_SOURCE),
    },
  })
})

// Routes
app.use('/listings', listingsRouter)
app.use('/messages', messagingRouter)

if (!isSupabaseConfigured) {
  try {
    const result = await warmRutgersListingCache()
    const importCount = result.importedCount ?? result.lastCount ?? 0
    console.log(`Local Rutgers cache ready with ${importCount} imported listings`)
  } catch (error) {
    console.warn(`Rutgers listing warmup failed: ${error.message}`)
  }
} else {
  console.log('Rutgers listing warmup skipped in Supabase mode')
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

server.on('error', (error) => {
  console.error(`Server failed to start on port ${PORT}:`, error)
  process.exit(1)
})
