import { get } from './client.js'
import type { Session } from '../types/session.js'

export async function getSession(): Promise<Session[]> {
    return get<Session[]>('/api/sessions/')
}

export async function getSessionById(sessionId: string): Promise<Session> {
    return get<Session>(`/api/sessions/${sessionId}`)
}