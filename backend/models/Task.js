import mongoose from "mongoose"

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String,
        required: false,
        trim: true,
        maxLength: 500
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false,
        default: null
    }
}, { timestamps: true })

taskSchema.post('save', async function(task) {
    const update = {
        $inc: {
            'taskStats.total': 1,
            'taskStats.completed': task.isCompleted ? 1 : 0
        }
    };
    await mongoose.model('User').findByIdAndUpdate(task.user, update)
})

export default mongoose.model('Task', taskSchema);