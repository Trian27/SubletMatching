import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

/** True when using real Supabase (JWT auth + DB). False when using in-memory mock. */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url-here'
)

const hasRealCredentials = isSupabaseConfigured

let supabase

if (hasRealCredentials) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅  Connected to Supabase')
} else {
  console.log('⚠️  No Supabase credentials found — running with mock data')
  supabase = createMockClient()
}

export { supabase }

/**
 * Create a Supabase client that authenticates as the user represented by `accessToken`.
 * Used to ensure RLS policies evaluate `auth.uid()` correctly for write operations.
 */
export function createSupabaseClientWithToken(accessToken) {
  if (!hasRealCredentials) return supabase
  const token = accessToken?.trim()
  if (!token) return supabase

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
}

// --------------- Mock client (used when .env has no real credentials) ---------------

function createMockClient() {
  let nextId = 11

  const tables = {
    listings: [
      { id: 1, title: 'Sunny Studio on College Ave', description: 'Cozy studio right on College Ave, steps from the Rutgers Student Center.', price_monthly: 950, campus_location: 'College Ave', beds: 0, property_type: 'Studio', distance: '0.2 miles', amenities: { parking: true, laundry: true, gym: false }, host_id: 'user_1', created_at: '2026-01-15T10:00:00Z' },
      { id: 2, title: 'Spacious 2BR on Easton Ave', description: 'Large 2-bedroom right on Easton Ave, walk to College Ave campus.', price_monthly: 1800, campus_location: 'College Ave', beds: 2, property_type: 'Apartment', distance: '0.3 miles', amenities: { parking: false, laundry: true, gym: false }, host_id: 'user_2', created_at: '2026-02-01T14:30:00Z' },
      { id: 3, title: 'Affordable Room near Livi', description: 'Private room in a 4BR house on Suttons Lane, 5 min to Livingston campus.', price_monthly: 650, campus_location: 'Livingston', beds: 1, property_type: 'Room', distance: '0.5 miles', amenities: { parking: true, laundry: false, gym: false }, host_id: 'user_3', created_at: '2026-02-10T09:00:00Z' },
      { id: 4, title: 'Modern 1BR at The Yard', description: 'Recently built apartment at The Yard with gym and parking included.', price_monthly: 1500, campus_location: 'College Ave', beds: 1, property_type: 'Apartment', distance: '0.4 miles', amenities: { parking: true, laundry: true, gym: true }, host_id: 'user_1', created_at: '2026-02-20T16:45:00Z' },
      { id: 5, title: '3BR House on Hamilton St', description: 'Full house steps from Cook/Douglass campus, big backyard.', price_monthly: 2800, campus_location: 'Cook/Douglass', beds: 3, property_type: 'House', distance: '0.1 miles', amenities: { parking: true, laundry: true, gym: false }, host_id: 'user_4', created_at: '2026-03-01T12:00:00Z' },
      { id: 6, title: '1BR near Busch Campus', description: 'Quiet apartment on Bartholomew Rd, walk to SERC and ARC.', price_monthly: 1100, campus_location: 'Busch', beds: 1, property_type: 'Apartment', distance: '0.6 miles', amenities: { parking: false, laundry: true, gym: false }, host_id: 'user_5', created_at: '2026-03-05T11:00:00Z' },
      { id: 7, title: 'Room in Easton Ave House', description: 'Furnished room in shared house, 2 min walk to Grease Trucks.', price_monthly: 750, campus_location: 'College Ave', beds: 1, property_type: 'Room', distance: '0.2 miles', amenities: { parking: false, laundry: true, gym: false }, host_id: 'user_6', created_at: '2026-03-06T08:30:00Z' },
      { id: 8, title: '2BR on George St', description: 'Renovated 2-bedroom near downtown New Brunswick, close to train station.', price_monthly: 2000, campus_location: 'College Ave', beds: 2, property_type: 'Apartment', distance: '0.7 miles', amenities: { parking: true, laundry: false, gym: false }, host_id: 'user_7', created_at: '2026-03-06T14:00:00Z' },
      { id: 9, title: 'Private Room off Livingston Ave', description: 'Room in a quiet 3BR house, 10 min bus to Busch campus.', price_monthly: 700, campus_location: 'Livingston', beds: 1, property_type: 'Room', distance: '1.2 miles', amenities: { parking: true, laundry: false, gym: false }, host_id: 'user_8', created_at: '2026-03-07T09:00:00Z' },
      { id: 10, title: 'Studio near Douglass Library', description: 'Small studio on Nichol Ave, perfect for summer sublet near Cook campus.', price_monthly: 850, campus_location: 'Cook/Douglass', beds: 0, property_type: 'Studio', distance: '0.3 miles', amenities: { parking: false, laundry: true, gym: false }, host_id: 'user_9', created_at: '2026-03-07T10:00:00Z' },
    ],
    favorites: [
      { id: 1, user_id: 'user_1', listing_id: 3, created_at: '2026-03-08T10:00:00Z' },
      { id: 2, user_id: 'user_1', listing_id: 5, created_at: '2026-03-08T11:00:00Z' },
      { id: 3, user_id: 'user_2', listing_id: 1, created_at: '2026-03-08T12:00:00Z' },
    ]
  }

  function buildQuery(tableName) {
    let rows = [...(tables[tableName] || [])]
    let filters = []
    let insertData = null
    let updateData = null
    let isDelete = false
    let isSingle = false
    let doSelect = false
    let orderCol = null
    let orderAsc = true

    const builder = {
      select(selectClause = '*') { 
        doSelect = true
        builder.selectClause = selectClause
        return builder 
      },
      eq(col, val) { filters.push(r => String(r[col]) === String(val)); return builder },
      gte(col, val) { filters.push(r => r[col] >= val); return builder },
      lte(col, val) { filters.push(r => r[col] <= val); return builder },
      ilike(col, pattern) {
        const search = pattern.replace(/%/g, '').toLowerCase()
        filters.push(r => String(r[col]).toLowerCase().includes(search))
        return builder
      },
      order(col, opts = {}) { orderCol = col; orderAsc = opts.ascending !== false; return builder },
      single() { isSingle = true; return builder },
      insert(data) { insertData = data; return builder },
      update(data) { updateData = data; return builder },
      delete() { isDelete = true; return builder },

      then(resolve) {
        try {
          let result
          if (insertData) {
            const newRow = { id: nextId++, ...insertData, created_at: new Date().toISOString() }
            tables[tableName].push(newRow)
            result = doSelect ? (isSingle ? newRow : [newRow]) : null
          } else if (updateData) {
            let matched = tables[tableName]
            for (const f of filters) matched = matched.filter(f)
            if (matched.length === 0) return resolve({ data: null, error: { message: 'Row not found' } })
            for (const row of matched) Object.assign(row, updateData)
            result = doSelect ? (isSingle ? matched[0] : matched) : null
          } else if (isDelete) {
            let all = [...rows]
            let matching = all
            for (const f of filters) matching = matching.filter(f)
            const removeIds = new Set(matching.map(r => r.id))
            tables[tableName] = all.filter(r => !removeIds.has(r.id))
            result = null
          } else {
            let matched = tables[tableName]
            for (const f of filters) matched = matched.filter(f)
            
            // Handle JOIN queries for favorites with listings
            if (tableName === 'favorites' && builder.selectClause && builder.selectClause.includes('listings (*)')) {
              matched = matched.map(favorite => {
                const listing = tables.listings.find(l => l.id === favorite.listing_id)
                return {
                  ...favorite,
                  listings: listing || null
                }
              })
            }
            
            if (orderCol) {
              matched = [...matched].sort((a, b) => {
                if (a[orderCol] < b[orderCol]) return orderAsc ? -1 : 1
                if (a[orderCol] > b[orderCol]) return orderAsc ? 1 : -1
                return 0
              })
            }
            if (isSingle && !matched[0]) return resolve({ data: null, error: { message: 'Row not found' } })
            result = isSingle ? matched[0] : matched
          }
          return resolve({ data: result, error: null })
        } catch (err) {
          return resolve({ data: null, error: { message: err.message } })
        }
      },
    }
    return builder
  }

  return { from(tableName) { return buildQuery(tableName) } }
}
