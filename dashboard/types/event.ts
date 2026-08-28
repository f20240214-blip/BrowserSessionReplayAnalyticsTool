export interface Event {
  sessionId: string
  timestamp: Date
  type: string
  payload: unknown
}
//frontend API representation of an event