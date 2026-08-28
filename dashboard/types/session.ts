/** Frontend/API representation of a recorded browser session. */
export interface Session {
  sessionId: string;
  startTime: string;
  endTime: string;
  duration: number;
  eventCount: number;
  url?: string;
  browser?: string;
  device?: string;
}