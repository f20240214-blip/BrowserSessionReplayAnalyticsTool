import { connectMongoDB, disconnectMongoDB } from './mongodb.js'
import { startWebSocketServer, stopWebSocketServer } from './websocket.js'
import 'dotenv/config'

interface AppConfig {
  port: number
  mongoUri: string
}

/**
 * Load runtime configuration separately from startup so bootstrap() only
 * orchestrates infrastructure initialization and remains easy to reason about.
 */
function getConfig(): AppConfig {
  const rawPort = process.env.PORT ?? '8080'
  const parsedPort = Number(rawPort)

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error(
      `Invalid PORT value "${rawPort}". Expected an integer between 1 and 65535.`
    )
  }

  const mongoUri = process.env.MONGODB_URI?.trim()

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing or empty.')
  }

  return {
    port: parsedPort,
    mongoUri,
  }
}

let isShuttingDown = false

/**
 * shutdown performs a graceful cleanup of infrastructure resources.
 *
 * This helper is separated from bootstrap() so lifecycle logic remains clear
 * and the entry point does not contain business logic or processing duties.
 */
async function shutdown(): Promise<void> {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true
  console.log('[SessionReplayServer] Shutting down...')

  try {
    await stopWebSocketServer()
  } catch (error) {
    console.error('[SessionReplayServer] Error stopping WebSocket server.', error)
  }

  try {
    await disconnectMongoDB()
  } catch (error) {
    console.error('[SessionReplayServer] Error disconnecting MongoDB.', error)
  }

  console.log('[SessionReplayServer] Shutdown complete.')
}

/**
 * bootstrap starts the backend infrastructure without containing any
 * application business logic. Its responsibility is to connect database and
 * networking components so the ingestion server is ready to accept traffic.
 */
async function bootstrap(): Promise<void> {
  const config = getConfig()

  console.log('[SessionReplayServer] Starting...')

  try {
    await connectMongoDB(config.mongoUri)
    console.log('[SessionReplayServer] MongoDB connected.')

    startWebSocketServer(config.port)
    console.log(`[SessionReplayServer] WebSocket server listening on port ${config.port}.`)

    console.log('[SessionReplayServer] Ready to receive browser session events.')
  } catch (error) {
    console.error('[SessionReplayServer] Startup failed.', error)
    console.error('[SessionReplayServer] Server failed to start.')
    process.exit(1)
  }
}

process.on('SIGINT', async () => {
  await shutdown()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await shutdown()
  process.exit(0)
})

process.on('uncaughtException', async (error: Error) => {
  console.error('[SessionReplayServer] uncaughtException', error)
  await shutdown()
  process.exit(1)
})

process.on('unhandledRejection', async (reason: unknown) => {
  console.error('[SessionReplayServer] unhandledRejection', reason)
  await shutdown()
  process.exit(1)
})

void bootstrap()
