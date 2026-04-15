import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url-here'
)

const hasRealCredentials = isSupabaseConfigured

let supabase

if (hasRealCredentials) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('Connected to Supabase')
} else {
  console.log('No Supabase credentials found, running with mock data')
  supabase = createMockClient()
}

export { supabase }

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

function createMockClient() {
  let nextNumericId = 100

  const tables = {
    profiles: [
      {
        id: 'user_1',
        email: 'host1@example.com',
        full_name: 'Alex Scarlet',
        rutgers_affiliation: 'Senior at Rutgers New Brunswick',
        preferred_contact_method: 'email',
        phone: '732-555-0101',
        is_renter: true,
        is_host: true,
        is_admin: true,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
      },
      {
        id: 'user_2',
        email: 'host2@example.com',
        full_name: 'Jordan Knight',
        rutgers_affiliation: 'Graduate student',
        preferred_contact_method: 'phone',
        phone: '732-555-0102',
        is_renter: true,
        is_host: true,
        is_admin: false,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
      },
    ],
    listings: [
      {
        id: 1,
        title: 'Sunny Studio on College Ave',
        description: 'Cozy studio right on College Ave, steps from the Rutgers Student Center.',
        address: '88 Hamilton St, New Brunswick, NJ 08901',
        price_monthly: 950,
        campus_location: 'College Ave',
        beds: 0,
        baths: 1,
        property_type: 'studio',
        roommate_type: 'entire_place',
        distance: 0.2,
        image_url: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80',
        images: [],
        amenities: { Parking: false, Laundry: true, Furnished: true, Pet_Friendly: false },
        available_from: '2026-05-20',
        available_to: '2026-08-20',
        contact_phone: '732-555-0101',
        contact_email: 'host1@example.com',
        latitude: 40.5002,
        longitude: -74.4472,
        source: 'user_posted',
        host_id: 'user_1',
        created_at: '2026-01-15T10:00:00Z',
      },
      {
        id: 2,
        title: 'Spacious 2BR on Easton Ave',
        description: 'Large 2-bedroom right on Easton Ave, walk to College Ave campus.',
        address: '29 Easton Ave, New Brunswick, NJ 08901',
        price_monthly: 1800,
        campus_location: 'College Ave',
        beds: 2,
        baths: 1,
        property_type: 'apartment',
        roommate_type: 'entire_place',
        distance: 0.3,
        image_url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
        images: [],
        amenities: { Parking: true, Laundry: true, Furnished: false, Pet_Friendly: false },
        available_from: '2026-06-01',
        available_to: '2026-08-28',
        contact_phone: '732-555-0102',
        contact_email: 'host2@example.com',
        latitude: 40.5008,
        longitude: -74.449,
        source: 'admin_imported',
        host_id: 'user_2',
        created_at: '2026-02-01T14:30:00Z',
      },
      {
        id: 3,
        title: 'Affordable Room near Livi',
        description: 'Private room in a 4BR house on Suttons Lane, 5 min to Livingston campus.',
        address: '25 Suttons Ln, Piscataway, NJ 08854',
        price_monthly: 650,
        campus_location: 'Livingston',
        beds: 1,
        baths: 1,
        property_type: 'room',
        roommate_type: 'private_room',
        distance: 0.5,
        image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
        images: [],
        amenities: { Parking: true, Laundry: false, Furnished: true, Pet_Friendly: false },
        available_from: '2026-05-25',
        available_to: '2026-08-15',
        contact_phone: '732-555-0103',
        contact_email: 'room@example.com',
        latitude: 40.5208,
        longitude: -74.436,
        source: 'user_posted',
        host_id: 'user_3',
        created_at: '2026-02-10T09:00:00Z',
      },
    ],
    favorites: [
      { id: 1, user_id: 'user_1', listing_id: 3, created_at: '2026-03-08T10:00:00Z' },
      { id: 2, user_id: 'user_2', listing_id: 1, created_at: '2026-03-08T12:00:00Z' },
    ],
    inquiries: [
      {
        id: 1,
        listing_id: 2,
        host_id: 'user_2',
        renter_id: 'user_1',
        message: 'Interested in a summer sublet. Is parking included?',
        preferred_contact_method: 'email',
        status: 'new',
        created_at: '2026-03-10T09:00:00Z',
      },
    ],
  }

  function buildQuery(tableName) {
    let filters = []
    let insertData = null
    let updateData = null
    let isDelete = false
    let isSingle = false
    let doSelect = false
    let orderCol = null
    let orderAsc = true
    let selectClause = '*'

    const builder = {
      select(clause = '*') {
        doSelect = true
        selectClause = clause
        return builder
      },
      eq(col, val) {
        filters.push(row => String(row[col]) === String(val))
        return builder
      },
      gte(col, val) {
        filters.push(row => Number(row[col]) >= Number(val))
        return builder
      },
      lte(col, val) {
        filters.push(row => Number(row[col]) <= Number(val))
        return builder
      },
      ilike(col, pattern) {
        const search = String(pattern).replaceAll('%', '').toLowerCase()
        filters.push(row => String(row[col] || '').toLowerCase().includes(search))
        return builder
      },
      order(col, opts = {}) {
        orderCol = col
        orderAsc = opts.ascending !== false
        return builder
      },
      single() {
        isSingle = true
        return builder
      },
      maybeSingle() {
        isSingle = true
        builder.allowMissing = true
        return builder
      },
      insert(data) {
        insertData = data
        return builder
      },
      upsert(data) {
        updateData = data
        builder.isUpsert = true
        return builder
      },
      update(data) {
        updateData = data
        return builder
      },
      delete() {
        isDelete = true
        return builder
      },
      then(resolve) {
        try {
          let rows = [...(tables[tableName] || [])]
          for (const filter of filters) {
            rows = rows.filter(filter)
          }

          if (insertData) {
            const items = Array.isArray(insertData) ? insertData : [insertData]
            const insertedRows = items.map(item => {
              const nextRow = {
                ...(item.id != null ? { id: item.id } : { id: nextNumericId++ }),
                ...item,
                created_at: item.created_at || new Date().toISOString(),
              }
              tables[tableName].push(nextRow)
              return nextRow
            })
            return resolve({ data: isSingle ? insertedRows[0] : insertedRows, error: null })
          }

          if (updateData) {
            if (builder.isUpsert) {
              const matchIndex = tables[tableName].findIndex(row => String(row.id) === String(updateData.id))
              if (matchIndex >= 0) {
                tables[tableName][matchIndex] = {
                  ...tables[tableName][matchIndex],
                  ...updateData,
                }
                return resolve({
                  data: isSingle ? tables[tableName][matchIndex] : [tables[tableName][matchIndex]],
                  error: null,
                })
              }

              const createdRow = {
                created_at: new Date().toISOString(),
                ...updateData,
              }
              tables[tableName].push(createdRow)
              return resolve({ data: isSingle ? createdRow : [createdRow], error: null })
            }

            const matchedRows = rows
            if (matchedRows.length === 0) {
              return resolve({ data: null, error: { message: 'Row not found' } })
            }

            matchedRows.forEach(row => Object.assign(row, updateData))
            return resolve({ data: isSingle ? matchedRows[0] : matchedRows, error: null })
          }

          if (isDelete) {
            const matchedIds = new Set(rows.map(row => row.id))
            tables[tableName] = tables[tableName].filter(row => !matchedIds.has(row.id))
            return resolve({ data: null, error: null })
          }

          if (orderCol) {
            rows = [...rows].sort((left, right) => {
              if (left[orderCol] < right[orderCol]) return orderAsc ? -1 : 1
              if (left[orderCol] > right[orderCol]) return orderAsc ? 1 : -1
              return 0
            })
          }

          if (tableName === 'favorites' && selectClause.includes('listings (*)')) {
            rows = rows.map(favorite => ({
              ...favorite,
              listings: tables.listings.find(listing => String(listing.id) === String(favorite.listing_id)) || null,
            }))
          }

          if (isSingle) {
            if (!rows[0] && !builder.allowMissing) {
              return resolve({ data: null, error: { message: 'Row not found' } })
            }
            return resolve({ data: rows[0] || null, error: null })
          }

          return resolve({ data: rows, error: null })
        } catch (error) {
          return resolve({ data: null, error: { message: error.message } })
        }
      },
    }

    return builder
  }

  return {
    from(tableName) {
      return buildQuery(tableName)
    },
  }
}
