import { WebSocketServer } from 'ws';
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
export declare function createWebSocketServer(port: number): WebSocketServer;
/**
 * startWebSocketServer begins listening on a port and tracks the active server
 * instance so it can be cleanly stopped during graceful shutdown.
 */
export declare function startWebSocketServer(port: number): WebSocketServer;
/**
 * stopWebSocketServer stops the active WebSocket server if it exists.
 *
 * This is used during graceful shutdown to stop accepting new connections
 * without performing any business logic or message handling.
 */
export declare function stopWebSocketServer(): Promise<void>;
//# sourceMappingURL=websocket.d.ts.map