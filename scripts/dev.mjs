import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const children = new Set()
const backendCwd = fileURLToPath(new URL('../backend/', import.meta.url))
const frontendCwd = fileURLToPath(new URL('../frontend/', import.meta.url))

function startProcess(name, cwd, args) {
  const child = spawn(npmCommand, args, {
    cwd,
    stdio: 'inherit',
  })

  child.on('exit', (code, signal) => {
    children.delete(child)
    if (signal) {
      process.kill(process.pid, signal)
      return
    }
    if (code && code !== 0) {
      process.exitCode = code
      shutdown()
    }
  })

  children.add(child)
  return child
}

function shutdown() {
  for (const child of children) {
    child.kill('SIGTERM')
  }
}

async function waitForBackend() {
  const startedAt = Date.now()

  while (Date.now() - startedAt < 1000 * 60 * 2) {
    try {
      const response = await fetch('http://localhost:3001/health')
      if (response.ok) return
    } catch {
      // Backend still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error('Backend did not become healthy within 2 minutes.')
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

startProcess('backend', backendCwd, ['run', 'dev'])
await waitForBackend()
startProcess('frontend', frontendCwd, ['run', 'dev'])
