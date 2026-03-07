import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const hasRealCredentials = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url-here'

let supabase

if (hasRealCredentials) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅  Connected to Supabase')
} else {
  console.log('⚠️  No Supabase credentials found — running with mock data')
  supabase = createMockClient()
}

export { supabase }

// --------------- Mock client (used when .env has no real credentials) ---------------

function createMockClient() {
  let nextId = 11

  const tables = {
    listings: [
      { id: 1, title: 'Sunny Studio on College Ave', description: 'Cozy studio right on College Ave, steps from the Rutgers Student Center.', price: 950, city: 'New Brunswick', address: '123 College Ave', campus: 'College Ave', bedrooms: 0, bathrooms: 1, available_from: '2026-06-01', available_to: '2026-08-31', user_id: 'user_1', created_at: '2026-01-15T10:00:00Z' },
      { id: 2, title: 'Spacious 2BR on Easton Ave', description: 'Large 2-bedroom right on Easton Ave, walk to College Ave campus.', price: 1800, city: 'New Brunswick', address: '250 Easton Ave, Apt 3A', campus: 'College Ave', bedrooms: 2, bathrooms: 1, available_from: '2026-05-15', available_to: '2026-08-31', user_id: 'user_2', created_at: '2026-02-01T14:30:00Z' },
      { id: 3, title: 'Affordable Room near Livi', description: 'Private room in a 4BR house on Suttons Lane, 5 min to Livingston campus.', price: 650, city: 'Piscataway', address: '87 Suttons Ln', campus: 'Livingston', bedrooms: 1, bathrooms: 1, available_from: '2026-06-01', available_to: '2026-08-15', user_id: 'user_3', created_at: '2026-02-10T09:00:00Z' },
      { id: 4, title: 'Modern 1BR at The Yard', description: 'Recently built apartment at The Yard with gym and parking included.', price: 1500, city: 'New Brunswick', address: '101 Somerset St, Unit 4C', campus: 'College Ave', bedrooms: 1, bathrooms: 1, available_from: '2026-05-20', available_to: '2026-08-31', user_id: 'user_1', created_at: '2026-02-20T16:45:00Z' },
      { id: 5, title: '3BR House on Hamilton St', description: 'Full house steps from Cook/Douglass campus, big backyard.', price: 2800, city: 'New Brunswick', address: '45 Hamilton St', campus: 'Cook/Douglass', bedrooms: 3, bathrooms: 2, available_from: '2026-06-01', available_to: '2026-08-20', user_id: 'user_4', created_at: '2026-03-01T12:00:00Z' },
      { id: 6, title: '1BR near Busch Campus', description: 'Quiet apartment on Bartholomew Rd, walk to SERC and ARC.', price: 1100, city: 'Piscataway', address: '22 Bartholomew Rd', campus: 'Busch', bedrooms: 1, bathrooms: 1, available_from: '2026-06-01', available_to: '2026-08-31', user_id: 'user_5', created_at: '2026-03-05T11:00:00Z' },
      { id: 7, title: 'Room in Easton Ave House', description: 'Furnished room in shared house, 2 min walk to Grease Trucks.', price: 750, city: 'New Brunswick', address: '180 Easton Ave', campus: 'College Ave', bedrooms: 1, bathrooms: 1, available_from: '2026-05-25', available_to: '2026-08-15', user_id: 'user_6', created_at: '2026-03-06T08:30:00Z' },
      { id: 8, title: '2BR on George St', description: 'Renovated 2-bedroom near downtown New Brunswick, close to train station.', price: 2000, city: 'New Brunswick', address: '55 George St, Apt 2B', campus: 'College Ave', bedrooms: 2, bathrooms: 1, available_from: '2026-06-01', available_to: '2026-08-31', user_id: 'user_7', created_at: '2026-03-06T14:00:00Z' },
      { id: 9, title: 'Private Room off Livingston Ave', description: 'Room in a quiet 3BR house, 10 min bus to Busch campus.', price: 700, city: 'New Brunswick', address: '310 Livingston Ave', campus: 'Livingston', bedrooms: 1, bathrooms: 1, available_from: '2026-06-15', available_to: '2026-08-31', user_id: 'user_8', created_at: '2026-03-07T09:00:00Z' },
      { id: 10, title: 'Studio near Douglass Library', description: 'Small studio on Nichol Ave, perfect for summer sublet near Cook campus.', price: 850, city: 'New Brunswick', address: '60 Nichol Ave', campus: 'Cook/Douglass', bedrooms: 0, bathrooms: 1, available_from: '2026-06-01', available_to: '2026-08-15', user_id: 'user_9', created_at: '2026-03-07T10:00:00Z' },
    ],
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
      select() { doSelect = true; return builder },
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
