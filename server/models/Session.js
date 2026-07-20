import mongoose, { Schema } from 'mongoose';
const SessionSchema = new Schema({
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
}, {
    timestamps: true,
    versionKey: false,
});
const SessionModel = mongoose.models.Session ??
    mongoose.model('Session', SessionSchema);
export default SessionModel;
//# sourceMappingURL=Session.js.map