import { Router } from 'express'
import { supabase, isSupabaseConfigured, createSupabaseClientWithToken } from '../supabaseClient.js'
import { requireSupabaseUser } from '../middleware/requireSupabaseUser.js'

const router = Router()

function mapListingRow(data) {
  return {
    id: data.id,
    title: data.title,
    price: data.price_monthly,
    beds: data.beds,
    propertyType: data.property_type,
    distance: data.distance,
    amenities: data.amenities || {},
    campus_location: data.campus_location,
    description: data.description,
    image_url: data.image_url,
    host_id: data.host_id,
    created_at: data.created_at,
  }
}

// GET all listings with Rutgers-specific filters
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('listings').select('*')

    // Aligned with your schema: campus_location
    if (req.query.campus) {
      query = query.ilike('campus_location', `%${req.query.campus}%`)
    }
    // Aligned with your schema: price_monthly
    if (req.query.min_price) {
      query = query.gte('price_monthly', Number(req.query.min_price))
    }
    if (req.query.max_price) {
      query = query.lte('price_monthly', Number(req.query.max_price))
    }
    // Aligned with your schema: beds
    if (req.query.beds) {
      query = query.eq('beds', Number(req.query.beds))
    }
    if (req.query.property_type) {
      query = query.eq('property_type', req.query.property_type)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Map database columns to frontend expected format
    const mappedData = data.map(listing => ({
      id: listing.id,
      title: listing.title,
      price: listing.price_monthly,  // Map price_monthly to price
      beds: listing.beds,
      propertyType: listing.property_type,  // Map property_type to propertyType
      distance: listing.distance,
      amenities: listing.amenities || {},  // Ensure amenities is an object
      // Include additional fields that might be useful
      campus_location: listing.campus_location,
      description: listing.description,
      image_url: listing.image_url,
      host_id: listing.host_id,
      created_at: listing.created_at
    }))

    res.json(mappedData)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) return res.status(404).json({ error: 'Listing not found' })
    
    // Map database columns to frontend expected format
    const mappedListing = {
      id: data.id,
      title: data.title,
      price: data.price_monthly,  // Map price_monthly to price
      beds: data.beds,
      propertyType: data.property_type,  // Map property_type to propertyType
      distance: data.distance,
      amenities: data.amenities || {},  // Ensure amenities is an object
      // Include additional fields that might be useful
      campus_location: data.campus_location,
      description: data.description,
      image_url: data.image_url,
      host_id: data.host_id,
      created_at: data.created_at
    }
    
    res.json(mappedListing)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// CREATE a new listing (Updated to match Frontend & Schema)
router.post('/', requireSupabaseUser, async (req, res) => {
  try {
    const {
      title,
      description,
      price_monthly,
      campus_location,
      beds,
      property_type,
      distance,
      image_url,
      amenities,
      host_id: host_id_body,
    } = req.body

    const host_id = isSupabaseConfigured
      ? req.user?.id
      : (host_id_body || 'guest')

    const accessToken =
      isSupabaseConfigured && req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null

    const authenticatedSupabase = isSupabaseConfigured
      ? createSupabaseClientWithToken(accessToken)
      : supabase

    if (!title || !price_monthly) {
      return res.status(400).json({ error: 'Title and price_monthly are required' })
    }

    if (!host_id) {
      return res.status(400).json({
        error: isSupabaseConfigured
          ? 'Could not resolve host from session'
          : 'host_id is required when not using Supabase auth',
      })
    }

    // Validation: price_monthly must be positive
    if (price_monthly <= 0) {
      return res.status(400).json({ error: 'price_monthly must be a positive number' })
    }

    // Validation: campus_location must be one of the allowed values
    const validCampusLocations = ['Busch', 'College Ave', 'Livingston', 'Cook/Douglass']
    if (campus_location && !validCampusLocations.includes(campus_location)) {
      return res.status(400).json({ 
        error: `campus_location must be one of: ${validCampusLocations.join(', ')}` 
      })
    }

    const { data, error } = await authenticatedSupabase
      .from('listings')
      .insert({
        title,
        description,
        price_monthly,
        campus_location,
        beds,
        property_type,
        distance,
        image_url,
        amenities, // Stores the JSONB object (parking, laundry, etc.)
        host_id
      })
      .select()
      .single()

    if (error) {
      console.error('POST /listings insert error:', error)
      return res.status(400).json({ error: error.message })
    }

    if (!data) {
      console.error('POST /listings: insert returned no data')
      return res.status(500).json({ error: 'Listing insert did not return a row.' })
    }

    res.status(201).json(mapListingRow(data))
  } catch (err) {
    console.error('POST /listings: unexpected error:', err)
    res.status(500).json({ error: err?.message || 'Internal server error' })
  }
})

// POST /favorites - Add a listing to user's favorites
router.post('/favorites', async (req, res) => {
  try {
    const { listing_id, user_id } = req.body

    // Validation: both listing_id and user_id are required
    if (!listing_id || !user_id) {
      return res.status(400).json({ error: 'listing_id and user_id are required' })
    }

    // Create authenticated Supabase client for RLS
    const authenticatedSupabase = supabase

    // Insert the favorite (RLS will ensure the user can only add their own favorites)
    const { data, error } = await authenticatedSupabase
      .from('favorites')
      .insert({
        listing_id,
        user_id
      })
      .select()
      .single()

    if (error) {
      // Check if it's a duplicate favorite error
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Listing already in favorites' })
      }
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /favorites/:userId - Get all favorites for a user
router.get('/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    // Create authenticated Supabase client for RLS
    const authenticatedSupabase = supabase

    // Get user's favorites with listing details
    const { data, error } = await authenticatedSupabase
      .from('favorites')
      .select(`
        *,
        listings (*)
      `)
      .eq('user_id', userId)

    if (error) return res.status(400).json({ error: error.message })

    // Map the data to include properly formatted listings
    const mappedFavorites = data.map(favorite => ({
      id: favorite.id,
      user_id: favorite.user_id,
      listing_id: favorite.listing_id,
      created_at: favorite.created_at,
      listing: {
        id: favorite.listings.id,
        title: favorite.listings.title,
        price: favorite.listings.price_monthly,  // Map price_monthly to price
        beds: favorite.listings.beds,
        propertyType: favorite.listings.property_type,  // Map property_type to propertyType
        distance: favorite.listings.distance,
        amenities: favorite.listings.amenities || {},  // Ensure amenities is an object
        campus_location: favorite.listings.campus_location,
        description: favorite.listings.description,
        image_url: favorite.listings.image_url
      }
    }))

    res.json(mappedFavorites)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /favorites/:id - Remove a favorite
router.delete('/favorites/:id', async (req, res) => {
  try {
    // Create authenticated Supabase client for RLS
    const authenticatedSupabase = supabase

    const { error } = await authenticatedSupabase
      .from('favorites')
      .delete()
      .eq('id', req.params.id)

    if (error) return res.status(400).json({ error: error.message })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// UPDATE a listing (owner only when using real Supabase)
router.put('/:id', requireSupabaseUser, async (req, res) => {
  try {
    const id = req.params.id

    const { data: existing, error: fetchErr } = await supabase
      .from('listings')
      .select('host_id')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    if (
      isSupabaseConfigured &&
      String(existing.host_id) !== String(req.user.id)
    ) {
      return res.status(403).json({ error: 'You can only edit your own listings.' })
    }

    const updates = { ...req.body }
    delete updates.id
    delete updates.host_id
    delete updates.created_at

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' })
    }

    const accessToken =
      isSupabaseConfigured && req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null

    const authenticatedSupabase = isSupabaseConfigured
      ? createSupabaseClientWithToken(accessToken)
      : supabase

    const { data, error } = await authenticatedSupabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })

    res.json(mapListingRow(data))
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE a listing (owner only when using real Supabase)
router.delete('/:id', requireSupabaseUser, async (req, res) => {
  try {
    const id = req.params.id

    const { data: existing, error: fetchErr } = await supabase
      .from('listings')
      .select('host_id')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    if (
      isSupabaseConfigured &&
      String(existing.host_id) !== String(req.user.id)
    ) {
      return res.status(403).json({ error: 'You can only delete your own listings.' })
    }

    const accessToken =
      isSupabaseConfigured && req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null

    const authenticatedSupabase = isSupabaseConfigured
      ? createSupabaseClientWithToken(accessToken)
      : supabase

    const { error } = await authenticatedSupabase.from('listings').delete().eq('id', id)

    if (error) return res.status(400).json({ error: error.message })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
