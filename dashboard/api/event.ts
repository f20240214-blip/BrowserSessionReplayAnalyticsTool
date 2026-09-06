import { get } from './client.js'
import type { Event } from '../types/event.js'

export async function getSessionEvents(sessionId: string): Promise<Event[]> {
	return get<Event[]>(`/api/events/${sessionId}/events`)
}