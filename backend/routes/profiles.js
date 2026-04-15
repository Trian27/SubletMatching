import { Router } from 'express'
import {
  createSupabaseClientWithToken,
  isSupabaseConfigured,
  supabase,
} from '../supabaseClient.js'
import { requireSupabaseUser } from '../middleware/requireSupabaseUser.js'

const router = Router()

function getAuthenticatedSupabase(req) {
  const accessToken =
    isSupabaseConfigured && req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null

  return isSupabaseConfigured
    ? createSupabaseClientWithToken(accessToken)
    : supabase
}

function mapProfileRow(profile, userEmail) {
  return {
    id: profile.id,
    email: profile.email || userEmail || null,
    full_name: profile.full_name || '',
    rutgers_affiliation: profile.rutgers_affiliation || '',
    preferred_contact_method: profile.preferred_contact_method || 'email',
    phone: profile.phone || '',
    is_renter: Boolean(profile.is_renter),
    is_host: Boolean(profile.is_host),
    is_admin: Boolean(profile.is_admin),
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  }
}

router.get('/me', requireSupabaseUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const { data, error } = await authenticatedSupabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Profile not found.' })
    }

    res.json(mapProfileRow(data, req.user.email))
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not fetch profile.' })
  }
})

router.put('/me', requireSupabaseUser, async (req, res) => {
  try {
    const authenticatedSupabase = getAuthenticatedSupabase(req)
    const payload = {
      id: req.user.id,
      email: req.user.email || null,
      full_name: req.body.full_name?.trim() || '',
      rutgers_affiliation: req.body.rutgers_affiliation?.trim() || '',
      preferred_contact_method: req.body.preferred_contact_method || 'email',
      phone: req.body.phone?.trim() || '',
      is_renter: Boolean(req.body.is_renter),
      is_host: Boolean(req.body.is_host),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await authenticatedSupabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json(mapProfileRow(data, req.user.email))
  } catch (error) {
    res.status(500).json({ error: error.message || 'Could not save profile.' })
  }
})

export default router
