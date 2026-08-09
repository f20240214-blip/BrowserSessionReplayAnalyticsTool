import { type Request, type Response } from 'express';
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
export declare function getSessions(_req: Request, res: Response): Promise<void>;
/**
 * Handle GET /sessions/:sessionId.
 *
 * Reads the route parameter from Express, validates its presence, then asks
 * the Session model to resolve the matching document using Mongoose's
 * findOne() API. The controller is responsible for turning a model result into
 * the corresponding HTTP response.
 */
export declare function getSessionById(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=sessionController.d.ts.map