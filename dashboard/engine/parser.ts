import type { Event } from '../types/event.js'
import type { ReplaySession, SessionEvent, SnapshotEvent } from './types.js'

function normalizeTimestamp(timestamp: unknown): number {
	if (typeof timestamp === 'number' && Number.isFinite(timestamp)) {
		return timestamp
	}

	if (typeof timestamp !== 'string' || timestamp.trim() === '') {
		throw new Error('Replay event is missing a timestamp')
	}

	// const numericTimestamp = Number(timestamp)
	// if (Number.isFinite(numericTimestamp)) {
	// 	return numericTimestamp
	// }

	const parsedTimestamp = Date.parse(timestamp)
	if (Number.isFinite(parsedTimestamp)) {
		return parsedTimestamp
	}

	throw new Error(`Replay event has an invalid timestamp: ${timestamp}`)
}

export function parseReplaySession(
	sessionId: string,
	events: Event[],
): ReplaySession {
	try {
		const normalizedEvents: SessionEvent[] = events.map((event) => ({
			type: event.type,
			timestamp: normalizeTimestamp(event.timestamp),
			payload: event.payload,
		}))

		const snapshot = normalizedEvents.find(
			(event) => event.type === 'snapshot',
		) as SnapshotEvent | undefined

		if (!snapshot) {
			throw new Error('Replay session is missing a snapshot event')
		}

		return {
			sessionId,
			snapshot,
			events: normalizedEvents.filter((event) => event !== snapshot),
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Invalid replay data'
		console.error(`Failed to parse replay session: ${message}`)
		throw error
	}
}
