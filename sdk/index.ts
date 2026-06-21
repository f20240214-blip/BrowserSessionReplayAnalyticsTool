/**
 * SDK Public Entry Point
 *
 * This file is the public API boundary for the Session Replay SDK. It re-exports
 * only the classes, configuration types, and high-level event types that SDK
 * consumers should use. Internal modules (transport, mutations, snapshot,
 * selectors, utils) remain private and are not exported here.
 */

export { SessionRecorder } from './recorder.js'

export type { RecorderConfig } from './config.js'
export { DEFAULT_CONFIG } from './config.js'

// High-level event types for consumers who want to type events or inspect payloads
export type {
  SessionEvent,
  SnapshotEvent,
  ClickEvent,
  ScrollEvent,
  InputEvent,
  NavigationEvent,
  MutationEvent,
} from './types.js'
