/**
 * RecorderConfig defines all configuration options for the browser session replay SDK.
 * All options are optional except endpoint, which is required at initialization time.
 */
export interface RecorderConfig {
    /**
     * endpoint is the WebSocket URL where the recorder sends session events.
     * This must be a valid WebSocket URI (e.g., "wss://analytics.example.com/replay").
     */
    endpoint: string;
    /**
     * flushInterval is the time in milliseconds between event batch flushes.
     * Lower values reduce latency but increase network overhead.
     * Default: 500ms.
     */
    flushInterval?: number;
    /**
     * maxQueueSize is the maximum number of events to keep in memory before applying
     * the overflow policy (drop-oldest or drop-newest).
     * Default: 10000 events.
     */
    maxQueueSize?: number;
    /**
     * debug enables verbose logging to help diagnose recorder behavior during development.
     * Default: true.
     */
    debug?: boolean;
    /**
     * reconnectAttempts is the maximum number of automatic reconnection attempts
     * before giving up. Set to 0 to disable auto-reconnection.
     * Default: 10 attempts.
     */
    reconnectAttempts?: number;
    /**
     * reconnectBaseDelay is the initial delay in milliseconds before the first
     * reconnection attempt. Subsequent attempts use exponential backoff.
     * Default: 1000ms.
     */
    reconnectBaseDelay?: number;
}
/**
 * DEFAULT_CONFIG provides sensible defaults for all configuration options.
 * These values are used when a user does not explicitly set an option.
 */
export declare const DEFAULT_CONFIG: Required<Omit<RecorderConfig, 'endpoint'>>;
/**
 * mergeConfig combines partial user-supplied configuration with defaults.
 * User configuration values take precedence over defaults.
 */
export declare function mergeConfig(userConfig: RecorderConfig): Required<RecorderConfig>;
/**
 * validateConfig validates user-supplied configuration and throws descriptive errors
 * if any values are invalid. This is called before merging with defaults.
 */
export declare function validateConfig(config: RecorderConfig): void;
//# sourceMappingURL=config.d.ts.map