import mongoose from "mongoose"

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    color: {
        type: String,
        default: 'blue'
    },
    timeSpent: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema)

