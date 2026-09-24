// The Supabase trigger is the real sign-up gate (it can't be bypassed with the
// public anon key). Run the migration against an in-memory Postgres.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createTestDatabase } from './pgHelpers.js'

const MIGRATION = 'supabase/migrations/20260924060000_restrict_signup_to_rutgers_emails.sql'
let db

before(async () => {
  db = await createTestDatabase([MIGRATION])
})
after(async () => {
  await db.close()
})

async function signUp(email) {
  try {
    await db.query('insert into auth.users (email) values ($1)', [email])
    return true
  } catch (error) {
    assert.match(error.message, /Rutgers email/)
    return false
  }
}

for (const email of [
  'ay559@scarletmail.rutgers.edu',
  'anish.yenduri@rutgers.edu',
  'Mixed.Case@ScarletMail.Rutgers.edu',
  'someone@rwjms.rutgers.edu',
]) {
  test(`sign-up allowed: ${email}`, async () => {
    assert.equal(await signUp(email), true)
  })
}

for (const email of ['someone@gmail.com', 'someone@notrutgers.edu', 'someone@rutgers.edu.evil.com', 'no-at-sign']) {
  test(`sign-up blocked: ${email}`, async () => {
    assert.equal(await signUp(email), false)
  })
}

test('changing an account email to non-Rutgers is blocked', async () => {
  await db.query(`insert into auth.users (email) values ('switcher@rutgers.edu')`)
  await assert.rejects(
    db.query(`update auth.users set email = 'switcher@gmail.com' where email = 'switcher@rutgers.edu'`),
    /Rutgers email/
  )
})

test('allowed sign-ups still get a profile (existing trigger unaffected)', async () => {
  const { rows } = await db.query(
    `select count(*)::int as n from public.profiles where email = 'ay559@scarletmail.rutgers.edu'`
  )
  assert.equal(rows[0].n, 1)
})
