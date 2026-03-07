import { Router } from 'express'
import { supabase } from '../supabaseClient.js'

const router = Router()

// GET all listings (with optional query filters)
// Example: /listings?city=New+Brunswick&campus=College+Ave&min_price=500&max_price=1500&bedrooms=2
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('listings').select('*')

    if (req.query.city) {
      query = query.ilike('city', `%${req.query.city}%`)
    }
    if (req.query.campus) {
      query = query.ilike('campus', `%${req.query.campus}%`)
    }
    if (req.query.min_price) {
      query = query.gte('price', Number(req.query.min_price))
    }
    if (req.query.max_price) {
      query = query.lte('price', Number(req.query.max_price))
    }
    if (req.query.bedrooms) {
      query = query.eq('bedrooms', Number(req.query.bedrooms))
    }
    if (req.query.bathrooms) {
      query = query.eq('bathrooms', Number(req.query.bathrooms))
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching listings:', error)
      return res.status(400).json({ error: error.message })
    }

    res.json(data)
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching listing:', error)
      return res.status(404).json({ error: 'Listing not found' })
    }

    res.json(data)
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// CREATE a new listing
router.post('/', async (req, res) => {
  try {
    const { title, description, price, city, address, campus, bedrooms, bathrooms, available_from, available_to, user_id } = req.body

    if (!title || !price || !city) {
      return res.status(400).json({ error: 'title, price, and city are required' })
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        title,
        description,
        price,
        city,
        address,
        campus,
        bedrooms,
        bathrooms,
        available_from,
        available_to,
        user_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating listing:', error)
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(data)
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// UPDATE an existing listing
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' })
    }

    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating listing:', error)
      return res.status(400).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    res.json(data)
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE a listing
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting listing:', error)
      return res.status(400).json({ error: error.message })
    }

    res.status(204).send()
  } catch (err) {
    console.error('Unexpected error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
