import process from 'node:process'
import { connectMongoDB, disconnectMongoDB } from './mongodb.js'
import { startWebSocketServer, stopWebSocketServer } from './websocket.js'

/**
 * Application configuration is loaded from environment variables.
 * These defaults are intended for local development only and should be
 * overridden through environment configuration in production.
 */
const DEFAULT_PORT = 8080
const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/session-replay'

const PORT = Number(process.env.PORT ?? DEFAULT_PORT)
const MONGODB_URI = process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI

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
  console.log('[SessionReplayServer] Starting...')

  try {
    await connectMongoDB(MONGODB_URI)
    console.log('[SessionReplayServer] MongoDB connected.')

    startWebSocketServer(PORT)
    console.log(`[SessionReplayServer] WebSocket server listening on port ${PORT}.`)

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
