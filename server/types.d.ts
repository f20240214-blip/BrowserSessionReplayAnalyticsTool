import type { SessionEvent } from '../sdk/types.js';
/**
 * EventBatch represents a batch of events received from the browser SDK.
 * Using this alias improves readability in backend code and makes the
 * intent of payload handling clearer than raw arrays.
 */
export type EventBatch = SessionEvent[];
/**
 * ProcessingResult describes the outcome of processing an EventBatch.
 * It is returned by the server-side processing logic and summarizes
 * validation, persistence, and batch handling results.
 */
export interface ProcessingResult {
    processedEvents: number;
    rejectedEvents: number;
    sessionCreated: boolean;
    processingTime: number;
}
/**
 * BatchMetadata contains server-generated metrics for a received batch.
 * These fields are produced by the ingestion server and are not part of
 * the browser SDK event model.
 */
export interface BatchMetadata {
    /** Time when the server received the batch. */
    receivedAt: Date;
    /** Number of SessionEvent objects contained in the batch. */
    batchSize: number;
    /** Total processing duration in milliseconds. */
    processingTime: number;
    /** Time spent performing MongoDB operations in milliseconds. */
    databaseLatency: number;
}
/**
 * ProcessingContext represents runtime information that is passed through
 * the ingestion pipeline while processing a batch.
 */
export interface ProcessingContext {
    batch: EventBatch;
    metadata: BatchMetadata;
}
/**
 * ValidationResult represents the outcome of validating an incoming batch.
 * This is backend-only because validation takes place after the batch reaches
 * the ingestion server, using server-side rules and trust boundaries.
 */
export interface ValidationResult {
    valid: boolean;
    reason?: string;
}
//# sourceMappingURL=types.d.ts.map