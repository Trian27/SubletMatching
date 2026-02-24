import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// GET all listings
app.get('/listings', async (req, res) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')

  if (error) {
    console.error(error)
    return res.status(400).json({ error })
  }

  res.json(data)
})

app.listen(3001, () => {
  console.log('Server running on port 3001')
})
