import mongoose, { Schema } from 'mongoose';
/**
 * EventSchema maps the Event domain model to MongoDB.
 *
 * The payload is stored as Schema.Types.Mixed because browser SDK events may
 * include arbitrary nested objects, arrays, and primitive values. Using Mixed
 * preserves the payload exactly as produced by the SDK without normalizing or
 * restructuring it.
 */
const EventSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        index: true,
    },
    timestamp: {
        type: Date,
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
    },
    payload: {
        type: Schema.Types.Mixed,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
/**
 * Session and timestamp are indexed because replay and analysis queries usually
 * need to retrieve events for one session in chronological order. The compound
 * index on (sessionId, timestamp) supports those lookups efficiently.
 */
EventSchema.index({ sessionId: 1, timestamp: 1 });
/**
 * All browser event types are stored in a single collection because they share
 * the same ingestion pipeline, replay workflow, and schema shape, with the
 * event type and payload distinguishing the specific event semantics.
 */
/**
 * Reuse an existing model when the module is loaded again during development.
 * This prevents Mongoose from throwing OverwriteModelError when hot reloading
 * or re-importing the model in a long-running process.
 */
const EventModel = mongoose.models.Event ??
    mongoose.model('Event', EventSchema);
/**
 * The Mongoose model exposes CRUD operations such as find(), findOne(),
 * create(), insertMany(), updateOne(), and deleteMany() automatically via the
 * Model class. These are inherited by the model and do not need to be
 * implemented manually in this file.
 */
export default EventModel;
//# sourceMappingURL=Event.js.map