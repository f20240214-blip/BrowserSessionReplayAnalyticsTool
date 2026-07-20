import type {
  BatchMetadata,
  EventBatch,
  ProcessingContext,
  ProcessingResult,
  ValidationResult,
} from '../types.js'
import Event from '../models/Event.js'
import Session from '../models/Session.js'

/**
 * validateBatch checks the incoming batch before any persistence work begins.
 *
 * Validation is intentionally separated from persistence so the business logic
 * can reject malformed input clearly before attempting MongoDB operations.
 */
function validateBatch(batch: EventBatch): ValidationResult {
  if (!Array.isArray(batch)) {
    return {
      valid: false,
      reason: 'Payload must be an array of SessionEvent objects.',
    }
  }

  if (batch.length === 0) {
    return {
      valid: false,
      reason: 'Event batch is empty.',
    }
  }

  let firstSessionId: string | undefined

  for (const event of batch) {
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      return {
        valid: false,
        reason: 'Malformed SessionEvent.',
      }
    }

    const typedEvent = event as {
      sessionId?: unknown
      timestamp?: unknown
      type?: unknown
      payload?: unknown
    }

    if (typeof typedEvent.sessionId !== 'string' || typedEvent.sessionId.length === 0) {
      return {
        valid: false,
        reason: 'Event missing sessionId.',
      }
    }

    if (typedEvent.timestamp === undefined || typedEvent.timestamp === null) {
      return {
        valid: false,
        reason: 'Event missing timestamp.',
      }
    }

    if (typeof typedEvent.type !== 'string' || typedEvent.type.length === 0) {
      return {
        valid: false,
        reason: 'Event missing type.',
      }
    }

    if (!Object.prototype.hasOwnProperty.call(typedEvent, 'payload')) {
      return {
        valid: false,
        reason: 'Event missing payload.',
      }
    }

    if (firstSessionId === undefined) {
      firstSessionId = typedEvent.sessionId as string
    } else if (typedEvent.sessionId !== firstSessionId) {
      return {
        valid: false,
        reason: 'Multiple session IDs detected in a single batch.',
      }
    }
  }

  return {
    valid: true,
  }
}

/**
 * processEventBatch coordinates validation, session lifecycle updates, and bulk
 * event persistence for an incoming batch.
 *
 * This file is the business logic layer of the ingestion server because it
 * decides whether a batch is acceptable, how session metadata evolves, and how
 * events are persisted efficiently without directly defining schemas.
 */
export async function processEventBatch(batch: EventBatch): Promise<ProcessingResult> {
  const startedAt = Date.now()

  const metadata: BatchMetadata = {
    receivedAt: new Date(startedAt),
    batchSize: batch.length,
    processingTime: 0,
    databaseLatency: 0,
  }

  const processingContext: ProcessingContext = {
    batch,
    metadata,
  }

  void processingContext

  const validation = validateBatch(batch)
  if (!validation.valid) {
    throw new Error(validation.reason)
  }

  const firstEvent = batch[0]!
  const lastEvent = batch[batch.length - 1]!
  const sessionId = firstEvent.sessionId
  const startTime = new Date(firstEvent.timestamp)
  const endTime = new Date(lastEvent.timestamp)
  const duration = endTime.getTime() - startTime.getTime()
  let sessionCreated = false

  try {
    const sessionLookupStartedAt = Date.now()
    let session = await Session.findOne({ sessionId })
    metadata.databaseLatency += Date.now() - sessionLookupStartedAt

    if (!session) {
      /**
       * A new Session document is created when the batch belongs to a session
       * that has not been seen before. The initial timeline values are derived
       * from the first and last events in the batch.
       */
      const sessionCreateStartedAt = Date.now()
      const sessionData: {
        sessionId: string
        startTime: Date
        endTime: Date
        duration: number
        eventCount: number
      } = {
        sessionId,
        startTime,
        endTime,
        duration,
        eventCount: batch.length,
      }

      session = new Session(sessionData)
      console.log('[DEBUG] Creating session:', sessionData)
      await session.save()
      metadata.databaseLatency += Date.now() - sessionCreateStartedAt
      sessionCreated = true
    } else {
      /**
       * Existing sessions are updated in place to reflect the latest replay
       * activity. This keeps session summaries current without creating duplicate
       * session records.
       */
      const sessionUpdateStartedAt = Date.now()
      if (endTime.getTime() > session.endTime.getTime()) {
        session.endTime = endTime
      }
      session.duration = session.endTime.getTime() - session.startTime.getTime()
      session.eventCount += batch.length
      await session.save()
      metadata.databaseLatency += Date.now() - sessionUpdateStartedAt
    }

    /**
     * Bulk insertion is used here because it is the most efficient way to store
     * a batch of events from the browser SDK. The incoming events are persisted
     * as-is, and each event is written in a single database operation.
     */
    const insertStartedAt = Date.now()
    await Event.insertMany(batch as unknown as Array<Record<string, unknown>>)
    metadata.databaseLatency += Date.now() - insertStartedAt
  } catch (error) {
    console.error('[SessionReplayServer] Failed to process event batch.', error)
    throw new Error('Failed to process event batch.')
  }

  metadata.processingTime = Date.now() - startedAt

  return {
    processedEvents: batch.length,
    rejectedEvents: 0,
    sessionCreated,
    processingTime: metadata.processingTime,
  }
}