import { getImportMetadata, replaceImportedListings } from './localDatabase.js'

export const RUTGERS_SOURCE = 'rutgers_off_campus'
export const RUTGERS_SOURCE_NAME = 'Rutgers Off-Campus Marketplace'
export const RUTGERS_LIST_URL = 'https://offcampushousing.rutgers.edu/listing'

const DETAIL_PAGE_PATTERN =
  /href=["'](?<href>(?:https?:\/\/offcampushousing\.rutgers\.edu)?\/city\/(?:new-brunswick-nj|piscataway-nj|highland-park-nj)\/listing\/[^"'?#\s]+)["']/gi
const OG_IMAGE_PATTERN =
  /<meta[^>]+property=["']og:image["'][^>]+content=["'](?<url>[^"']+)["']/i
const TITLE_PATTERN = /<title>(?<title>[^<]+)<\/title>/i

export async function warmRutgersListingCache(options = {}) {
  const force = options.force === true
  const maxAgeMs = options.maxAgeMs ?? 1000 * 60 * 60 * 12
  const importMetadata = getImportMetadata(RUTGERS_SOURCE)

  const shouldRefresh =
    force ||
    importMetadata.importedCount === 0 ||
    !importMetadata.lastSyncedAt ||
    Date.now() - Date.parse(importMetadata.lastSyncedAt) > maxAgeMs

  if (!shouldRefresh) {
    return {
      refreshed: false,
      ...importMetadata,
    }
  }

  return syncRutgersMarketplaceListings(options)
}

export async function syncRutgersMarketplaceListings(options = {}) {
  const fetchedAt = new Date().toISOString()
  const indexHtml = await fetchHtml(RUTGERS_LIST_URL)
  const detailUrls = extractDetailUrls(indexHtml).slice(0, options.limit ?? 48)

  if (detailUrls.length === 0) {
    throw new Error('Could not find Rutgers marketplace listing detail pages.')
  }

  const listings = []
  const batchSize = options.batchSize ?? 6

  for (let index = 0; index < detailUrls.length; index += batchSize) {
    const batch = detailUrls.slice(index, index + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (detailUrl) => {
        try {
          const detailHtml = await fetchHtml(detailUrl)
          return parseRutgersDetailPage(detailHtml, detailUrl)
        } catch (error) {
          console.warn(`Skipping Rutgers listing ${detailUrl}: ${error.message}`)
          return null
        }
      })
    )

    listings.push(...batchResults.filter(Boolean))
  }

  if (listings.length === 0) {
    throw new Error('Rutgers marketplace import completed, but no listings could be parsed.')
  }

  replaceImportedListings(RUTGERS_SOURCE, listings, { fetchedAt })

  return {
    refreshed: true,
    fetchedAt,
    importedCount: listings.length,
  }
}

function extractDetailUrls(html) {
  const urls = new Set()

  for (const match of html.matchAll(DETAIL_PAGE_PATTERN)) {
    const href = match.groups?.href
    if (!href) continue

    const absoluteUrl = href.startsWith('http')
      ? href
      : new URL(href, RUTGERS_LIST_URL).toString()

    urls.add(absoluteUrl)
  }

  return [...urls]
}

function parseRutgersDetailPage(html, sourceUrl) {
  const lines = htmlToTextLines(html)

  if (lines.length === 0) {
    return null
  }

  const title =
    firstMatch(TITLE_PATTERN, html)?.title?.split('|')[0]?.trim() ||
    lines[0]

  const address = lines.find((line, index) => index > 0 && isAddressLine(line)) || ''
  const listingId = extractDetailValue(lines, 'Listing Id')
  const priceFrom = extractDetailValue(lines, 'Price From')
  const bedrooms = extractDetailValue(lines, 'Bedrooms')
  const bathrooms = extractDetailValue(lines, 'Bathrooms')
  const propertyType = normalizePropertyType(extractDetailValue(lines, 'Property Type'))
  const description = extractSectionText(lines, 'Description', [
    'Exceptional Features',
    'Utilities Included in Rent',
    'Additional Features',
    'Walk Times',
    'Learn More About',
    'Related Listings',
  ])
  const walkTime = extractWalkTime(lines)
  const price = parsePrice(priceFrom)
  const imageUrl = normalizeImageUrl(firstMatch(OG_IMAGE_PATTERN, html)?.url || '')
  const amenities = inferAmenities(description, lines)

  return {
    id: `${RUTGERS_SOURCE}:${listingId || slugFromUrl(sourceUrl)}`,
    sourceListingId: listingId || slugFromUrl(sourceUrl),
    sourceName: RUTGERS_SOURCE_NAME,
    sourceUrl,
    title,
    address,
    description,
    price: price.value ?? 0,
    priceLabel: price.label,
    beds: parseRangeNumber(bedrooms),
    baths: parseRangeNumber(bathrooms),
    propertyType,
    image: imageUrl,
    images: imageUrl ? [imageUrl] : [],
    distance: walkTime,
    amenities,
  }
}

function extractDetailValue(lines, label) {
  const prefix = `${label}:`
  const line = lines.find((entry) => entry.startsWith(prefix))
  return line ? line.slice(prefix.length).trim() : ''
}

function extractSectionText(lines, sectionName, stopHeadings) {
  const sectionIndex = lines.findIndex((line) => line === sectionName)
  if (sectionIndex === -1) return ''

  const collected = []
  for (let index = sectionIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]
    if (!line) continue
    if (stopHeadings.includes(line)) break
    collected.push(line)
  }

  return collected.join(' ').trim()
}

function extractWalkTime(lines) {
  const walkLine = lines.find((line) => line.startsWith('Your Commute:'))
  if (!walkLine) return null

  const match = /(\d+)-minute/i.exec(walkLine)
  if (!match) return null

  const minutes = Number(match[1])
  if (!Number.isFinite(minutes)) return null

  return Number((minutes / 12).toFixed(1))
}

function parseRangeNumber(value) {
  if (!value) return 0

  const cleaned = value
    .replace(/studio/gi, '0')
    .replace(/[^0-9.\-]/g, '')

  if (!cleaned) return 0

  const [start] = cleaned.split('-')
  const parsed = Number(start)
  return Number.isFinite(parsed) ? parsed : 0
}

function parsePrice(value) {
  if (!value || /ask/i.test(value)) {
    return {
      value: 0,
      label: 'Ask',
    }
  }

  const numbers = [...value.matchAll(/\$?([\d,]+(?:\.\d+)?)/g)]
    .map((match) => Number(match[1].replaceAll(',', '')))
    .filter(Number.isFinite)

  if (numbers.length === 0) {
    return {
      value: 0,
      label: value.trim(),
    }
  }

  if (numbers.length === 1) {
    return {
      value: numbers[0],
      label: `$${formatPriceNumber(numbers[0])}`,
    }
  }

  return {
    value: numbers[0],
    label: `$${formatPriceNumber(numbers[0])} - $${formatPriceNumber(numbers[numbers.length - 1])}`,
  }
}

function normalizePropertyType(value) {
  const lowered = value.toLowerCase()
  if (lowered.includes('house')) return 'house'
  if (lowered.includes('studio')) return 'studio'
  if (lowered.includes('town')) return 'townhome'
  return 'apartment'
}

function inferAmenities(description, lines) {
  const haystack = `${description} ${lines.join(' ')}`.toLowerCase()

  return {
    Parking: /\bparking\b/.test(haystack),
    Laundry: /\blaundry\b|washer|dryer/.test(haystack),
    Pet_Friendly: /\bpets?\b|cats|dogs/.test(haystack),
    Furnished: /\bfurnished\b/.test(haystack),
  }
}

function slugFromUrl(url) {
  return url.split('/').filter(Boolean).at(-1) || String(Date.now())
}

function normalizeImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return new URL(url, RUTGERS_LIST_URL).toString()
}

function htmlToTextLines(html) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|section|article|li|ul|ol|h1|h2|h3|h4|h5|h6|tr|td|th|header|footer)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function firstMatch(pattern, value) {
  return pattern.exec(value)?.groups || null
}

function isAddressLine(line) {
  return /(new brunswick|piscataway|highland park),\s*nj/i.test(line)
}

function formatPriceNumber(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'accept': 'text/html,application/xhtml+xml',
      'user-agent': 'SubletMatchingBot/1.0 (+local development import)',
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.text()
}
