import mongoose from 'mongoose';
/**
 * connectMongoDB establishes a shared mongoose connection for the backend.
 *
 * Using a single shared connection avoids duplicate connection pools, reduces
 * resource usage, and ensures all data access layers share the same database
 * lifecycle. This file does not define schemas or execute queries; it only
 * manages the connection itself.
 */
export declare function connectMongoDB(uri: string): Promise<typeof mongoose>;
/**
 * disconnectMongoDB closes the shared mongoose connection cleanly.
 *
 * Graceful shutdown is important because it ensures pending operations have
 * a chance to finish and frees database resources without leaving orphaned
 * connections behind.
 */
export declare function disconnectMongoDB(): Promise<void>;
//# sourceMappingURL=mongodb.d.ts.map