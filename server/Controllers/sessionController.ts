import { type Request, type Response } from 'express'
import Session from '../models/Session.js'

/**
 * Controllers are the HTTP-facing application layer. Their job is to receive
 * Express requests, coordinate Mongoose model operations, and translate the
 * resulting data into the appropriate HTTP response shape.
 *
 * This separation is important because route files should declare URL structure
 * and delegate behavior, while controllers should contain the business logic
 * needed to interpret a request and produce a response. Keeping those concerns
 * apart makes the API easier to test, reason about, and evolve.
 *
 * The controller communicates with Mongoose through the exported Session model
 * rather than talking to MongoDB directly. The model acts as the repository
 * abstraction, exposing built-in query methods such as find() and findOne().
 */

/**
 * Handle GET /sessions.
 *
 * Queries the Session model for all documents and returns them in descending
 * startTime order so the most recent recorded sessions appear first.
 */
export async function getSessions(_req: Request, res: Response): Promise<void> {
  try {
    const sessions = await Session.find().sort({ startTime: -1 }).exec()

    res.status(200).json(sessions)
  } catch (error: unknown) {
    console.error('[SessionController] getSessions error:', error)
    res.status(500).json({
      error: 'Internal server error.',
    })
  }
}

/**
 * Handle GET /sessions/:sessionId.
 *
 * Reads the route parameter from Express, validates its presence, then asks
 * the Session model to resolve the matching document using Mongoose's
 * findOne() API. The controller is responsible for turning a model result into
 * the corresponding HTTP response.
 */
export async function getSessionById(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params

  try {
    if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      res.status(400).json({
        error: 'Invalid sessionId.',
      })
      return
    }

    const session = await Session.findOne({ sessionId }).exec()

    if (!session) {
      res.status(404).json({
        error: 'Session not found.',
      })
      return
    }

    res.status(200).json(session)
  } catch (error: unknown) {
    console.error('[SessionController] getSessionById error:', error)
    res.status(500).json({
      error: 'Internal server error.',
    })
  }
}
