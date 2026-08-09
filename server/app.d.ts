/**
 * app.ts is intentionally separated from index.ts because the entry point is
 * responsible for infrastructure startup and shutdown. It connects MongoDB,
 * starts the WebSocket server, binds the HTTP port, and handles graceful
 * termination. app.ts should remain a pure application configuration module so
 * it can be reused without performing any process, database, or socket setup.
 *
 * Keeping Express configuration isolated from infrastructure startup makes the
 * codebase easier to test, reason about, and evolve, because route registration
 * and middleware are kept independent from lifecycle concerns.
 *
 * Centralized middleware such as logging, 404 handling, and error handling
 * improves maintainability by ensuring one consistent request policy applies
 * across the API instead of repeating the same behavior in every route.
 */
declare const app: import("express").Application;
export default app;
//# sourceMappingURL=app.d.ts.map