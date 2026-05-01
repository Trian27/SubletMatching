import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3001'
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

async function testEndpoints() {
  try {
    console.log('Testing GET /listings...')
    const listingsResponse = await fetch(`${BASE_URL}/listings`)
    const listings = await listingsResponse.json()
    
    console.log('✅ GET /listings response structure:')
    console.log('First listing:', JSON.stringify(listings[0], null, 2))
    
    console.log('\n🔍 Checking mapped fields:')
    console.log('- Has "price" (mapped from price_monthly):', !!listings[0].price)
    console.log('- Has "propertyType" (mapped from property_type):', !!listings[0].propertyType)
    console.log('- Has "amenities" object:', typeof listings[0].amenities === 'object')
    
    if (!ACCESS_TOKEN) {
      console.log('\n\nSkipping authenticated favorites tests.')
      console.log('Set SUPABASE_ACCESS_TOKEN to test POST/GET /favorites.')
      return
    }

    console.log('\n\nTesting POST /favorites...')
    const favoritesResponse = await fetch(`${BASE_URL}/listings/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        listing_id: 1,
      })
    })
    const favorite = await favoritesResponse.json()
    console.log('✅ POST /favorites response:', JSON.stringify(favorite, null, 2))
    
    console.log('\n\nTesting GET /favorites...')
    const userFavoritesResponse = await fetch(`${BASE_URL}/listings/favorites`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    })
    const userFavorites = await userFavoritesResponse.json()
    console.log('✅ GET /favorites response:')
    console.log('Favorites count:', userFavorites.length)
    if (userFavorites.length > 0) {
      console.log('First favorite structure:', JSON.stringify(userFavorites[0], null, 2))
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

console.log('🚀 Starting API tests...')
setTimeout(testEndpoints, 1000) // Give server time to start
