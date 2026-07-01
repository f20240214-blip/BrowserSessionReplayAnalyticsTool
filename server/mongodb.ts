import mongoose from 'mongoose'

/**
 * connectMongoDB establishes a shared mongoose connection for the backend.
 *
 * Using a single shared connection avoids duplicate connection pools, reduces
 * resource usage, and ensures all data access layers share the same database
 * lifecycle. This file does not define schemas or execute queries; it only
 * manages the connection itself.
 */
export async function connectMongoDB(uri: string): Promise<typeof mongoose> {
  try {
    const connection = await mongoose.connect(uri)
    console.log('[SessionReplayServer] MongoDB connection established')
    return connection
  } catch (error) {
    console.error('[SessionReplayServer] MongoDB connection failed', error)
    throw error
  }
}

/**
 * disconnectMongoDB closes the shared mongoose connection cleanly.
 *
 * Graceful shutdown is important because it ensures pending operations have
 * a chance to finish and frees database resources without leaving orphaned
 * connections behind.
 */
export async function disconnectMongoDB(): Promise<void> {
  try {
    await mongoose.connection.close()
    console.log('[SessionReplayServer] MongoDB connection closed')
  } catch (error) {
    console.error('[SessionReplayServer] MongoDB disconnect failed', error)
    throw error
  }
}
