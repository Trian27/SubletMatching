import { Router } from 'express'
import {
  createSupabaseClientWithToken,
  isSupabaseConfigured,
  supabase,
} from '../supabaseClient.js'
import { requireSupabaseUser } from '../middleware/requireSupabaseUser.js'

const router = Router()
const VALID_STATUSES = ['new', 'responded', 'closed']

function getAuthenticatedSupabase(req) {
  const accessToken =
    isSupabaseConfigured && req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null

  return isSupabaseConfigured
    ? createSupabaseClientWithToken(accessToken)
    : supabase
}

function mapInquiryRow(row) {
  return {
    id: row.id,
    listing_id: row.listing_id,
    host_id: row.host_id,
    renter_id: row.renter_id,
    message: row.message,
    status: row.status,
    preferred_contact_method: row.preferred_contact_method,
    created_at: row.created_at,
    listing_title: row.listing_title || null,
    listing_address: row.listing_address || null,
  }
}

async function attachListingMetadata(rows, client = supabase) {
  const listingIds = [...new Set(rows.map(row => row.listing_id).filter(Boolean))]
  if (listingIds.length === 0) return rows.map(mapInquiryRow)

  const { data, error } = await client.from('listings').select('*')
  if (error) throw error

  return rows.map(row => {
    const listing = data.find(item => String(item.id) === String(row.listing_id))
    return mapInquiryRow({
      ...row,
      listing_title: listing?.title || null,
      listing_address: listing?.address || null,
    })
  })
}

router.post('/', requireSupabaseUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const { listing_id, message, preferred_contact_method } = req.body

    if (!listing_id || !message?.trim()) {
      return res.status(400).json({ error: 'listing_id and message are required.' })
    }

    const { data: listing, error: listingError } = await authenticatedSupabase
      .from('listings')
      .select('*')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return res.status(404).json({ error: 'Listing not found.' })
    }

    if (String(listing.host_id) === String(req.user.id)) {
      return res.status(400).json({ error: 'You cannot inquire on your own listing.' })
    }

    const payload = {
      listing_id,
      host_id: listing.host_id,
      renter_id: req.user.id,
      message: message.trim(),
      preferred_contact_method: preferred_contact_method || 'email',
      status: 'new',
    }

    const { data, error } = await authenticatedSupabase
      .from('inquiries')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(mapInquiryRow({ ...data, listing_title: listing.title, listing_address: listing.address }))
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not create inquiry.' })
  }
})

router.get('/sent', requireSupabaseUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const { data, error } = await authenticatedSupabase
      .from('inquiries')
      .select('*')
      .eq('renter_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ error: error.message })
    res.json(await attachListingMetadata(data, authenticatedSupabase))
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not fetch sent inquiries.' })
  }
})

router.get('/received', requireSupabaseUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const { data, error } = await authenticatedSupabase
      .from('inquiries')
      .select('*')
      .eq('host_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ error: error.message })
    res.json(await attachListingMetadata(data, authenticatedSupabase))
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not fetch received inquiries.' })
  }
})

router.patch('/:id', requireSupabaseUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const status = req.body.status

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` })
    }

    const { data: existing, error: fetchError } = await authenticatedSupabase
      .from('inquiries')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Inquiry not found.' })
    }

    if (String(existing.host_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Only the host can update inquiry status.' })
    }

    const { data, error } = await authenticatedSupabase
      .from('inquiries')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })

    res.json(mapInquiryRow(data))
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not update inquiry.' })
  }
})

export default router
