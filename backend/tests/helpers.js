import express from 'express'

// Start an Express app with the given routers on a random port.
export async function startApp(mounts) {
  const app = express()
  app.use(express.json())
  for (const [path, router] of mounts) app.use(path, router)
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
  const base = `http://127.0.0.1:${server.address().port}`
  return {
    base,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}

export async function request(base, method, path, { body, headers } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = text
  }
  return { status: response.status, body: json }
}
