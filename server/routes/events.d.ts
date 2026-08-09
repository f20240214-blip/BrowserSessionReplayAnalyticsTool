/**
 * Express routers are responsible for translating URL patterns into controller
 * handlers. They remain thin by design so the API boundary can be read as a
 * declarative route map rather than a mix of request parsing, business logic,
 * and persistence concerns.
 *
 * Event retrieval is intentionally separated from session retrieval because the
 * replay engine needs a complete chronological event stream for one session,
 * while session endpoints only return metadata about that recording.
 *
 * This file therefore defines only the HTTP route shape and delegates all
 * processing to the event controller, which is where validation, model access,
 * and response generation belong.
 */
declare const eventRouter: import("express").RouterInterface;
export default eventRouter;
//# sourceMappingURL=events.d.ts.map