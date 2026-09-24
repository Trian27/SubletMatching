import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isAllowedEmail, getAllowedEmailDomains } from '../rutgersEmail.js'

const ALLOWED = [
  'ay559@scarletmail.rutgers.edu', // netid@scarletmail.rutgers.edu
  'anish.yenduri@rutgers.edu', // first.last@rutgers.edu
  'Anish.Yenduri@Rutgers.EDU', // case-insensitive
  '  ay559@scarletmail.rutgers.edu  ', // surrounding whitespace
  'someone@rwjms.rutgers.edu', // other Rutgers subdomains
]

const REJECTED = [
  'someone@gmail.com',
  'someone@notrutgers.edu',
  'someone@rutgers.edu.evil.com',
  'someone@scarletmail.rutgers.edu.co',
  'someone@rutgers.com',
  'rutgers.edu',
  '@rutgers.edu',
  'someone@',
  '',
  null,
  undefined,
  42,
]

for (const email of ALLOWED) {
  test(`allows ${JSON.stringify(email)}`, () => {
    assert.equal(isAllowedEmail(email), true)
  })
}

for (const email of REJECTED) {
  test(`rejects ${JSON.stringify(email)}`, () => {
    assert.equal(isAllowedEmail(email), false)
  })
}

test('defaults to rutgers.edu (covers scarletmail.rutgers.edu)', () => {
  const saved = process.env.ALLOWED_EMAIL_DOMAINS
  delete process.env.ALLOWED_EMAIL_DOMAINS
  try {
    assert.deepEqual(getAllowedEmailDomains(), ['rutgers.edu'])
  } finally {
    if (saved !== undefined) process.env.ALLOWED_EMAIL_DOMAINS = saved
  }
})

test('ALLOWED_EMAIL_DOMAINS override is respected', () => {
  const saved = process.env.ALLOWED_EMAIL_DOMAINS
  process.env.ALLOWED_EMAIL_DOMAINS = 'scarletmail.rutgers.edu'
  try {
    assert.equal(isAllowedEmail('ay559@scarletmail.rutgers.edu'), true)
    assert.equal(isAllowedEmail('anish.yenduri@rutgers.edu'), false)
  } finally {
    if (saved === undefined) delete process.env.ALLOWED_EMAIL_DOMAINS
    else process.env.ALLOWED_EMAIL_DOMAINS = saved
  }
})
