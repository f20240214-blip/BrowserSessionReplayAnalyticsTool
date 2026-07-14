import { WebSocketServer } from 'ws'
import type { EventBatch, ProcessingResult } from './types.js'
import type { SessionEvent } from '../sdk/types.js'
import type { IncomingMessage } from 'http'
import type { WebSocket, Data as WebSocketData } from 'ws'

let activeWebSocketServer: WebSocketServer | null = null

/**
 * createWebSocketServer
 *
 * Creates a WebSocket server that accepts JSON batches of SessionEvent objects
 * from browser SDK clients and forwards valid batches to a processing function.
 * Networking is intentionally separated from processing/persistence so the
 * ingestion surface remains lightweight and easy to test.
 *
 * The implementation attempts to dynamically load a `processEventBatch`
 * function from `./services/eventprocessor.js` at runtime. If that module is not available
 * the server will still accept connections but will log a warning instead of
 * forwarding events. This keeps the server resilient during development.
 */
export function createWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port })
  console.log(`[SessionReplayServer] WebSocket server listening on port ${port}`)

  // Lazy-loaded processing function. Loaded on demand to avoid hard runtime
  // dependency on the processor module. If the consumer provides a processor
  // at runtime (./services/eventprocessor.js exporting processEventBatch), it will be used.
  let processFn: ((events: EventBatch) => Promise<ProcessingResult>) | null = null
  let triedLoad = false

  async function loadProcessor(): Promise<void> {
    if (triedLoad) return
    triedLoad = true
    try {
      // Dynamic import; path is relative to this file and should point to a
      // module that exports `processEventBatch(events: SessionEvent[])`.
      // Use a runtime import so server can start even if processor is not
      // present during early development.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = await import('./services/eventprocessor.js')
      if (typeof mod.processEventBatch === 'function') {
        processFn = mod.processEventBatch
        console.log('[SessionReplayServer] processEventBatch loaded')
      } else {
        console.warn('[SessionReplayServer] processor module found but does not export processEventBatch')
      }
    } catch (err) {
      console.warn('[SessionReplayServer] no processor module found; events will not be forwarded', err)
    }
  }

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientAddr = req.socket.remoteAddress ?? 'unknown'
    console.log(`[SessionReplayServer] client connected: ${clientAddr}`)

    ws.on('message', async (data: WebSocketData) => {
      // Messages expected to be JSON arrays of SessionEvent objects.
      let parsed: unknown
      try {
        const text = typeof data === 'string' ? data : String(data)
        parsed = JSON.parse(text)
      } catch (err) {
        console.warn('[SessionReplayServer] received malformed JSON; ignoring message', err)
        return
      }

      if (!Array.isArray(parsed)) {
        console.warn('[SessionReplayServer] received non-array payload; rejecting')
        return
      }

      // Basic runtime validation: ensure items look like SessionEvent objects.
      const events = parsed.filter(isLikelySessionEvent) as SessionEvent[]
      if (events.length === 0) {
        console.warn('[SessionReplayServer] received array but no valid SessionEvent items found')
        return
      }

      // Ensure processor function is available (load lazily once)
      await loadProcessor()
      if (!processFn) {
        console.warn('[SessionReplayServer] no processEventBatch available; dropping events')
        return
      }

      try {
        const result = await processFn(events)
        console.log('[SessionReplayServer] processed event batch result', result)
      } catch (err) {
        console.error('[SessionReplayServer] error processing event batch', err)
      }
    })

    ws.on('close', () => {
      console.log(`[SessionReplayServer] client disconnected: ${clientAddr}`)
    })

    ws.on('error', (err: Error) => {
      console.error('[SessionReplayServer] websocket error', err)
    })
  })

  activeWebSocketServer = wss
  return wss
}

/**
 * startWebSocketServer begins listening on a port and tracks the active server
 * instance so it can be cleanly stopped during graceful shutdown.
 */
export function startWebSocketServer(port: number): WebSocketServer {
  if (activeWebSocketServer) {
    return activeWebSocketServer
  }

  return createWebSocketServer(port)
}

/**
 * stopWebSocketServer stops the active WebSocket server if it exists.
 *
 * This is used during graceful shutdown to stop accepting new connections
 * without performing any business logic or message handling.
 */
export async function stopWebSocketServer(): Promise<void> {
  if (!activeWebSocketServer) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    activeWebSocketServer!.close((err?: Error | null) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })

  activeWebSocketServer = null
}

/**
 * isLikelySessionEvent provides a minimal runtime check to guard against
 * obviously invalid payloads. It intentionally performs lightweight checks
 * (presence and type of a few fields) rather than deep validation to
 * keep the ingestion path fast. Full validation should occur in the
 * processing layer.
 */
function isLikelySessionEvent(obj: unknown): obj is SessionEvent {
  if (!obj || typeof obj !== 'object') return false
  const o = obj as Record<string, unknown>
  return (
    typeof o.sessionId === 'string' &&
    typeof o.timestamp === 'string' &&
    typeof o.type === 'string' &&
    'payload' in o
  )
}
