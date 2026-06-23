/**
 * generateSessionId returns a unique identifier for analytics sessions.
 * It uses the browser's native crypto.randomUUID() when available and falls
 * back to a compact pseudo-random implementation for older browsers.
 */
export function generateSessionId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return generateFallbackUuid();
}
function generateFallbackUuid() {
    const hex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}
/**
 * getTimestamp returns the current time in milliseconds.
 * Use this for event timestamps or duration calculations.
 */
export function getTimestamp() {
    return Date.now();
}
/**
 * throttle ensures that the wrapped function is invoked at most once per
 * interval. This is useful for expensive event handlers such as scroll or resize.
 */
export function throttle(fn, intervalMs) {
    let lastCall = 0;
    let timeoutId;
    let lastArgs = null;
    return function throttled(...args) {
        const now = Date.now();
        lastArgs = args;
        const invoke = () => {
            lastCall = Date.now();
            timeoutId = undefined;
            if (lastArgs) {
                fn(...lastArgs);
                lastArgs = null;
            }
        };
        if (now - lastCall >= intervalMs) {
            invoke();
            return undefined;
        }
        if (timeoutId === undefined) {
            timeoutId = window.setTimeout(invoke, intervalMs - (now - lastCall));
        }
        return undefined;
    };
}
/**
 * debounce delays function invocation until a pause in activity has occurred.
 * This is useful for batching updates after a burst of events.
 */
export function debounce(fn, delayMs) {
    let timeoutId;
    return function debounced(...args) {
        if (timeoutId !== undefined) {
            window.clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
            fn(...args);
        }, delayMs);
    };
}
/**
 * debugLog prints SDK diagnostics when debug mode is enabled.
 * Prefixing messages helps distinguish SDK logs from application logs.
 */
export function debugLog(enabled, message, ...args) {
    if (!enabled) {
        return;
    }
    // eslint-disable-next-line no-console
    console.debug('[SessionReplaySDK]', message, ...args);
}
/**
 * safeStringify serializes values to JSON while handling circular references
 * and other serialization errors gracefully.
 */
export function safeStringify(value) {
    try {
        return JSON.stringify(value);
    }
    catch (error) {
        return `[safeStringify failed: ${String(error)}]`;
    }
}
//# sourceMappingURL=utils.js.map