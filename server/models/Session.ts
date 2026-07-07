import mongoose, { Schema } from 'mongoose'

/**
 * Session represents the server-side metadata for a browser replay session.
 *
 * This model stores summary information used by the ingestion and replay layers,
 * while the individual event documents remain in the Event collection.
 */
export interface Session {
  sessionId: string
  startTime: number
  endTime: number
  duration: number
  eventCount: number
  url?: string
  browser?: string
  device?: string
}

/**
 * SessionDocument represents a persisted Session as a Mongoose document.
 */
export interface SessionDocument extends Session, mongoose.Document {}

const SessionSchema = new Schema<SessionDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    startTime: {
      type: Number,
      required: true,
    },
    endTime: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    eventCount: {
      type: Number,
      required: true,
      default: 0,
    },
    url: {
      type: String,
    },
    browser: {
      type: String,
    },
    device: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const SessionModel =
  (mongoose.models.Session as mongoose.Model<SessionDocument> | undefined) ??
  mongoose.model<SessionDocument>('Session', SessionSchema)

export default SessionModel
