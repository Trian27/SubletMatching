// Regression: the base schema still loads and core inserts still work.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createTestDatabase } from './pgHelpers.js'

test('base schema loads and a hosted listing can be inserted', async () => {
  const db = await createTestDatabase()
  const { rows: users } = await db.query(
    `insert into auth.users (email) values ('ay559@scarletmail.rutgers.edu') returning id`
  )
  const hostId = users[0].id
  const { rows: profiles } = await db.query('select id from public.profiles where id = $1', [hostId])
  assert.equal(profiles.length, 1, 'profile trigger still creates a profile')

  await db.query(
    `insert into public.listings (title, price_monthly, host_id) values ('Room', 800, $1)`,
    [hostId]
  )
  const { rows } = await db.query('select count(*)::int as n from public.listings')
  assert.equal(rows[0].n, 1)
  await db.close()
})
