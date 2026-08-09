import { type Request, type Response } from 'express';
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
 * This controller validates the route parameter, confirms the parent session
 * exists in the Session model, then asks the Event model to load every event
 * for the requested session. The results are sorted chronologically so the
 * replay engine receives the same order the browser recorded them.
 */
export declare function getSessionEvents(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=eventController.d.ts.map