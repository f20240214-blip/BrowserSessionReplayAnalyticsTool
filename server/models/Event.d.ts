import mongoose from 'mongoose';
/**
 * Event represents the business/domain model for a single recorded browser event.
 *
 * This interface describes only the event data needed by the ingestion and
 * analytics layers, and it remains independent of any database technology.
 * It intentionally does not include MongoDB-specific fields or methods.
 */
export interface Event {
    sessionId: string;
    timestamp: number;
    type: string;
    payload: unknown;
}
/**
 * EventDocument represents how an Event exists as a MongoDB document.
 *
 * It extends both the domain Event interface and mongoose.Document so that each
 * stored event inherits persistence methods such as save(), validate(),
 * toObject(), and other Mongoose document behaviors.
 */
export interface EventDocument extends Event, mongoose.Document {
}
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
declare const EventModel: mongoose.Model<EventDocument, {}, {}, {}, mongoose.Document<unknown, {}, EventDocument, {}, mongoose.DefaultSchemaOptions> & EventDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, EventDocument>;
/**
 * The Mongoose model exposes CRUD operations such as find(), findOne(),
 * create(), insertMany(), updateOne(), and deleteMany() automatically via the
 * Model class. These are inherited by the model and do not need to be
 * implemented manually in this file.
 */
export default EventModel;
//# sourceMappingURL=Event.d.ts.map