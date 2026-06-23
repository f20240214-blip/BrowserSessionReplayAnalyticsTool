import type { SessionEvent } from './types.js';
export type OverflowPolicy = 'drop-oldest' | 'drop-newest';
export interface TransportConfig {
    endpoint: string;
    flushIntervalMs?: number;
    maxQueueSize?: number;
    overflowPolicy?: OverflowPolicy;
    debug?: boolean;
    reconnectBaseDelayMs?: number;
    reconnectMaxDelayMs?: number;
}
/**
 * Transport is responsible for delivering SessionEvent objects from the recorder
 * to the backend without leaking WebSocket connection details into recorder logic.
 *
 * The class maintains an in-memory queue and periodically flushes events as JSON
 * batches. If the socket is disconnected, events remain queued until reconnection.
 */
export declare class Transport {
    readonly endpoint: string;
    readonly flushIntervalMs: number;
    readonly maxQueueSize: number;
    readonly overflowPolicy: OverflowPolicy;
    readonly debug: boolean;
    readonly reconnectBaseDelayMs: number;
    readonly reconnectMaxDelayMs: number;
    private socket;
    private queue;
    private flushTimerId;
    private reconnectTimerId;
    private currentBackoffMs;
    private requestedDisconnect;
    private unloadHandler;
    constructor(config: TransportConfig);
    /**
     * Connect opens the WebSocket and starts the periodic flush timer.
     * If an existing connection is already open or currently connecting, no-op.
     */
    connect(): void;
    /**
     * Disconnect stops reconnection attempts, clears timers, and closes the socket.
     */
    disconnect(): void;
    /**
     * enqueue adds a SessionEvent to the queue and enforces overflow policy.
     */
    enqueue(event: SessionEvent): void;
    /**
     * Returns the current number of queued events. Useful for diagnostics.
     */
    getQueuedEventCount(): number;
    /**
     * Returns true if the WebSocket connection is currently open.
     */
    isConnected(): boolean;
    private applyOverflowPolicy;
    private startFlushTimer;
    private stopFlushTimer;
    private flushQueuedEvents;
    private sendBatch;
    private logEventBatch;
    private handleSocketOpen;
    private handleSocketMessage;
    private handleSocketError;
    private handleSocketClose;
    private scheduleReconnect;
    private clearReconnectTimer;
    private registerUnloadHandler;
    private unregisterUnloadHandler;
    private handlePageUnload;
    private isSocketOpen;
    private log;
}
//# sourceMappingURL=transport.d.ts.map