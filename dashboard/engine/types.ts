export interface ReplaySession {
  sessionId: string
  snapshot: SnapshotEvent
  events: SessionEvent[]
}

export interface SnapshotEvent {
  type: 'snapshot'
  timestamp: number
  payload: {
    html: string
  }
}

export interface SessionEvent {
  type: string
  timestamp: number
  payload: unknown
}

export interface ReplayState {
  currentTime: number
  isPlaying: boolean
  speed: number
}