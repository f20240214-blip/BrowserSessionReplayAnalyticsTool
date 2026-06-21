/**
 * generateSessionId returns a unique identifier for analytics sessions.
 * It uses the browser's native crypto.randomUUID() when available and falls
 * back to a compact pseudo-random implementation for older browsers.
 */
export function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return generateFallbackUuid()
}

function generateFallbackUuid(): string {
  const hex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  return `${hex()}${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`
}

/**
 * getTimestamp returns the current time in milliseconds.
 * Use this for event timestamps or duration calculations.
 */
export function getTimestamp(): number {
  return Date.now()
}

/**
 * throttle ensures that the wrapped function is invoked at most once per
 * interval. This is useful for expensive event handlers such as scroll or resize.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  intervalMs: number,
): (...args: Parameters<T>) => ReturnType<T> | void {
  let lastCall = 0
  let timeoutId: number | undefined
  let lastArgs: Parameters<T> | null = null

  return function throttled(...args: Parameters<T>): ReturnType<T> | void {
    const now = Date.now()
    lastArgs = args

    const invoke = (): void => {
      lastCall = Date.now()
      timeoutId = undefined
      if (lastArgs) {
        fn(...lastArgs)
        lastArgs = null
      }
    }

    if (now - lastCall >= intervalMs) {
      invoke()
      return undefined
    }

    if (timeoutId === undefined) {
      timeoutId = window.setTimeout(invoke, intervalMs - (now - lastCall))
    }

    return undefined
  }
}

/**
 * debounce delays function invocation until a pause in activity has occurred.
 * This is useful for batching updates after a burst of events.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined

  return function debounced(...args: Parameters<T>): void {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      fn(...args)
    }, delayMs)
  }
}

/**
 * debugLog prints SDK diagnostics when debug mode is enabled.
 * Prefixing messages helps distinguish SDK logs from application logs.
 */
export function debugLog(enabled: boolean, message: string, ...args: unknown[]): void {
  if (!enabled) {
    return
  }

  // eslint-disable-next-line no-console
  console.debug('[SessionReplaySDK]', message, ...args)
}

/**
 * safeStringify serializes values to JSON while handling circular references
 * and other serialization errors gracefully.
 */
export function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value)
  } catch (error) {
    return `[safeStringify failed: ${String(error)}]`
  }
}
