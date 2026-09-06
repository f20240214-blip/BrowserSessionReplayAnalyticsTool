export interface Event {
  sessionId: string
  timestamp: string
  type: string
  payload: unknown
}
//frontend API representation of an event