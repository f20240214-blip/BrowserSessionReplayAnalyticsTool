import type { MutationEvent } from './types.js';
/**
 * startMutationTracking observes DOM changes after the initial snapshot and
 * converts MutationRecords into serializable MutationEvent objects for replay.
 *
 * The MutationObserver watches for:
 * - childList changes (nodes added/removed)
 * - attribute changes (including style)
 * - characterData changes (text node updates)
 *
 * Mutations from <script> and <noscript> elements are ignored because they are
 * not part of the page structure that replay systems need to reconstruct.
 *
 * Returns a cleanup function that disconnects the observer.
 */
export declare function startMutationTracking(sessionId: string, onEvent: (event: MutationEvent) => void): () => void;
//# sourceMappingURL=mutations.d.ts.map