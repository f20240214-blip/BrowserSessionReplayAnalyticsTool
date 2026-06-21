/**
 * RecorderConfig defines all configuration options for the browser session replay SDK.
 * All options are optional except endpoint, which is required at initialization time.
 */
export interface RecorderConfig {
  /**
   * endpoint is the WebSocket URL where the recorder sends session events.
   * This must be a valid WebSocket URI (e.g., "wss://analytics.example.com/replay").
   */
  endpoint: string

  /**
   * flushInterval is the time in milliseconds between event batch flushes.
   * Lower values reduce latency but increase network overhead.
   * Default: 500ms.
   */
  flushInterval?: number

  /**
   * maxQueueSize is the maximum number of events to keep in memory before applying
   * the overflow policy (drop-oldest or drop-newest).
   * Default: 10000 events.
   */
  maxQueueSize?: number

  /**
   * debug enables verbose logging to help diagnose recorder behavior during development.
   * Default: false.
   */
  debug?: boolean

  /**
   * reconnectAttempts is the maximum number of automatic reconnection attempts
   * before giving up. Set to 0 to disable auto-reconnection.
   * Default: 10 attempts.
   */
  reconnectAttempts?: number

  /**
   * reconnectBaseDelay is the initial delay in milliseconds before the first
   * reconnection attempt. Subsequent attempts use exponential backoff.
   * Default: 1000ms.
   */
  reconnectBaseDelay?: number
}

/**
 * DEFAULT_CONFIG provides sensible defaults for all configuration options.
 * These values are used when a user does not explicitly set an option.
 */
export const DEFAULT_CONFIG: Required<Omit<RecorderConfig, 'endpoint'>> = {
  flushInterval: 500,
  maxQueueSize: 10000,
  debug: false,
  reconnectAttempts: 10,
  reconnectBaseDelay: 1000,
}

/**
 * mergeConfig combines partial user-supplied configuration with defaults.
 * User configuration values take precedence over defaults.
 */
export function mergeConfig(userConfig: RecorderConfig): Required<RecorderConfig> {
  validateConfig(userConfig)

  return {
    endpoint: userConfig.endpoint,
    flushInterval: userConfig.flushInterval ?? DEFAULT_CONFIG.flushInterval,
    maxQueueSize: userConfig.maxQueueSize ?? DEFAULT_CONFIG.maxQueueSize,
    debug: userConfig.debug ?? DEFAULT_CONFIG.debug,
    reconnectAttempts: userConfig.reconnectAttempts ?? DEFAULT_CONFIG.reconnectAttempts,
    reconnectBaseDelay: userConfig.reconnectBaseDelay ?? DEFAULT_CONFIG.reconnectBaseDelay,
  }
}

/**
 * validateConfig validates user-supplied configuration and throws descriptive errors
 * if any values are invalid. This is called before merging with defaults.
 */
export function validateConfig(config: RecorderConfig): void {
  if (!config.endpoint || typeof config.endpoint !== 'string') {
    throw new Error('RecorderConfig: endpoint is required and must be a non-empty string.')
  }

  if (config.flushInterval !== undefined) {
    if (typeof config.flushInterval !== 'number' || config.flushInterval <= 0) {
      throw new Error('RecorderConfig: flushInterval must be a positive number (milliseconds).')
    }
  }

  if (config.maxQueueSize !== undefined) {
    if (typeof config.maxQueueSize !== 'number' || config.maxQueueSize <= 0) {
      throw new Error('RecorderConfig: maxQueueSize must be a positive number.')
    }
  }

  if (config.debug !== undefined) {
    if (typeof config.debug !== 'boolean') {
      throw new Error('RecorderConfig: debug must be a boolean.')
    }
  }

  if (config.reconnectAttempts !== undefined) {
    if (typeof config.reconnectAttempts !== 'number' || config.reconnectAttempts < 0) {
      throw new Error('RecorderConfig: reconnectAttempts must be a non-negative number.')
    }
  }

  if (config.reconnectBaseDelay !== undefined) {
    if (typeof config.reconnectBaseDelay !== 'number' || config.reconnectBaseDelay <= 0) {
      throw new Error('RecorderConfig: reconnectBaseDelay must be a positive number (milliseconds).')
    }
  }
}
