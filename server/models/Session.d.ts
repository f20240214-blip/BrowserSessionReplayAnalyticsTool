import mongoose from 'mongoose';
/**
 * Session represents the server-side metadata for a browser replay session.
 *
 * This model stores summary information used by the ingestion and replay layers,
 * while the individual event documents remain in the Event collection.
 */
export interface Session {
    sessionId: string;
    startTime: number;
    endTime: number;
    duration: number;
    eventCount: number;
    url?: string;
    browser?: string;
    device?: string;
}
/**
 * SessionDocument represents a persisted Session as a Mongoose document.
 */
export interface SessionDocument extends Session, mongoose.Document {
}
declare const SessionModel: mongoose.Model<SessionDocument, {}, {}, {}, mongoose.Document<unknown, {}, SessionDocument, {}, mongoose.DefaultSchemaOptions> & SessionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, SessionDocument>;
export default SessionModel;
//# sourceMappingURL=Session.d.ts.map