import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import listingsRouter from './routes/listings.js'
import profilesRouter from './routes/profiles.js'
import inquiriesRouter from './routes/inquiries.js'

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
  res.json({ status: 'ok' })
})

// Routes
app.use('/listings', listingsRouter)
app.use('/profiles', profilesRouter)
app.use('/inquiries', inquiriesRouter)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
