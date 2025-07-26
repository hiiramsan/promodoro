import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema({
    focusTime: {
        type: Number,
        default: 25*60
    }, 
    shortBreakTime: {
        type: Number,
        default: 5*60,
    }, 
    longBreakTime: {
        type: Number,
        default: 15*60
    },
    sessionsUntilLongBreak: {
        type:Number,
        default:4
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
    }
});

export default mongoose.model('Preferences', preferencesSchema);