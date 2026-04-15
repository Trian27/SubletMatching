import { Router } from 'express'
import {
  createSupabaseClientWithToken,
  isSupabaseConfigured,
  supabase,
} from '../supabaseClient.js'
import { requireSupabaseUser } from '../middleware/requireSupabaseUser.js'

const router = Router()

const VALID_CAMPUSES = ['Busch', 'College Ave', 'Livingston', 'Cook/Douglass']
const VALID_LISTING_SOURCES = ['user_posted', 'admin_imported', 'externally_ingested']

function getAuthenticatedSupabase(req) {
  const accessToken =
    isSupabaseConfigured && req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null

  return isSupabaseConfigured
    ? createSupabaseClientWithToken(accessToken)
    : supabase
}

function mapListingRow(data) {
  return {
    id: data.id,
    title: data.title,
    price: data.price_monthly,
    beds: data.beds,
    baths: data.baths,
    propertyType: data.property_type,
    roommateType: data.roommate_type,
    distance: data.distance,
    amenities: data.amenities || {},
    campus: data.campus_location,
    campus_location: data.campus_location,
    description: data.description,
    image: data.image_url,
    image_url: data.image_url,
    images: data.images || [],
    address: data.address,
    available_from: data.available_from,
    available_to: data.available_to,
    landlordNum: data.contact_phone,
    landlordEmail: data.contact_email,
    contact_phone: data.contact_phone,
    contact_email: data.contact_email,
    latitude: data.latitude,
    longitude: data.longitude,
    source: data.source,
    host_id: data.host_id,
    created_at: data.created_at,
  }
}

function validateListingInput(payload, { allowPartial = false } = {}) {
  const errors = []

  if (!allowPartial || payload.title !== undefined) {
    if (!payload.title || !String(payload.title).trim()) {
      errors.push('title is required')
    }
  }

  if (!allowPartial || payload.price_monthly !== undefined) {
    if (!(Number(payload.price_monthly) > 0)) {
      errors.push('price_monthly must be a positive number')
    }
  }

  if (payload.campus_location && !VALID_CAMPUSES.includes(payload.campus_location)) {
    errors.push(`campus_location must be one of: ${VALID_CAMPUSES.join(', ')}`)
  }

  if (payload.source && !VALID_LISTING_SOURCES.includes(payload.source)) {
    errors.push(`source must be one of: ${VALID_LISTING_SOURCES.join(', ')}`)
  }

  if (payload.available_from && payload.available_to) {
    const from = new Date(payload.available_from)
    const to = new Date(payload.available_to)
    if (Number.isFinite(from.valueOf()) && Number.isFinite(to.valueOf()) && from >= to) {
      errors.push('available_to must be later than available_from')
    }
  }

  if (payload.beds !== undefined && Number(payload.beds) < 0) {
    errors.push('beds must be zero or greater')
  }

  if (payload.baths !== undefined && Number(payload.baths) < 0) {
    errors.push('baths must be zero or greater')
  }

  return errors
}

async function getProfileForUser(userId, client = supabase) {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function requireAdminUser(req, res, next) {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const profile = await getProfileForUser(req.user.id, authenticatedSupabase)

    if (!profile?.is_admin) {
      return res.status(403).json({ error: 'Admin access required.' })
    }

    req.profile = profile
    next()
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not verify admin access.' })
  }
}

function normalizeImportedListing(raw) {
  return {
    title: raw.title?.trim(),
    description: raw.description?.trim() || null,
    address: raw.address?.trim() || null,
    price_monthly: Number(raw.price_monthly ?? raw.price ?? 0),
    campus_location: raw.campus_location?.trim() || raw.campus?.trim() || null,
    beds: Number(raw.beds ?? 0),
    baths: Number(raw.baths ?? 0),
    property_type: raw.property_type?.trim() || raw.propertyType?.trim() || 'apartment',
    roommate_type: raw.roommate_type?.trim() || raw.roommateType?.trim() || null,
    distance: raw.distance != null && raw.distance !== '' ? Number(raw.distance) : null,
    image_url: raw.image_url?.trim() || raw.image?.trim() || null,
    images: Array.isArray(raw.images) ? raw.images : [],
    amenities: typeof raw.amenities === 'object' && raw.amenities !== null ? raw.amenities : {},
    available_from: raw.available_from || null,
    available_to: raw.available_to || null,
    contact_phone: raw.contact_phone?.trim() || raw.landlordNum?.trim() || null,
    contact_email: raw.contact_email?.trim() || raw.landlordEmail?.trim() || null,
    latitude: raw.latitude != null && raw.latitude !== '' ? Number(raw.latitude) : null,
    longitude: raw.longitude != null && raw.longitude !== '' ? Number(raw.longitude) : null,
    source: 'admin_imported',
  }
}

function parseCsvText(csvText) {
  const rows = []
  let current = ''
  let row = []
  let inQuotes = false

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index]
    const nextChar = csvText[index + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1
      row.push(current)
      rows.push(row)
      row = []
      current = ''
      continue
    }

    current += char
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    rows.push(row)
  }

  if (rows.length === 0) return []

  const [headerRow, ...valueRows] = rows
  const headers = headerRow.map((header) => header.trim())

  return valueRows
    .filter((valueRow) => valueRow.some((value) => value.trim() !== ''))
    .map((valueRow) =>
      headers.reduce((accumulator, header, index) => {
        accumulator[header] = valueRow[index]?.trim() ?? ''
        return accumulator
      }, {})
    )
}

async function findDuplicateListing(listing, client = supabase) {
  const { data, error } = await client.from('listings').select('*')
  if (error) throw error

  return (
    data.find(
      existing =>
        String(existing.address || '').trim().toLowerCase() === String(listing.address || '').trim().toLowerCase() &&
        String(existing.available_from || '') === String(listing.available_from || '') &&
        String(existing.contact_email || '').trim().toLowerCase() ===
          String(listing.contact_email || '').trim().toLowerCase()
    ) || null
  )
}

router.get('/', async (req, res) => {
  try {
    let query = supabase.from('listings').select('*')

    if (req.query.campus) {
      query = query.ilike('campus_location', `%${req.query.campus}%`)
    }
    if (req.query.min_price) {
      query = query.gte('price_monthly', Number(req.query.min_price))
    }
    if (req.query.max_price) {
      query = query.lte('price_monthly', Number(req.query.max_price))
    }
    if (req.query.beds) {
      query = query.eq('beds', Number(req.query.beds))
    }
    if (req.query.property_type) {
      query = query.eq('property_type', req.query.property_type)
    }
    if (req.query.host_id) {
      query = query.eq('host_id', req.query.host_id)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json(data.map(mapListingRow))
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/mine', requireSupabaseUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const { data, error } = await authenticatedSupabase
      .from('listings')
      .select('*')
      .eq('host_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ error: error.message })
    res.json(data.map(mapListingRow))
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) return res.status(404).json({ error: 'Listing not found' })

    res.json(mapListingRow(data))
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', requireSupabaseUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const profile = await getProfileForUser(req.user.id, authenticatedSupabase)
    const payload = {
      title: req.body.title?.trim(),
      description: req.body.description?.trim() || null,
      address: req.body.address?.trim() || null,
      price_monthly: Number(req.body.price_monthly),
      campus_location: req.body.campus_location || null,
      beds: Number(req.body.beds ?? 0),
      baths: Number(req.body.baths ?? 0),
      property_type: req.body.property_type || null,
      roommate_type: req.body.roommate_type || null,
      distance: req.body.distance != null ? Number(req.body.distance) : null,
      image_url: req.body.image_url || null,
      images: Array.isArray(req.body.images) ? req.body.images : [],
      amenities: req.body.amenities || {},
      available_from: req.body.available_from || null,
      available_to: req.body.available_to || null,
      contact_phone: req.body.contact_phone || profile?.phone || null,
      contact_email: req.body.contact_email || req.user.email || null,
      latitude: req.body.latitude != null ? Number(req.body.latitude) : null,
      longitude: req.body.longitude != null ? Number(req.body.longitude) : null,
      source: 'user_posted',
      host_id: req.user.id,
    }

    const errors = validateListingInput(payload)
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') })
    }

    const { data, error } = await authenticatedSupabase
      .from('listings')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('POST /listings insert error:', error)
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(mapListingRow(data))
  } catch (err) {
    console.error('POST /listings: unexpected error:', err)
    res.status(500).json({ error: err?.message || 'Internal server error' })
  }
})

router.post('/import', requireSupabaseUser, requireAdminUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const rawRows = Array.isArray(req.body.rows)
      ? req.body.rows
      : typeof req.body.csvText === 'string'
        ? parseCsvText(req.body.csvText)
        : []

    if (rawRows.length === 0) {
      return res.status(400).json({ error: 'Provide rows or csvText for import.' })
    }

    const results = []

    for (const rawRow of rawRows) {
      const listing = normalizeImportedListing(rawRow)
      const errors = validateListingInput(listing)
      if (errors.length > 0) {
        results.push({
          title: listing.title || '(untitled)',
          status: 'rejected',
          reason: errors.join('; '),
        })
        continue
      }

      const duplicate = await findDuplicateListing(listing, authenticatedSupabase)
      if (duplicate) {
        results.push({
          title: listing.title,
          status: 'duplicate',
          existing_id: duplicate.id,
        })
        continue
      }

      const { data, error } = await authenticatedSupabase
        .from('listings')
        .insert({
          ...listing,
          host_id: req.user.id,
        })
        .select()
        .single()

      if (error) {
        results.push({
          title: listing.title,
          status: 'rejected',
          reason: error.message,
        })
        continue
      }

      results.push({
        title: listing.title,
        status: 'imported',
        listing: mapListingRow(data),
      })
    }

    res.status(201).json(results)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not import listings.' })
  }
})

router.post('/favorites', async (req, res) => {
  try {
    const { listing_id, user_id } = req.body

    if (!listing_id || !user_id) {
      return res.status(400).json({ error: 'listing_id and user_id are required' })
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        listing_id,
        user_id,
      })
      .select()
      .single()

    if (error) {
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

router.get('/favorites/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        listings (*)
      `)
      .eq('user_id', req.params.userId)

    if (error) return res.status(400).json({ error: error.message })

    const mappedFavorites = data.map(favorite => ({
      id: favorite.id,
      user_id: favorite.user_id,
      listing_id: favorite.listing_id,
      created_at: favorite.created_at,
      listing: favorite.listings ? mapListingRow(favorite.listings) : null,
    }))

    res.json(mappedFavorites)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/favorites/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', req.params.id)

    if (error) return res.status(400).json({ error: error.message })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', requireSupabaseUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const { data: existing, error: fetchErr } = await supabase
      .from('listings')
      .select('host_id')
      .eq('id', req.params.id)
      .single()

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    if (String(existing.host_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'You can only edit your own listings.' })
    }

    const updates = { ...req.body }
    delete updates.id
    delete updates.host_id
    delete updates.created_at
    delete updates.source

    const errors = validateListingInput(updates, { allowPartial: true })
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') })
    }

    const { data, error } = await authenticatedSupabase
      .from('listings')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })

    res.json(mapListingRow(data))
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', requireSupabaseUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const { data: existing, error: fetchErr } = await supabase
      .from('listings')
      .select('host_id')
      .eq('id', req.params.id)
      .single()

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    if (String(existing.host_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'You can only delete your own listings.' })
    }

    const { error } = await authenticatedSupabase.from('listings').delete().eq('id', req.params.id)

    if (error) return res.status(400).json({ error: error.message })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
