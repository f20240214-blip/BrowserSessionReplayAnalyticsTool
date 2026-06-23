/**
 * DEFAULT_CONFIG provides sensible defaults for all configuration options.
 * These values are used when a user does not explicitly set an option.
 */
export const DEFAULT_CONFIG = {
    flushInterval: 500,
    maxQueueSize: 10000,
    debug: true,
    reconnectAttempts: 10,
    reconnectBaseDelay: 1000,
};
/**
 * mergeConfig combines partial user-supplied configuration with defaults.
 * User configuration values take precedence over defaults.
 */
export function mergeConfig(userConfig) {
    validateConfig(userConfig);
    return {
        endpoint: userConfig.endpoint,
        flushInterval: userConfig.flushInterval ?? DEFAULT_CONFIG.flushInterval,
        maxQueueSize: userConfig.maxQueueSize ?? DEFAULT_CONFIG.maxQueueSize,
        debug: userConfig.debug ?? DEFAULT_CONFIG.debug,
        reconnectAttempts: userConfig.reconnectAttempts ?? DEFAULT_CONFIG.reconnectAttempts,
        reconnectBaseDelay: userConfig.reconnectBaseDelay ?? DEFAULT_CONFIG.reconnectBaseDelay,
    };
}
/**
 * validateConfig validates user-supplied configuration and throws descriptive errors
 * if any values are invalid. This is called before merging with defaults.
 */
export function validateConfig(config) {
    if (!config.endpoint || typeof config.endpoint !== 'string') {
        throw new Error('RecorderConfig: endpoint is required and must be a non-empty string.');
    }
    if (config.flushInterval !== undefined) {
        if (typeof config.flushInterval !== 'number' || config.flushInterval <= 0) {
            throw new Error('RecorderConfig: flushInterval must be a positive number (milliseconds).');
        }
    }
    if (config.maxQueueSize !== undefined) {
        if (typeof config.maxQueueSize !== 'number' || config.maxQueueSize <= 0) {
            throw new Error('RecorderConfig: maxQueueSize must be a positive number.');
        }
    }
    if (config.debug !== undefined) {
        if (typeof config.debug !== 'boolean') {
            throw new Error('RecorderConfig: debug must be a boolean.');
        }
    }
    if (config.reconnectAttempts !== undefined) {
        if (typeof config.reconnectAttempts !== 'number' || config.reconnectAttempts < 0) {
            throw new Error('RecorderConfig: reconnectAttempts must be a non-negative number.');
        }
    }
    if (config.reconnectBaseDelay !== undefined) {
        if (typeof config.reconnectBaseDelay !== 'number' || config.reconnectBaseDelay <= 0) {
            throw new Error('RecorderConfig: reconnectBaseDelay must be a positive number (milliseconds).');
        }
    }
}
//# sourceMappingURL=config.js.map