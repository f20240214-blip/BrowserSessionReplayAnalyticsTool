/**
 * Transport is responsible for delivering SessionEvent objects from the recorder
 * to the backend without leaking WebSocket connection details into recorder logic.
 *
 * The class maintains an in-memory queue and periodically flushes events as JSON
 * batches. If the socket is disconnected, events remain queued until reconnection.
 */
export class Transport {
    endpoint;
    flushIntervalMs;
    maxQueueSize;
    overflowPolicy;
    debug;
    reconnectBaseDelayMs;
    reconnectMaxDelayMs;
    socket = null;
    queue = [];
    flushTimerId = null;
    reconnectTimerId = null;
    currentBackoffMs;
    requestedDisconnect = false;
    unloadHandler;
    constructor(config) {
        this.endpoint = config.endpoint;
        this.flushIntervalMs = config.flushIntervalMs ?? 500;
        this.maxQueueSize = config.maxQueueSize ?? 1000;
        this.overflowPolicy = config.overflowPolicy ?? 'drop-oldest';
        this.debug = config.debug ?? false;
        this.reconnectBaseDelayMs = config.reconnectBaseDelayMs ?? 1000;
        this.reconnectMaxDelayMs = config.reconnectMaxDelayMs ?? 30000;
        this.currentBackoffMs = this.reconnectBaseDelayMs;
        this.unloadHandler = this.handlePageUnload.bind(this);
        this.registerUnloadHandler();
    }
    /**
     * Connect opens the WebSocket and starts the periodic flush timer.
     * If an existing connection is already open or currently connecting, no-op.
     */
    connect() {
        if (this.isSocketOpen() || this.socket?.readyState === WebSocket.CONNECTING) {
            this.log('WebSocket already open or connecting; connect() is a no-op.');
            return;
        }
        this.requestedDisconnect = false;
        this.clearReconnectTimer();
        this.startFlushTimer();
        this.socket = new WebSocket(this.endpoint);
        this.socket.addEventListener('open', this.handleSocketOpen);
        this.socket.addEventListener('message', this.handleSocketMessage);
        this.socket.addEventListener('error', this.handleSocketError);
        this.socket.addEventListener('close', this.handleSocketClose);
        this.log('Attempting WebSocket connection to', this.endpoint);
    }
    /**
     * Disconnect stops reconnection attempts, clears timers, and closes the socket.
     */
    disconnect() {
        this.requestedDisconnect = true;
        this.stopFlushTimer();
        this.clearReconnectTimer();
        this.unregisterUnloadHandler();
        if (this.socket) {
            this.socket.removeEventListener('open', this.handleSocketOpen);
            this.socket.removeEventListener('message', this.handleSocketMessage);
            this.socket.removeEventListener('error', this.handleSocketError);
            this.socket.removeEventListener('close', this.handleSocketClose);
            this.socket.close();
            this.socket = null;
        }
    }
    /**
     * enqueue adds a SessionEvent to the queue and enforces overflow policy.
     */
    enqueue(event) {
        if (this.queue.length < this.maxQueueSize) {
            this.queue.push(event);
            this.log('Event queued:', event.type, event.timestamp);
            this.log('Queue size:', this.queue.length);
            console.log("QUEUED EVENT:", event.type);
            return;
        }
        this.applyOverflowPolicy(event);
        this.log('Event queued after overflow policy:', event.type, event.timestamp);
        this.log('Queue size:', this.queue.length);
    }
    /**
     * Returns the current number of queued events. Useful for diagnostics.
     */
    getQueuedEventCount() {
        return this.queue.length;
    }
    /**
     * Returns true if the WebSocket connection is currently open.
     */
    isConnected() {
        return this.isSocketOpen();
    }
    applyOverflowPolicy(event) {
        if (this.overflowPolicy === 'drop-oldest') {
            const dropCount = this.queue.length - this.maxQueueSize + 1;
            if (dropCount > 0) {
                this.queue.splice(0, dropCount);
                this.log(`Queue full; dropped ${dropCount} oldest event(s) to enqueue new event.`);
            }
            this.queue.push(event);
            return;
        }
        if (this.overflowPolicy === 'drop-newest') {
            this.log('Queue full; dropped newest event due to drop-newest overflow policy.');
            return;
        }
    }
    startFlushTimer() {
        if (this.flushTimerId !== null) {
            return;
        }
        this.flushTimerId = window.setInterval(() => {
            this.flushQueuedEvents('timer');
        }, this.flushIntervalMs);
    }
    stopFlushTimer() {
        if (this.flushTimerId !== null) {
            window.clearInterval(this.flushTimerId);
            this.flushTimerId = null;
        }
    }
    flushQueuedEvents(reason = 'manual') {
        if (!this.isSocketOpen()) {
            return;
        }
        if (this.queue.length === 0) {
            return;
        }
        const count = this.queue.length;
        this.log(`Flushing ${count} event(s) due to ${reason}.`);
        const batch = this.queue.splice(0, this.queue.length);
        this.logEventBatch(batch);
        this.sendBatch(batch);
        console.log("FLUSHING", this.queue.length, "events");
    }
    sendBatch(events) {
        if (!this.isSocketOpen()) {
            this.queue.unshift(...events);
            return;
        }
        try {
            this.socket.send(JSON.stringify(events));
            this.log(`Sent batch of ${events.length} event(s).`);
        }
        catch (error) {
            this.log('Failed to send batch; re-queuing events.', error);
            this.queue.unshift(...events);
        }
    }
    logEventBatch(events) {
        if (!this.debug) {
            return;
        }
        // eslint-disable-next-line no-console
        if (typeof console.groupCollapsed === 'function' && typeof console.table === 'function') {
            console.groupCollapsed('[SessionReplaySDK] EVENT BATCH');
            console.table(events.map((event) => ({ type: event.type, timestamp: event.timestamp, payload: event.payload })));
            console.groupEnd();
        }
        else {
            // eslint-disable-next-line no-console
            console.debug('[SessionReplaySDK] EVENT BATCH', events);
        }
    }
    handleSocketOpen = () => {
        this.log('WebSocket connected.');
        this.currentBackoffMs = this.reconnectBaseDelayMs;
        this.clearReconnectTimer();
        this.flushQueuedEvents('manual');
    };
    handleSocketMessage = (event) => {
        this.log('Received WebSocket message:', event.data);
    };
    handleSocketError = (event) => {
        this.log('WebSocket error event received.', event);
    };
    handleSocketClose = () => {
        this.log('WebSocket closed.');
        if (this.requestedDisconnect) {
            return;
        }
        this.scheduleReconnect();
    };
    scheduleReconnect() {
        if (this.reconnectTimerId !== null) {
            return;
        }
        const delay = Math.min(this.currentBackoffMs, this.reconnectMaxDelayMs);
        this.log(`Scheduling reconnect in ${delay}ms.`);
        this.reconnectTimerId = window.setTimeout(() => {
            this.reconnectTimerId = null;
            this.connect();
            this.currentBackoffMs = Math.min(this.currentBackoffMs * 2, this.reconnectMaxDelayMs);
        }, delay);
    }
    clearReconnectTimer() {
        if (this.reconnectTimerId !== null) {
            window.clearTimeout(this.reconnectTimerId);
            this.reconnectTimerId = null;
        }
    }
    registerUnloadHandler() {
        window.addEventListener('beforeunload', this.unloadHandler);
    }
    unregisterUnloadHandler() {
        window.removeEventListener('beforeunload', this.unloadHandler);
    }
    handlePageUnload() {
        this.log('Page unload detected; attempting to flush queued events.');
        if (this.queue.length === 0) {
            return;
        }
        if (this.isSocketOpen()) {
            this.flushQueuedEvents();
            return;
        }
        this.log('Unable to flush queued events on unload because WebSocket is not open.');
    }
    isSocketOpen() {
        return this.socket?.readyState === WebSocket.OPEN;
    }
    log(message, ...args) {
        if (!this.debug) {
            return;
        }
        // eslint-disable-next-line no-console
        console.debug('[SessionReplaySDK]', message, ...args);
    }
}
//# sourceMappingURL=transport.js.map