import { type Request, type Response } from 'express'
import Event from '../models/Event.js'

/**
 * Controllers are the application layer in a layered Express architecture.
 * They sit between the routing layer and the domain persistence abstraction.
 * Route files describe the URL shape, while controllers interpret the request,
 * coordinate model access, and generate HTTP responses.
 *
 * The controller communicates with Mongoose through the Event model instead of
 * talking to MongoDB directly. This keeps the controller decoupled from the
 * database driver and allows the model to encapsulate query behavior.
 *
 * Event retrieval is separated from replay logic because the replay engine
 * needs the raw chronological event stream, while the controller's job is only
 * to fetch and return that event data in the order the engine expects.
 *
 * Chronological ordering is essential for deterministic replay because the
 * engine reconstructs a session by applying events in the exact sequence they
 * were recorded. Returning them in ascending timestamp order preserves that
 * original temporal relationship.
 */

/**
 * Handle GET /sessions/:sessionId/events.
 *
 * This controller validates the route parameter, asks the Event model to load
 * every event for the requested session, sorts them chronologically, and then
 * converts the Mongoose results into the appropriate HTTP response.
 */
export async function getSessionEvents(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params

  try {
    if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      res.status(400).json({
        error: 'Invalid sessionId.',
      })
      return
    }

    const events = await Event.find({ sessionId }).sort({ timestamp: 1 }).exec()

    if (events.length === 0) {
      res.status(404).json({
        error: 'No events found for the specified session.',
      })
      return
    }

    res.status(200).json(events)
  } catch (error: unknown) {
    console.error('[EventController] getSessionEvents error:', error)
    res.status(500).json({
      error: 'Internal server error.',
    })
  }
}
