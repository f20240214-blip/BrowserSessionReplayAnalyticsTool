import type { RecorderConfig } from './config.js'
import { mergeConfig } from './config.js'
import { Transport } from './transport.js'
import { captureSnapshot } from './snapshot.js'
import { startMutationTracking } from './mutations.js'
import { getElementSelector } from './selectors.js'
import {
  generateSessionId,
  throttle,
  debugLog,
} from './utils.js'
import type {
  SessionEvent,
  ClickEvent,
  ScrollEvent,
  InputEvent,
  NavigationEvent,
  SnapshotEvent,
  MutationEvent,
} from './types.js'

/**
 * SessionRecorder orchestrates recording: snapshots, mutation tracking,
 * user interaction listeners, and event transport. It keeps concerns separated
 * by delegating networking to `Transport` and DOM serialization to `snapshot`.
 */
export class SessionRecorder {
  private readonly config: Required<RecorderConfig>
  private transport: Transport | null = null
  private sessionId: string | null = null
  private active = false
  private cleanupCallbacks: Array<() => void> = []
  private lastUrl: string = ''

  constructor(userConfig: RecorderConfig) {
    // mergeConfig validates and fills defaults
    this.config = mergeConfig(userConfig)
  }

  /**
   * start begins recording. It is idempotent and will not start twice.
   */
  public start(): void {
    if (this.active) {
      debugLog(this.config.debug, 'Recorder already started; start() is a no-op.')
      return
    }

    this.sessionId = generateSessionId()
    this.active = true
    this.lastUrl = location.href

    this.initializeTransport()
    this.captureInitialSnapshot()
    this.startMutationTracking()
    this.registerClickTracking()
    this.registerScrollTracking()
    this.registerInputTracking()
    this.registerNavigationTracking()

    debugLog(this.config.debug, 'Recording started', { sessionId: this.sessionId })
  }

  /**
   * stop ends recording and runs cleanup for all registered trackers.
   */
  public stop(): void {
    if (!this.active) {
      debugLog(this.config.debug, 'Recorder not active; stop() is a no-op.')
      return
    }

    this.active = false
    this.cleanup()
    if (this.transport) {
      this.transport.disconnect()
      this.transport = null
    }

    debugLog(this.config.debug, 'Recording stopped', { sessionId: this.sessionId })
    this.sessionId = null
  }

  public getSessionId(): string | null {
    return this.sessionId
  }

  public isActive(): boolean {
    return this.active
  }

  /**
   * initializeTransport constructs the Transport instance and connects it.
   * Transport manages its own reconnect/backoff behavior.
   */
  private initializeTransport(): void {
    const endpoint = this.config.endpoint
    this.transport = new Transport({
      endpoint,
      flushIntervalMs: this.config.flushInterval,
      maxQueueSize: this.config.maxQueueSize,
      debug: this.config.debug,
      reconnectBaseDelayMs: this.config.reconnectBaseDelay,
    } as any)

    this.transport.connect()
    this.registerCleanup(() => this.transport && this.transport.disconnect())
  }

  /**
   * captureInitialSnapshot captures a baseline snapshot and enqueues it.
   */
  private captureInitialSnapshot(): void {
    if (!this.sessionId || !this.transport) return

    const snapshot: SnapshotEvent = captureSnapshot(this.sessionId)
    this.transport.enqueue(snapshot)
  }

  /**
   * startMutationTracking starts observer and forwards events to transport.
   */
  private startMutationTracking(): void {
    if (!this.sessionId || !this.transport) return

    const cleanup = startMutationTracking(this.sessionId, (event: MutationEvent) => {
      if (!this.transport) return
      this.transport.enqueue(event as SessionEvent)
    })

    this.registerCleanup(cleanup)
  }

  /**
   * registerClickTracking registers a delegated click listener on document.
   */
  private registerClickTracking(): void {
    if (!this.sessionId || !this.transport) return

    const handler = (ev: MouseEvent): void => {
      const target = ev.target as HTMLElement | null
      if (!target) return

      const selector = getElementSelector(target)

      const clickPayload = {
        selector,
        x: ev.clientX,
        y: ev.clientY,
        elementTag: target.tagName.toLowerCase(),
        textContent: target.textContent ?? undefined,
      } as ClickEvent['payload']

      if (target.id) {
        clickPayload.elementId = target.id
      }

      const classes = target.className ? target.className.split(/\s+/).filter(Boolean) : []
      if (classes.length > 0) {
        clickPayload.classes = classes
      }

      const event: ClickEvent = {
        sessionId: this.sessionId!,
        timestamp: new Date().toISOString(),
        type: 'click',
        payload: clickPayload,
      }

      this.transport!.enqueue(event as SessionEvent)
    }

    document.addEventListener('click', handler, true)
    this.registerCleanup(() => document.removeEventListener('click', handler, true))
  }

  /**
   * registerScrollTracking listens for window scroll events and throttles payloads.
   */
  private registerScrollTracking(): void {
    if (!this.sessionId || !this.transport) return

    const sendScroll = (): void => {
      const event: ScrollEvent = {
        sessionId: this.sessionId!,
        timestamp: new Date().toISOString(),
        type: 'scroll',
        payload: {
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          deltaX: 0,
          deltaY: 0,
        },
      }

      this.transport!.enqueue(event as SessionEvent)
    }

    const throttled = throttle(sendScroll, this.config.flushInterval)
    window.addEventListener('scroll', throttled, { passive: true })
    this.registerCleanup(() => window.removeEventListener('scroll', throttled))
  }

  /**
   * registerInputTracking listens for input events and captures values safely.
   */
  private registerInputTracking(): void {
    if (!this.sessionId || !this.transport) return

    const handler = (ev: Event): void => {
      const target = ev.target as HTMLElement | null
      if (!target) return

      // handle input, textarea, and contenteditable
      let value: string | undefined
      let elementTag = target.tagName.toLowerCase()

      if (target instanceof HTMLInputElement) {
        if (target.type === 'file') return // ignore file inputs
        if (target.type === 'password') {
          value = '***'
        } else {
          value = target.value
        }
      } else if (target instanceof HTMLTextAreaElement) {
        value = target.value
      } else if (target.isContentEditable) {
        value = (target as HTMLElement).innerText
      } else {
        return
      }

      const selector = getElementSelector(target as HTMLElement)

      const inputPayload = {
        selector,
        elementTag,
        value: value ?? '',
        inputType: (target instanceof HTMLInputElement && target.type) || 'input',
      } as InputEvent['payload']

      if ((target as HTMLElement).id) {
        inputPayload.elementId = (target as HTMLElement).id
      }

      const inputClasses = (target as HTMLElement).className
        ? (target as HTMLElement).className.split(/\s+/).filter(Boolean)
        : []
      if (inputClasses.length > 0) {
        inputPayload.classes = inputClasses
      }

      const event: InputEvent = {
        sessionId: this.sessionId!,
        timestamp: new Date().toISOString(),
        type: 'input',
        payload: inputPayload,
      }

      this.transport!.enqueue(event as SessionEvent)
    }

    document.addEventListener('input', handler, true)
    this.registerCleanup(() => document.removeEventListener('input', handler, true))
  }

  /**
   * registerNavigationTracking instruments History API and listens for popstate.
   */
  private registerNavigationTracking(): void {
    if (!this.sessionId || !this.transport) return

    const thisRecorder = this
    const originalPush = history.pushState
    const originalReplace = history.replaceState

    const wrap = (type: 'pushState' | 'replaceState') => {
      return function (this: History, ...args: any[]) {
        const prev = location.href
        const result = (type === 'pushState' ? originalPush : originalReplace).apply(this, args as any)
        const next = location.href

        const event: NavigationEvent = {
          sessionId: thisRecorder.sessionId!,
          timestamp: new Date().toISOString(),
          type: 'navigation',
          payload: {
            from: prev,
            to: next,
            navigationType: type,
          },
        }

        thisRecorder.transport!.enqueue(event as SessionEvent)

        return result
      }
    }

    history.pushState = wrap('pushState') as typeof history.pushState
    history.replaceState = wrap('replaceState') as typeof history.replaceState

    const popHandler = (): void => {
      const prev = this.lastUrl
      const next = location.href
      const event: NavigationEvent = {
        sessionId: this.sessionId!,
        timestamp: new Date().toISOString(),
        type: 'navigation',
        payload: {
          from: prev,
          to: next,
          navigationType: 'popState',
        },
      }

      this.transport!.enqueue(event as SessionEvent)
      this.lastUrl = next
    }

    window.addEventListener('popstate', popHandler)

    this.registerCleanup(() => {
      history.pushState = originalPush
      history.replaceState = originalReplace
      window.removeEventListener('popstate', popHandler)
    })
  }

  /**
   * registerCleanup stores cleanup callbacks to be invoked when recording stops.
   */
  private registerCleanup(fn: () => void): void {
    this.cleanupCallbacks.push(fn)
  }

  /**
   * cleanup executes all registered cleanup callbacks and clears the array.
   */
  private cleanup(): void {
    for (const fn of this.cleanupCallbacks.reverse()) {
      try {
        fn()
      } catch (err) {
        debugLog(this.config.debug, 'Error during cleanup', err)
      }
    }

    this.cleanupCallbacks = []
  }
}

// Export default for convenience
export default SessionRecorder
