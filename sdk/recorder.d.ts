import type { RecorderConfig } from './config.js';
/**
 * SessionRecorder orchestrates recording: snapshots, mutation tracking,
 * user interaction listeners, and event transport. It keeps concerns separated
 * by delegating networking to `Transport` and DOM serialization to `snapshot`.
 */
export declare class SessionRecorder {
    private readonly config;
    private transport;
    private sessionId;
    private active;
    private cleanupCallbacks;
    private lastUrl;
    constructor(userConfig: RecorderConfig);
    /**
     * start begins recording. It is idempotent and will not start twice.
     */
    start(): void;
    /**
     * stop ends recording and runs cleanup for all registered trackers.
     */
    stop(): void;
    getSessionId(): string | null;
    isActive(): boolean;
    /**
     * initializeTransport constructs the Transport instance and connects it.
     * Transport manages its own reconnect/backoff behavior.
     */
    private initializeTransport;
    /**
     * captureInitialSnapshot captures a baseline snapshot and enqueues it.
     */
    private captureInitialSnapshot;
    /**
     * startMutationTracking starts observer and forwards events to transport.
     */
    private startMutationTracking;
    /**
     * registerClickTracking registers a delegated click listener on document.
     */
    private registerClickTracking;
    /**
     * registerScrollTracking listens for window scroll events and throttles payloads.
     */
    private registerScrollTracking;
    /**
     * registerInputTracking listens for input events and captures values safely.
     */
    private registerInputTracking;
    /**
     * registerNavigationTracking instruments History API and listens for popstate.
     */
    private registerNavigationTracking;
    /**
     * registerCleanup stores cleanup callbacks to be invoked when recording stops.
     */
    private registerCleanup;
    /**
     * cleanup executes all registered cleanup callbacks and clears the array.
     */
    private cleanup;
}
export default SessionRecorder;
//# sourceMappingURL=recorder.d.ts.map