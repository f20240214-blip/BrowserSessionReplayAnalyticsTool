export interface BrowserInfo {
  userAgent: string
  platform: string
  language: string
  viewportWidth: number
  viewportHeight: number
}

export interface SessionMetadata {
  sessionId: string
  startedAt: string
  endedAt?: string
  url: string
  title: string
  browser: BrowserInfo
  referrer?: string
}

export interface BaseEvent<T extends string, P> {
  sessionId: string
  timestamp: string
  type: T
  payload: P
}

export interface SnapshotEventPayload {
  dom: string
  scrollX: number
  scrollY: number
  width: number
  height: number
}

export interface ClickEventPayload {
  selector?: string
  x: number
  y: number
  elementTag: string
  elementId?: string
  classes?: string[]
  textContent?: string
}

export interface ScrollEventPayload {
  scrollX: number
  scrollY: number
  deltaX: number
  deltaY: number
}

export interface InputEventPayload {
  selector?: string
  elementTag: string
  elementId?: string
  classes?: string[]
  value: string
  inputType: string
}

export interface NavigationEventPayload {
  from: string
  to: string
  navigationType: 'pushState' | 'replaceState' | 'popState' | 'hashChange' | 'linkClick'
}

export interface MutationEventPayload {
  mutationType: 'attributes' | 'characterData' | 'childList'
  targetSelector: string
  attributeName?: string
  oldValue?: string | null
  newValue?: string | null
  addedNodes?: string[]
  removedNodes?: string[]
}

export type SnapshotEvent = BaseEvent<'snapshot', SnapshotEventPayload>
export type ClickEvent = BaseEvent<'click', ClickEventPayload>
export type ScrollEvent = BaseEvent<'scroll', ScrollEventPayload>
export type InputEvent = BaseEvent<'input', InputEventPayload>
export type NavigationEvent = BaseEvent<'navigation', NavigationEventPayload>
export type MutationEvent = BaseEvent<'mutation', MutationEventPayload>

export type SessionEvent =
  | SnapshotEvent
  | ClickEvent
  | ScrollEvent
  | InputEvent
  | NavigationEvent
  | MutationEvent
