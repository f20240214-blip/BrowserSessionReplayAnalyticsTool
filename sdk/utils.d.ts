/**
 * generateSessionId returns a unique identifier for analytics sessions.
 * It uses the browser's native crypto.randomUUID() when available and falls
 * back to a compact pseudo-random implementation for older browsers.
 */
export declare function generateSessionId(): string;
/**
 * getTimestamp returns the current time in milliseconds.
 * Use this for event timestamps or duration calculations.
 */
export declare function getTimestamp(): number;
/**
 * throttle ensures that the wrapped function is invoked at most once per
 * interval. This is useful for expensive event handlers such as scroll or resize.
 */
export declare function throttle<T extends (...args: unknown[]) => unknown>(fn: T, intervalMs: number): (...args: Parameters<T>) => ReturnType<T> | void;
/**
 * debounce delays function invocation until a pause in activity has occurred.
 * This is useful for batching updates after a burst of events.
 */
export declare function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delayMs: number): (...args: Parameters<T>) => void;
/**
 * debugLog prints SDK diagnostics when debug mode is enabled.
 * Prefixing messages helps distinguish SDK logs from application logs.
 */
export declare function debugLog(enabled: boolean, message: string, ...args: unknown[]): void;
/**
 * safeStringify serializes values to JSON while handling circular references
 * and other serialization errors gracefully.
 */
export declare function safeStringify(value: unknown): string;
//# sourceMappingURL=utils.d.ts.map