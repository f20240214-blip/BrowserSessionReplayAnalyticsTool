import { Router } from 'express';
import { getSessions, getSessionById, } from '../Controllers/sessionController.js';
/**
 * Express routers exist to translate HTTP request paths into controller
 * handlers without carrying business logic or data-access responsibilities.
 * This keeps the REST layer thin, easy to read, and easy to evolve as the API
 * surface changes.
 *
 * The session routes support the replay dashboard by exposing the two public
 * operations it needs most often: listing available recorded sessions and
 * retrieving the metadata for one specific recording session.
 *
 * Keeping this file free of business logic means it only declares route shape
 * and delegates request handling to controller functions, which are responsible
 * for orchestration, validation, and response formatting.
 */
const sessionRouter = Router();
sessionRouter.get('/', getSessions);
sessionRouter.get('/:sessionId', getSessionById);
export default sessionRouter;
//# sourceMappingURL=sessions.js.map