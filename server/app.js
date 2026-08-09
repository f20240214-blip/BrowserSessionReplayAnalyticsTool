import express, {} from 'express';
import cors from 'cors';
import sessionRouter from './routes/sessions.js';
import eventRouter from './routes/events.js';
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
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    // Credentials must be enabled when the browser needs to send cookies or
    // authentication-related cross-origin headers. Browsers will not include
    // those credentials unless the server explicitly allows them.
    credentials: true,
}));
/**
 * The allowed origin is restricted to a single frontend origin instead of
 * using "*" because credentialed CORS requests require an explicit origin.
 * Using a specific origin keeps the backend predictable and avoids exposing
 * the API to arbitrary web clients that could otherwise authenticate or send
 * cookies through the browser.
 */
app.use((req, _res, next) => {
    const startedAt = Date.now();
    _res.on('finish', () => {
        const elapsed = Date.now() - startedAt;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${_res.statusCode} (${elapsed}ms)`);
    });
    next();
});
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
    });
});
app.use('/api/sessions', sessionRouter);
app.use('/api/events', eventRouter);
app.use((_req, res) => {
    res.status(404).json({
        error: 'Route not found',
    });
});
app.use((err, _req, res, _next) => {
    console.error('[Session Replay Backend] Unhandled application error:', err);
    res.status(500).json({
        error: 'Internal server error',
    });
});
export default app;
//# sourceMappingURL=app.js.map