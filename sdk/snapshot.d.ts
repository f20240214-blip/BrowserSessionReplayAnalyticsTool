import type { SnapshotEvent } from './types.js';
/**
 * captureSnapshot creates a snapshot event representing the full page state at the
 * moment recording begins. This baseline snapshot is used by replay logic to
 * reconstruct the page before applying subsequent mutation events.
 */
export declare function captureSnapshot(sessionId: string): SnapshotEvent;
//# sourceMappingURL=snapshot.d.ts.map