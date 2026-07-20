import type { EventBatch, ProcessingResult } from '../types.js';
/**
 * processEventBatch coordinates validation, session lifecycle updates, and bulk
 * event persistence for an incoming batch.
 *
 * This file is the business logic layer of the ingestion server because it
 * decides whether a batch is acceptable, how session metadata evolves, and how
 * events are persisted efficiently without directly defining schemas.
 */
export declare function processEventBatch(batch: EventBatch): Promise<ProcessingResult>;
//# sourceMappingURL=eventprocessor.d.ts.map